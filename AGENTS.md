# CarbonLoom — Agent Build Standards & Operating Procedures (AGENTS.md)

**Scope:** Monorepo engineering standards for AI agents, multi-agent swarms, and human developers.

---

## 1. Coding Standards by Language

### Python (`services/api/`, `services/rag/`, `services/agents/`, `mcp/*/`, `sim/`, `eval/`)
- **Version:** Python 3.11+
- **Framework:** FastAPI with async routes, Pydantic v2 `BaseModel` schemas with strict validation.
- **Type Safety:** 100% type annotations (`mypy --strict` compliant).
- **Style & Linting:** `ruff check .` and `ruff format .`
- **Imports:** Absolute imports from module root (e.g., `from services.api.core.scope1 import calculate_scope1`).
- **Testing:** `pytest` with `pytest-asyncio` and `pytest-cov`. Target 90%+ code coverage for carbon math.

### Go (`services/mcp-gateway-go/`, `fabric/chaincode/`)
- **Version:** Go 1.22+
- **Framework:** Fiber v2 or Go stdlib `net/http` for sub-25ms p95 latency.
- **Linting:** `golangci-lint run ./...`
- **Error Handling:** Explicit error checking; no unhandled panics or ignored error returns.
- **Security:** Standard library crypto (`crypto/sha256`, `crypto/ed25519`, `crypto/hmac`).

### TypeScript & React (`apps/web/`, `apps/buyer-portal/`, `apps/verifier-workspace/`)
- **Framework:** Next.js 15 (App Router), React 19, TypeScript strict mode.
- **Styling:** Tailwind CSS with CSS Variables mapped to design tokens (`tokens.css`).
- **Visuals:** Apache ECharts (`echarts-for-react`) for high-density industrial telemetry.
- **Client Verifier:** `snarkjs` browser bundle for Groth16 ZK proof verification in < 200ms.
- **Testing:** `vitest` for component and utility testing; Playwright for end-to-end user journeys.

---

## 2. Forbidden Actions

1. ❌ **DO NOT use an LLM for numeric calculations.** No prompt should ever ask an LLM to sum kWh, multiply by emission factors, or calculate percentages.
2. ❌ **DO NOT leak PII or commercial secrets.** Unit prices, margin calculations, supplier TINs, and worker identities must never reach cloud LLM endpoints.
3. ❌ **DO NOT present simulated data as real pilot data.** All synthetic outputs from `sim/` must carry `data_quality: "simulated"`.
4. ❌ **DO NOT write to production stores without an Approval Token.** Write operations on MCP servers require single-use tokens issued by human supervisors.
5. ❌ **DO NOT bypass Row-Level Security (RLS).** Every SQL query must execute within a session where `app.current_tenant` is set.
6. ❌ **DO NOT use emojis as interface icons.** Use Lucide React line icons exclusively per Unslop/Hallmark guidelines.

---

## 3. Test & Verification Commands

```bash
# Deterministic Carbon Engine tests (0.00% arithmetic tolerance)
pytest services/api/tests/ -v

# Digital Twin Factory Simulator tests
pytest sim/tests/ -v

# Go MCP Gateway tests
cd services/mcp-gateway-go && go test -v ./...

# Circom ZK circuit tests (6 adversarial witness vectors)
npm run test:circuits

# Frontend lint & build checks
npm run lint
npm run build
```

---

## 4. Module Status Labeling Check

When completing or updating a module, verify:
- If unit tests pass and lineage is logged -> Label `[Implemented]`
- If code is written but waiting on full integration/tests -> Label `[In progress]`
- If architecture is outlined but code is pending -> Label `[Designed]`
