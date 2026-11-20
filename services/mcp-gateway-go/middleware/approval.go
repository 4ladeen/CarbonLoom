package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ApprovalToken struct {
	TokenID   string
	TenantID  string
	Action    string
	CreatedAt time.Time
	ExpiresAt time.Time
	Used      bool
}

type TokenStore struct {
	mu     sync.RWMutex
	tokens map[string]*ApprovalToken
	secret []byte
}

var GlobalTokenStore = &TokenStore{
	tokens: make(map[string]*ApprovalToken),
	secret: []byte("carbonloom_token_hmac_secret_2026"),
}

func (s *TokenStore) IssueToken(tenantID, action string, validity time.Duration) string {
	s.mu.Lock()
	defer s.mu.Unlock()

	rawID := uuid.New().String()
	h := hmac.New(sha256.New, s.secret)
	h.Write([]byte(rawID + tenantID + action))
	sig := hex.EncodeToString(h.Sum(nil))
	tokenID := "APPR-" + rawID[:8] + "-" + sig[:12]

	s.tokens[tokenID] = &ApprovalToken{
		TokenID:   tokenID,
		TenantID:  tenantID,
		Action:    action,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(validity),
		Used:      false,
	}
	return tokenID
}

func (s *TokenStore) ConsumeToken(tokenID, tenantID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	tok, exists := s.tokens[tokenID]
	if !exists {
		return false
	}
	if tok.Used || time.Now().After(tok.ExpiresAt) || tok.TenantID != tenantID {
		return false
	}
	tok.Used = true // Single-use guarantee
	return true
}

// ApprovalGateMiddleware checks for valid approval_token_id on mutating / write operations
func ApprovalGateMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		server := c.Params("server")
		
		// Write servers that mandate approval
		isWriteServer := server == "report-compliance" || server == "cmms-supplier" || server == "trust-zk-ledger"
		if !isWriteServer {
			return c.Next()
		}

		tokenID := c.Get("X-Approval-Token-ID")
		tenantID, _ := c.Locals("tenant_id").(string)

		if tokenID == "" {
			return c.Status(fiber.StatusPreconditionRequired).JSON(fiber.Map{
				"error": "Single-use Human Approval Token required for write MCP server: " + server,
				"action_required": "emit_approval_card",
			})
		}

		if !GlobalTokenStore.ConsumeToken(tokenID, tenantID) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Approval token is invalid, expired, or already consumed",
			})
		}

		c.Locals("approval_token_id", tokenID)
		return c.Next()
	}
}
