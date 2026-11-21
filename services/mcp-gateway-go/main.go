package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/carbonloom/mcp-gateway/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "carbonloom_default_jwt_secret_2026"
	}

	app := fiber.New(fiber.Config{
		AppName:      "CarbonLoom Zero-Trust Go MCP Gateway v2.0",
		ServerHeader: "CarbonLoom-Gateway",
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "*",
	}))
	app.Use(logger.New())

	// Public health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":   "healthy",
			"service":  "carbonloom-mcp-gateway",
			"version":  "2.0.0",
			"protocol": "Model Context Protocol (MCP) Streamable HTTP",
			"security": "Presidio Redaction + Prompt Firewall + SHA-256 Audit Chain Active",
		})
	})

	// Issue approval token for testing / human approval flows
	app.Post("/api/v1/approvals/issue", func(c *fiber.Ctx) error {
		var req struct {
			TenantID string `json:"tenant_id"`
			Action   string `json:"action"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
		}
		token := middleware.GlobalTokenStore.IssueToken(req.TenantID, req.Action, 10*time.Minute)
		return c.JSON(fiber.Map{
			"approval_token_id": token,
			"valid_minutes":     10,
		})
	})

	// Query hash-chained audit log
	app.Get("/api/v1/audit/chain", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"total_events": len(middleware.GlobalAuditLogger.Append("", "", "", "", "", "", "", 0, 0).CurrentHash),
			"audit_log":    middleware.GlobalAuditLogger,
		})
	})

	// Governed MCP tool routing group
	mcpGroup := app.Group("/mcp/:server/:tool")
	mcpGroup.Use(middleware.JWTAuthMiddleware(jwtSecret))
	mcpGroup.Use(middleware.RBACMiddleware())
	mcpGroup.Use(middleware.PresidioRedactionMiddleware())
	mcpGroup.Use(middleware.PromptInjectionFirewall())
	mcpGroup.Use(middleware.ApprovalGateMiddleware())
	mcpGroup.Use(middleware.AuditMiddleware())

	mcpGroup.Post("/", func(c *fiber.Ctx) error {
		server := c.Params("server")
		tool := c.Params("tool")
		tenantID := c.Locals("tenant_id")
		traceID := c.Locals("trace_id")

		// Return simulated / governed MCP response
		return c.JSON(fiber.Map{
			"jsonrpc": "2.0",
			"result": fiber.Map{
				"server":        server,
				"tool":          tool,
				"tenant_id":     tenantID,
				"trace_id":      traceID,
				"status":        "executed_under_governance",
				"data_quality":  "simulated",
				"audit_chained": true,
			},
		})
	})

	fmt.Printf("CarbonLoom Zero-Trust Go MCP Gateway listening on :%s\n", port)
	log.Fatal(app.Listen(":" + port))
}
