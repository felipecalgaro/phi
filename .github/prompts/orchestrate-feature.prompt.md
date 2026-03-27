---
agent: orchestrator
description: "Run an end-to-end orchestrated implementation by delegating to planner, then operator."
---

Implement this feature with orchestrated delegation:

${input:feature_request:Describe the feature to implement end-to-end}

Use the `orchestrator` agent workflow:

1. **Planner Phase**: Delegate to `planner` agent to create implementation plan at `.github/plans/{auto-increment}-{name}.md`.
   - Planner chooses technologies prioritizing: simplicity > security > low cost.
   - Accounts for low traffic (≤200 users/month).
   - Return plan file path.

2. **Operator Phase**: Delegate to `operator` agent with plan file path.
   - Operator implements per plan and design rules.
   - Follows Next.js best practices and TailwindCSS-only styling.
   - Return implementation results.

3. **Integration**: Validate contract compatibility, run checks, report results.

Refer to:

- `.github/copilot-instructions.md` for design rules and architecture.
- `.github/agents/orchestrator.agent.md` for execution model.
- `.github/agents/planner.agent.md` for planning discipline.
- `.github/agents/operator.agent.md` for implementation requirements.
