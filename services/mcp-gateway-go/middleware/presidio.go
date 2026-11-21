package middleware

import (
	"regexp"

	"github.com/gofiber/fiber/v2"
)

// Regex patterns for sensitive Bangladesh and international PII and commercial secrets
var (
	// Bangladesh NID (10, 13, or 17 digits)
	nidRegex = regexp.MustCompile(`\b\d{10}\b|\b\d{13}\b|\b\d{17}\b`)
	// Bangladesh Phone Number (+8801... or 01...)
	phoneRegex = regexp.MustCompile(`(\+?8801[3-9]\d{8}|01[3-9]\d{8})`)
	// Bank Account / Routing Number patterns
	bankAccRegex = regexp.MustCompile(`\b(?:A\/C|Account|Acc|IBAN)[:\s#]*[A-Z0-9]{8,20}\b`)
	// Commercial price & margin leaks: "unit cost: $1.20", "margin: 18%"
	priceLeakRegex = regexp.MustCompile(`(?i)(unit\s*cost|unit\s*price|profit\s*margin|fob\s*price|commercial\s*rate)[\s:=]+[\$€৳BDT\d.,]+`)
)

// RedactSensitiveText replaces identified PII and trade secrets with redaction markers
func RedactSensitiveText(input string) string {
	res := input
	res = phoneRegex.ReplaceAllString(res, "[REDACTED_PHONE]")
	res = bankAccRegex.ReplaceAllString(res, "[REDACTED_BANK_ACCOUNT]")
	res = priceLeakRegex.ReplaceAllString(res, "[REDACTED_COMMERCIAL_SECRET]")
	return res
}

func PresidioRedactionMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		body := string(c.Body())
		if body == "" {
			return c.Next()
		}

		redacted := RedactSensitiveText(body)
		if redacted != body {
			c.Request().SetBody([]byte(redacted))
			c.Locals("pii_redacted", true)
		} else {
			c.Locals("pii_redacted", false)
		}

		return c.Next()
	}
}
