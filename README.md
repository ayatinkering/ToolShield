# ToolShield

> **Implementation-Aware Security Proxy for Model Context Protocol (MCP) Servers**  
> *Tool descriptions are claims. ToolShield verifies implementation evidence before execution.*

---

## Overview

**ToolShield** is a zero-trust, implementation-aware security proxy designed for Model Context Protocol (MCP) servers. Traditional AI agent security relies heavily on natural language tool descriptions or coarse permissions. ToolShield inspects the actual Python source code of MCP tools using static AST parsing and taint tracking, enforcing pre-dispatch security policies before any gated tool payload reaches target process execution.

---

## Problem Statement

When AI agents integrate with external tools via Model Context Protocol (MCP), tool descriptions (`tools/list`) claim what a tool does, but cannot guarantee how it is implemented:
1. **Tool Description Claims vs. Code Reality:** A weather tool may claim to fetch forecasts, but its source code exfiltrates environment secrets (`os.getenv("API_KEY")`) over an HTTP POST request.
2. **Dynamic Rug-Pulls:** An initially benign MCP server can be updated to introduce exfiltration or shell execution sinks without changing its metadata description.
3. **Execution Gate Failures:** Traditional proxies log or filter network calls *after* or *during* subprocess execution. Once payload bytes hit the target subprocess `stdin`, code execution occurs.

---

## The ToolShield Approach

ToolShield introduces an **Implementation-Aware Execution Gate**:

```text
[ AI Client ] ---> [ ToolShield Proxy Gate ] ---> ( BLOCK: 0 Bytes Written )
                          │
                  [ AST Scanner & Taint ]
                          │
                     [ Policy Engine ]
                          │
                     ALLOW / REVIEW / BLOCK
```

- **Zero Execution on BLOCK Invariant:** When ToolShield returns `BLOCK`, 0 bytes of the gated tool call are written to target `stdin`, guaranteeing 0 target handler execution count.
- **Bounded Python AST Analysis:** Static taint propagation tracks variable assignments, dict building, string formatting, and function calls from sensitive sources (`ENV_READ`, `SECRET_READ`) to dangerous sinks (`NETWORK_OUTBOUND`, `PROCESS_EXEC`, `FILE_WRITE`).
- **Rug-Pull Hash Fingerprinting:** Canonical SHA-256 baseline hashing monitors both tool metadata and implementation source code trees for drift.

---

## Security Policy Rules (S001 - S009)

| Rule ID | Rule Name | Severity | Default Verdict | Description |
| :--- | :--- | :--- | :--- | :--- |
| **S001** | `SECRET_TO_EXTERNAL_NETWORK` | CRITICAL | **BLOCK** | Secret source (env/file) flows into network POST/GET sink |
| **S002** | `CREDENTIAL_TO_PROCESS_EXECUTION` | CRITICAL | **BLOCK** | Secret source flows into process/shell execution sink |
| **S003** | `SECRET_TO_SENSITIVE_FILE_WRITE` | CRITICAL | **BLOCK** | Secret source written to disk file sink |
| **S004** | `CAPABILITY_DRIFT` | HIGH | **REVIEW** | Tool exhibits capabilities undeclared in policy |
| **S005** | `ANALYSIS_FAILED` | CRITICAL | **BLOCK** | AST parsing failed for target Python server |
| **S006** | `ANALYSIS_INCOMPLETE` | MEDIUM | **REVIEW** | Source file exceeds AST node or resource bounds |
| **S007** | `BASELINE_CHANGED` | MEDIUM | **REVIEW** | Source tree or metadata hash differs from saved baseline |
| **S008** | `CRITICAL_RUG_PULL` | CRITICAL | **BLOCK** | Baseline mutation introduced critical secret flow |
| **S009** | `IDENTITY_AMBIGUITY` | MEDIUM | **REVIEW** | Multiple tools share identical name or mapping |

---

## Folder Structure

```text
ToolShield/
├── src/toolshield/
│   ├── api/            # FastAPI Control Plane REST endpoints
│   ├── baseline/       # BaselineStore & SHA-256 fingerprinting
│   ├── cli/            # Typer CLI application
│   ├── graph/          # Text & DOT graph renderers
│   ├── models/         # Pydantic v2 data models
│   ├── policy/         # Security policy evaluation engine (S001-S009)
│   ├── proxy/          # JSON-RPC router & StdioProxyGate execution gate
│   └── scanner/        # Bounded AST parser, import resolver & taint engine
├── test_lab/           # Demo MCP servers (benign, suspicious, malicious, rug-pull)
├── tests/              # Comprehensive unit, API, and zero-execution integration tests
├── web/                # Vite + React + TypeScript web documentation & demo UI
├── pyproject.toml      # Project configuration & dependencies
├── Dockerfile          # Container build definition
└── docker-compose.yml  # Docker compose service setup
```

---

## Quickstart & Installation

```bash
# Clone repository
git clone https://github.com/ayatinkering/ToolShield.git
cd ToolShield

# Create virtual environment and install
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

---

## CLI Usage

```bash
# Print ToolShield version
toolshield version

# Scan Python source root for capabilities & taint flows
toolshield scan test_lab

# Launch target MCP server behind ToolShield stdio proxy
toolshield proxy --source-root test_lab -- python test_lab/malicious_weather_server.py

# Compare baseline files for drift
toolshield diff --baseline baseline.json --current current.json

# Display taint flow graph (text or DOT format)
toolshield graph test_lab --format text

# Launch interactive demo scenarios
toolshield demo malicious-weather

# Start FastAPI control plane API
toolshield serve --host 127.0.0.1 --port 8000
```

---

## Interactive Web UI & Control Plane

ToolShield includes a light-themed web interface under `web/` providing interactive documentation, scenario walkthroughs, and security rule reference.
