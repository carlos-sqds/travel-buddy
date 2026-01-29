---
name: apex:setup-lsp
description: >
  Configure LSP support for code intelligence.
  TRIGGER ON: lsp (LSP, language server, code intelligence, autocomplete, setup LSP, configure LSP).
required_tool_calls:
  - tool: Execute
    reason: "Check for LSP binary availability (which typescript-language-server, etc.)"
---

# Setup LSP Skill

Configure Language Server Protocol (LSP) support for the project.

## Harness Differences

| Harness | LSP Integration | Overhead |
|---------|-----------------|----------|
| Claude Code | Native plugins (no MCP) | Minimal |
| Factory Droid | MCP bridge (mcp-language-server) | Moderate |

## When to Invoke

- User says "LSP", "language server", "code intelligence"
- User says "setup LSP", "configure LSP", "enable autocomplete"
- User mentions language server configuration or code navigation

## When NOT to Use

- For general code editing → LSP is optional enhancement
- When LSP is already configured → no need to reconfigure
- For languages without LSP support → inform user of limitations
- In Claude Code (native plugins) → LSP bridge not needed

---

## Detection Flow

### 1. Scan Project Structure

Check for language indicator files:

**TypeScript/JavaScript:**
- `tsconfig.json`, `tsconfig.base.json`
- `package.json` with TypeScript dependencies
- Files with `.ts`, `.tsx`, `.mts`, `.cts` extensions

**Rust:**
- `Cargo.toml`, `Cargo.lock`
- Files with `.rs` extension

### 2. Check Binary Availability

For each detected language, verify the required LSP binary is installed:

```bash
# TypeScript
which typescript-language-server

# Rust
which rust-analyzer

# MCP Bridge (Factory Droid only)
which mcp-language-server
```

### 3. Prompt for Installation

If a binary is missing, present options to the user:

```
TypeScript detected in your project, but typescript-language-server is not installed.

How would you like to proceed?
  [1] Install now (pnpm add -g typescript-language-server typescript)
  [2] Skip TypeScript LSP for now
  [3] Show manual installation instructions
```

**Installation commands by package manager:**

TypeScript:
- npm: `npm install -g typescript-language-server typescript`
- pnpm: `pnpm add -g typescript-language-server typescript`
- yarn: `yarn global add typescript-language-server typescript`

Rust:
- rustup: `rustup component add rust-analyzer`
- brew: `brew install rust-analyzer`
- cargo: `cargo install rust-analyzer`

MCP Bridge (for Factory Droid):
- go: `go install github.com/isaacphi/mcp-language-server@latest`

### 4. Generate Configuration

After detection and installation, generate the appropriate configuration:

**For Claude Code** (`.claude/settings.json`):
```json
{
  "enabledPlugins": {
    "typescript-lsp@claude-plugins-official": true,
    "rust-analyzer-lsp@claude-plugins-official": true
  }
}
```

Claude Code uses native LSP plugins - no MCP wrapper needed. Add to shell profile:
```bash
export ENABLE_LSP_TOOL=1
```

**For Factory Droid** (`.factory/mcp.json`):
```json
{
  "mcpServers": {
    "typescript-lsp": {
      "type": "stdio",
      "command": "mcp-language-server",
      "args": ["--lsp", "typescript-language-server", "--", "--stdio"]
    },
    "rust-lsp": {
      "type": "stdio",
      "command": "mcp-language-server",
      "args": ["--lsp", "rust-analyzer"]
    }
  }
}
```

## Factory Droid MCP Bridge

Factory Droid uses MCP (Model Context Protocol) servers instead of native plugins. The `mcp-language-server` Go binary bridges LSP servers to MCP.

**Repository**: github.com/isaacphi/mcp-language-server
- 1.4k+ stars, BSD-3-Clause license
- Supports: TypeScript, Rust, Python, Go, C/C++

**Installation** (requires Go):
```bash
go install github.com/isaacphi/mcp-language-server@latest
```

If the MCP bridge is not installed, prompt the user to install it when configuring Factory Droid.

## Monorepo Support

For monorepos with multiple languages:

1. Scan all subdirectories for language indicators
2. Check for workspace configuration:
   - `pnpm-workspace.yaml`
   - `Cargo.toml` with `[workspace]` section
   - `lerna.json`
3. Enable all relevant LSPs at the root level
4. LSPs handle workspace discovery automatically

## Configuration Files

The skill manages these files:

| File | Purpose |
|------|---------|
| `.claude/settings.apex.json` | Framework-managed Claude settings |
| `.claude/settings.project.json` | Project overrides (optional) |
| `.claude/settings.json` | Final merged settings |
| `.factory/mcp.apex.json` | Framework-managed Factory settings |
| `.factory/mcp.project.json` | Project overrides (optional) |
| `.factory/mcp.json` | Final merged MCP config |

## Project Overrides

Projects can customize LSP configuration by creating override files:

**Claude Code** (`.claude/settings.project.json`):
```json
{
  "disabledPlugins": ["rust-analyzer-lsp@claude-plugins-official"],
  "enabledPlugins": ["go-lsp@claude-plugins-official"]
}
```

**Factory Droid** (`.factory/mcp.project.json`):
```json
{
  "disabledServers": ["rust-lsp"],
  "mcpServers": {
    "go-lsp": {
      "type": "stdio",
      "command": "mcp-language-server",
      "args": ["--lsp", "gopls"]
    }
  }
}
```

## CLI Integration

This skill integrates with the `apex` CLI:

```bash
# Run LSP sync (detect and configure)
apex sync

# Preview changes without writing
apex sync --dry-run

# Sync specific harness only
apex sync --harness claude
apex sync --harness factory
```

## Output Format

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before presenting LSP setup results, emit context header:    ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: Configure LSP for {detected languages}               ║
║  │ GOAL: Enable code intelligence for development             ║
║  │ PHASE: apex:setup-lsp → next: {install|configure|done}     ║
║  └─────────────────────────────────────────────────────────   ║
║                                                               ║
║  This helps engineers returning to parallel sessions          ║
║  understand what this agent is working on and why.            ║
╚═══════════════════════════════════════════════════════════════╝
</gate_context_header>

## Output Example

After setup completes, display a summary:

```
LSP Configuration Complete

Detected languages:
  - TypeScript (tsconfig.json found)
  - Rust (Cargo.toml found)

Enabled LSPs:
  - typescript-lsp@claude-plugins-official
  - rust-analyzer-lsp@claude-plugins-official

Configuration updated:
  - .claude/settings.json
  - .factory/mcp.json

Note: Restart your coding assistant for changes to take effect.
```

## Troubleshooting

### Binary not found after installation

If the binary is installed but not found:
1. Check that the installation directory is in `$PATH`
2. For global npm packages: `npm config get prefix` should be in PATH
3. For rustup: ensure `~/.cargo/bin` is in PATH

### LSP not working after configuration

1. Restart the coding assistant (Claude Code or Factory Droid)
2. Verify the plugin is enabled: check settings.json for the plugin ID
3. Check for errors in the LSP output

### MCP bridge issues (Factory Droid)

1. Ensure `mcp-language-server` is installed globally
2. Verify the LSP binary path is correct
3. Check Factory Droid's MCP server logs for errors

---

## Skill Reflection (End of Skill)

<gate_skill_reflection>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Skill Self-Improvement Reflection                      ║
║                                                               ║
║  After completing this skill's workflow, reflect:             ║
║                                                               ║
║  1. Did the skill instructions lead to the goal efficiently?  ║
║  2. Were there unnecessary steps or missing guidance?         ║
║  3. Could better wording have reduced confusion or tokens?    ║
║  4. What patterns emerged that should be captured?            ║
║                                                               ║
║  If improvements identified → Call apex:reflect with:         ║
║  "Skill improvement: apex:setup-lsp - [specific suggestion]"  ║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
