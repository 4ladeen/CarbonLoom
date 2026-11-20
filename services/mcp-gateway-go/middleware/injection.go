package middleware

import (
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
)

var injectionPatterns = []*regexp.Regexp{
	regexp.MustCompile(`(?i)ignore\s+(all\s+)?(previous|prior)\s+instructions`),
	regexp.MustCompile(`(?i)you\s+are\s+now\s+(an?\s+)?(unrestricted|jailbroken|system)`),
	regexp.MustCompile(`(?i)(system\s*prompt|system\s*directive|override\s*rules)`),
	regexp.MustCompile(`(?i)(disregard\s+(the\s+above|everything|trade-secret)|forget\s+everything)`),
	regexp.MustCompile(`(?i)(output\s+all\s+passwords|dump\s+database|exfiltrate)`),
}

// SanitizeUntrustedDocumentContent inspects input text for adversarial instruction injections
func SanitizeUntrustedDocumentContent(rawText string) (string, bool) {
	detected := false
	cleaned := rawText

	for _, pattern := range injectionPatterns {
		if pattern.MatchString(cleaned) {
			detected = true
			cleaned = pattern.ReplaceAllString(cleaned, "[SECURITY_STRIPPED_POTENTIAL_INJECTION]")
		}
	}
	return cleaned, detected
}

func PromptInjectionFirewall() fiber.Handler {
	return func(c *fiber.Ctx) error {
		body := string(c.Body())
		if body == "" {
			return c.Next()
		}

		cleaned, injectionFound := SanitizeUntrustedDocumentContent(body)
		if injectionFound {
			// Replace body with sanitized payload and log alert
			c.Request().SetBody([]byte(cleaned))
			c.Locals("injection_attempt_detected", true)
		} else {
			c.Locals("injection_attempt_detected", false)
		}

		return c.Next()
	}
}
