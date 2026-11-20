package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

// AllowedRolesPerTool maps MCP tool names to authorized user roles
var AllowedRolesPerTool = map[string][]string{
	// Read-only tools (Module A, B, C, E)
	"query_readings":          {"admin", "sustainability_manager", "energy_engineer", "floor_supervisor", "verifier"},
	"list_meters":             {"admin", "sustainability_manager", "energy_engineer", "floor_supervisor", "verifier"},
	"get_baseline":            {"admin", "sustainability_manager", "energy_engineer"},
	"reconcile_meter_vs_bill": {"admin", "sustainability_manager", "energy_engineer", "cfo", "verifier"},
	"detect_sensor_tamper":    {"admin", "energy_engineer", "verifier"},
	"get_orders":              {"admin", "sustainability_manager", "cfo", "verifier"},
	"get_production":          {"admin", "sustainability_manager", "energy_engineer", "verifier"},
	"get_smv":                 {"admin", "sustainability_manager", "energy_engineer"},
	"get_fiber_or_alloy_bom":  {"admin", "sustainability_manager", "verifier"},
	"get_shipment_tonnage":    {"admin", "sustainability_manager", "cfo", "buyer", "verifier"},
	"get_factor":              {"admin", "sustainability_manager", "energy_engineer", "cfo", "buyer", "verifier"},
	"list_sources":            {"admin", "sustainability_manager", "energy_engineer", "verifier", "buyer"},
	"hybrid_graph_search":     {"admin", "sustainability_manager", "energy_engineer", "verifier"},
	"resolve_hs_cbam_rules":   {"admin", "sustainability_manager", "cfo", "buyer", "verifier"},
	"query_espr_readiness":    {"admin", "sustainability_manager", "buyer", "verifier"},
	"check_greenwashing_claim":{"admin", "sustainability_manager", "buyer"},

	// Approval-Gated Write tools (Module E, F, H)
	"build_iso_report":         {"admin", "sustainability_manager"},
	"export_pdf_xlsx":          {"admin", "sustainability_manager", "cfo"},
	"export_cbam_xml":          {"admin", "sustainability_manager", "cfo"},
	"generate_dpp_jsonld":      {"admin", "sustainability_manager"},
	"autofill_buyer_rfp":       {"admin", "sustainability_manager"},
	"create_maintenance_ticket":{"admin", "energy_engineer", "floor_supervisor"},
	"dispatch_tier2_bangla_link":{"admin", "sustainability_manager"},
	"anchor_fabric_record":     {"admin", "sustainability_manager", "verifier"},
	"generate_groth16_proof":   {"admin", "sustainability_manager", "verifier"},
	"verify_proof_and_anchor":  {"admin", "sustainability_manager", "buyer", "verifier"},
	"revoke_record":            {"admin", "verifier"},
	"grant_buyer_access":       {"admin", "sustainability_manager", "cfo"},
}

func RBACMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, ok := c.Locals("role").(string)
		if !ok || role == "" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "No role associated with request context",
			})
		}

		// Superadmin bypass
		if role == "admin" || role == "platform_admin" {
			return c.Next()
		}

		toolName := c.Params("tool")
		if toolName == "" {
			return c.Next()
		}

		allowedRoles, exists := AllowedRolesPerTool[toolName]
		if !exists {
			// If not strictly registered, allow read tools, block writes
			if strings.HasPrefix(toolName, "get_") || strings.HasPrefix(toolName, "query_") || strings.HasPrefix(toolName, "list_") {
				return c.Next()
			}
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Tool execution restricted or unregistered",
			})
		}

		for _, r := range allowedRoles {
			if r == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Role '" + role + "' is not permitted to invoke tool '" + toolName + "'",
		})
	}
}
