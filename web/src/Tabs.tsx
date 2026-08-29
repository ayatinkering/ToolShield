import React, { useState } from 'react';

export function InstallationTab() {
  return (
    <div>
      <div className="card">
        <h1 className="hero-title">Installation & Setup</h1>
        <p className="hero-subtitle">
          Get ToolShield running in seconds across Linux, macOS, or Windows with automated installation scripts.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--mint-green)' }}>Linux / macOS Installer</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Run the one-line curl installation script:</p>
          <pre>{`curl -sSL https://raw.githubusercontent.com/ayatinkering/ToolShield/main/install.sh | bash`}</pre>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--mint-green)' }}>Windows PowerShell</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Run the PowerShell setup command:</p>
          <pre>{`iwr -useb https://raw.githubusercontent.com/ayatinkering/ToolShield/main/install.ps1 | iex`}</pre>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Uninstallers</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>To remove ToolShield binaries and clean paths:</p>
          <pre>{`# Linux / macOS
curl -sSL https://raw.githubusercontent.com/ayatinkering/ToolShield/main/uninstall.sh | bash`}</pre>
        </div>

        <div className="card" style={{ border: '1px solid var(--mint-green)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--mint-green)' }}>VS Code Extension (.vsix)</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Download the pre-compiled VS Code extension for inline MCP guardgate diagnostics.
          </p>
          <a
            href="https://github.com/ayatinkering/ToolShield/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            style={{ display: 'inline-block', textAlign: 'center' }}
          >
            Download toolshield-0.2.0.vsix
          </a>
        </div>
      </div>
    </div>
  );
}

export function DocsTab() {
  return (
    <div>
      <div className="card">
        <h1 className="hero-title">Command Reference & Security Rules</h1>
        <p className="hero-subtitle">
          Comprehensive CLI reference and complete S001-S009 Policy Rules matrix enforced by the AST scanner and execution gate.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>CLI Command Cards</h2>
        <div className="grid-2">
          <div style={{ background: '#000', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--mint-green)', marginBottom: '8px' }}>toolshield scan</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Scan Python source root for capabilities & taint flows</p>
            <pre>{`toolshield scan test_lab`}</pre>
          </div>
          <div style={{ background: '#000', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--mint-green)', marginBottom: '8px' }}>toolshield proxy</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Launch MCP server behind stdio proxy execution gate</p>
            <pre>{`toolshield proxy --source-root test_lab -- python server.py`}</pre>
          </div>
          <div style={{ background: '#000', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--mint-green)', marginBottom: '8px' }}>toolshield diff</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Compare baseline JSON files for implementation drift</p>
            <pre>{`toolshield diff -b baseline.json -c current.json`}</pre>
          </div>
          <div style={{ background: '#000', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--mint-green)', marginBottom: '8px' }}>toolshield graph</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Display taint flow tree graph (text or dot format)</p>
            <pre>{`toolshield graph test_lab --format text`}</pre>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>S001 - S009 Policy Rules Reference</h2>
        <table className="rule-table">
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Rule Name</th>
              <th>Verdict</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>S001</strong></td>
              <td>SECRET_TO_EXTERNAL_NETWORK</td>
              <td><span className="badge badge-block">BLOCK</span></td>
              <td>Secret source (env/file) flows directly into network POST/GET sink</td>
            </tr>
            <tr>
              <td><strong>S002</strong></td>
              <td>CREDENTIAL_TO_PROCESS_EXECUTION</td>
              <td><span className="badge badge-block">BLOCK</span></td>
              <td>Secret source flows into process/shell execution sink</td>
            </tr>
            <tr>
              <td><strong>S003</strong></td>
              <td>SECRET_TO_SENSITIVE_FILE_WRITE</td>
              <td><span className="badge badge-block">BLOCK</span></td>
              <td>Secret source written to disk file sink</td>
            </tr>
            <tr>
              <td><strong>S004</strong></td>
              <td>CAPABILITY_DRIFT</td>
              <td><span className="badge badge-review">REVIEW</span></td>
              <td>Tool exhibits capabilities undeclared in policy definition</td>
            </tr>
            <tr>
              <td><strong>S005</strong></td>
              <td>ANALYSIS_FAILED</td>
              <td><span className="badge badge-block">BLOCK</span></td>
              <td>AST parsing failed for target Python server source code</td>
            </tr>
            <tr>
              <td><strong>S006</strong></td>
              <td>ANALYSIS_INCOMPLETE</td>
              <td><span className="badge badge-review">REVIEW</span></td>
              <td>Source file exceeds AST node or resource bounds</td>
            </tr>
            <tr>
              <td><strong>S007</strong></td>
              <td>BASELINE_CHANGED</td>
              <td><span className="badge badge-review">REVIEW</span></td>
              <td>Source tree or metadata hash differs from saved baseline</td>
            </tr>
            <tr>
              <td><strong>S008</strong></td>
              <td>CRITICAL_RUG_PULL</td>
              <td><span className="badge badge-block">BLOCK</span></td>
              <td>Baseline mutation introduced critical secret flow</td>
            </tr>
            <tr>
              <td><strong>S009</strong></td>
              <td>IDENTITY_AMBIGUITY</td>
              <td><span className="badge badge-review">REVIEW</span></td>
              <td>Multiple tools share identical name or mapping</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SolutionTab() {
  return (
    <div>
      <div className="card">
        <h1 className="hero-title">Executive Solution Report</h1>
        <p className="hero-subtitle">
          Implementation-Aware Security for Model Context Protocol (MCP) Ecosystems.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px', color: 'var(--mint-green)' }}>1. The Problem</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          MCP tool descriptions are claims, not evidence. A tool claiming to return weather forecasts can secretly exfiltrate API keys over network POST requests or spawn shell processes. Traditional proxies filter text or network traffic *during* or *after* process execution, permitting zero-day payload execution.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px', color: 'var(--mint-green)' }}>2. Proposed Technical Solution</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          ToolShield sits as a stdio proxy gate between AI Agent clients and child MCP server processes. Before forwarding any gated tool call (`tools/call`), ToolShield statically parses the Python AST, resolves import aliases, propagates secret taint flows, and evaluates security rules S001-S009.
        </p>
        <pre>{`[ AI Client ] ---> [ ToolShield Proxy Gate ] ---> ( BLOCK: 0 Target Bytes Written )
                          │
                  [ AST Scanner & Taint ]
                          │
                     [ Policy Engine ]
                          │
                     ALLOW / REVIEW / BLOCK`}</pre>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '16px', color: 'var(--mint-green)' }}>3. Literature Review & Prior Work</h2>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>OWASP Top 10 for MCP (2025/2026):</strong> Identifies Tool Poisoning and Secret Exfiltration as top threat vectors.</li>
          <li><strong>DevSecOps Tool Poisoning Research:</strong> Highlights how innocent-looking utility tools manipulate agent context.</li>
          <li><strong>ResearchGate Web3 MCP Security Survey (2026):</strong> Emphasizes cryptographic baseline hashing for supply chain tool updates.</li>
          <li><strong>arXiv:2608.11878:</strong> Static Analysis for LLM Tool Chaining Safety.</li>
          <li><strong>arXiv:2608.04053:</strong> Zero-Trust Execution Gates in Model Context Protocols.</li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '16px', color: 'var(--mint-green)' }}>4. Comparative Analysis Matrix</h2>
        <table className="rule-table">
          <thead>
            <tr>
              <th>Feature / Metric</th>
              <th>ToolShield</th>
              <th>MCPITP</th>
              <th>Sharelock</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Pre-Dispatch Execution Gate</strong></td>
              <td><span className="badge badge-allow">YES (0 Bytes)</span></td>
              <td>NO (Runtime)</td>
              <td>NO (Prompt Filter)</td>
            </tr>
            <tr>
              <td><strong>AST Taint Analysis</strong></td>
              <td><span className="badge badge-allow">YES (Source &rarr; Sink)</span></td>
              <td>NO</td>
              <td>NO</td>
            </tr>
            <tr>
              <td><strong>Rug-Pull SHA-256 Hashes</strong></td>
              <td><span className="badge badge-allow">YES (Meta & Code)</span></td>
              <td>Partial</td>
              <td>NO</td>
            </tr>
            <tr>
              <td><strong>Protocol Purity</strong></td>
              <td><span className="badge badge-allow">100% Stdio Pure</span></td>
              <td>Mixed</td>
              <td>N/A</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DemoTab() {
  const [activeScenario, setActiveScenario] = useState('malicious-weather');

  return (
    <div>
      <div className="card">
        <h1 className="hero-title">Pitch Script & Live Demo</h1>
        <p className="hero-subtitle">
          2-Minute Pitch Speech Script, Demo Command Matrix, and Zero-Execution BLOCK Proof Logs.
        </p>
      </div>

      <div className="card" style={{ border: '1px solid var(--mint-green)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--mint-green)' }}>2-Minute Pitch Speech Script</h2>
        <blockquote style={{ fontStyle: 'italic', color: 'var(--text-secondary)', paddingLeft: '16px', borderLeft: '3px solid var(--mint-green)', lineHeight: '1.8' }}>
          "Judges, when AI agents use tools via MCP, tool descriptions are claims, not evidence. A weather tool claims to return forecasts, but its Python code reads environment secrets and posts them to an attacker server. Traditional security monitors logs after or during execution. Once bytes touch target stdin, code runs. ToolShield changes the paradigm: we parse Python AST source code statically before execution. If our Policy Engine detects a secret-to-network taint flow (Rule S001), ToolShield returns BLOCK, writing exactly ZERO bytes to target stdin and keeping target execution count at ZERO. ToolShield delivers verifiable zero-trust security for agentic tool execution."
        </blockquote>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>Zero-Execution BLOCK Proof Log Viewer</h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className={`nav-btn ${activeScenario === 'malicious-weather' ? 'active' : ''}`} onClick={() => setActiveScenario('malicious-weather')}>
            malicious-weather (S001 BLOCK)
          </button>
          <button className={`nav-btn ${activeScenario === 'suspicious-backup' ? 'active' : ''}`} onClick={() => setActiveScenario('suspicious-backup')}>
            suspicious-backup (S004 REVIEW)
          </button>
          <button className={`nav-btn ${activeScenario === 'rug-pull' ? 'active' : ''}`} onClick={() => setActiveScenario('rug-pull')}>
            rug-pull (S008 BLOCK)
          </button>
        </div>

        <pre style={{ background: '#000', color: 'var(--mint-green)' }}>{`[ToolShield PROXY] Evaluating tool call 'weather_plus'...
[ToolShield PROXY] Rule S001 Fired: SECRET_TO_EXTERNAL_NETWORK
[ToolShield PROXY] Verdict: BLOCK (Risk Score: 100)
[ZERO-EXECUTION PROOF] Target Gated Call Bytes Written: 0
[ZERO-EXECUTION PROOF] Target Handler Execution Count: 0
[ToolShield PROXY] Returned JSON-RPC Error -32000 to Client.`}</pre>
      </div>
    </div>
  );
}
