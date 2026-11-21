package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuditEvent struct {
	Index           int64     `json:"index"`
	TraceID         string    `json:"trace_id"`
	TenantID        string    `json:"tenant_id"`
	CallerAgent     string    `json:"caller_agent"`
	Server          string    `json:"server"`
	Tool            string    `json:"tool"`
	ArgsSHA256      string    `json:"args_sha256"`
	ApprovalTokenID string    `json:"approval_token_id"`
	LatencyMS       int64     `json:"latency_ms"`
	PayloadBytes    int       `json:"payload_bytes"`
	Timestamp       time.Time `json:"timestamp"`
	PreviousHash    string    `json:"previous_hash"`
	CurrentHash     string    `json:"current_hash"`
}

type HashChainAuditLogger struct {
	mu           sync.Mutex
	currentIndex int64
	lastHash     string
	history      []*AuditEvent
}

var GlobalAuditLogger = &HashChainAuditLogger{
	currentIndex: 0,
	lastHash:     "0000000000000000000000000000000000000000000000000000000000000000",
	history:      make([]*AuditEvent, 0),
}

func (l *HashChainAuditLogger) Append(
	traceID, tenantID, callerAgent, server, tool, argsHash, tokenID string,
	latencyMS int64, payloadBytes int,
) *AuditEvent {
	l.mu.Lock()
	defer l.mu.Unlock()

	l.currentIndex++
	now := time.Now().UTC()

	payload := fmt.Sprintf("%d|%s|%s|%s|%s|%s|%s|%s|%d|%s|%s",
		l.currentIndex, traceID, tenantID, callerAgent, server, tool, argsHash,
		tokenID, latencyMS, now.Format(time.RFC3339Nano), l.lastHash,
	)
	hashBytes := sha256.Sum256([]byte(payload))
	currentHash := hex.EncodeToString(hashBytes[:])

	evt := &AuditEvent{
		Index:           l.currentIndex,
		TraceID:         traceID,
		TenantID:        tenantID,
		CallerAgent:     callerAgent,
		Server:          server,
		Tool:            tool,
		ArgsSHA256:      argsHash,
		ApprovalTokenID: tokenID,
		LatencyMS:       latencyMS,
		PayloadBytes:    payloadBytes,
		Timestamp:       now,
		PreviousHash:    l.lastHash,
		CurrentHash:     currentHash,
	}

	l.lastHash = currentHash
	l.history = append(l.history, evt)
	return evt
}

func AuditMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		traceID := c.Get("X-Trace-ID")
		if traceID == "" {
			traceID = uuid.New().String()
		}
		c.Locals("trace_id", traceID)

		// Compute args sha256
		body := c.Body()
		argsHash := sha256.Sum256(body)
		argsHashStr := hex.EncodeToString(argsHash[:])

		err := c.Next()

		latency := time.Since(start).Milliseconds()
		tenantID, _ := c.Locals("tenant_id").(string)
		callerAgent := c.Get("X-Caller-Agent")
		if callerAgent == "" {
			callerAgent = "langgraph_supervisor"
		}
		server := c.Params("server")
		tool := c.Params("tool")
		tokenID, _ := c.Locals("approval_token_id").(string)

		GlobalAuditLogger.Append(
			traceID, tenantID, callerAgent, server, tool,
			argsHashStr, tokenID, latency, len(body),
		)

		return err
	}
}
