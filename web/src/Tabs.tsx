import React from 'react';

export function InstallationTab() {
  return (
    <div>
      <div className="section-block">
        <h1 className="hero-title">Installation & Setup</h1>
        <p className="hero-subtitle">
          Get ToolShield running in seconds across Linux, macOS, or Windows with automated setup scripts.
        </p>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Linux / macOS Installer</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Run the one-line curl installation script:</p>
        <pre>{`curl -sSL https://raw.githubusercontent.com/ayatinkering/ToolShield/main/install.sh | bash`}</pre>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Windows PowerShell</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Run the PowerShell setup command:</p>
        <pre>{`iwr -useb https://raw.githubusercontent.com/ayatinkering/ToolShield/main/install.ps1 | iex`}</pre>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Uninstallers</h2>
        <p style={{ color: 'var(--text-secondary)' }}>To remove ToolShield binaries and clean environment paths:</p>
        <pre>{`# Linux / macOS
curl -sSL https://raw.githubusercontent.com/ayatinkering/ToolShield/main/uninstall.sh | bash`}</pre>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>VS Code Extension (.vsix)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Download the pre-compiled VS Code extension for inline MCP guardgate diagnostics.
        </p>
        <p style={{ marginTop: '8px' }}>
          <a
            href="https://github.com/ayatinkering/ToolShield/releases"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-color)', fontWeight: 600 }}
          >
            Download toolshield-0.2.0.vsix →
          </a>
        </p>
      </div>
    </div>
  );
}

export function DocsTab() {
  return (
    <div>
      <div className="section-block">
        <h1 className="hero-title">Command Reference & Security Rules</h1>
        <p className="hero-subtitle">
          Comprehensive CLI reference and complete S001-S009 Policy Rules matrix enforced by the AST scanner and execution gate.
        </p>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '1.85rem', marginBottom: '16px' }}>CLI Command Reference</h2>
        
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>toolshield scan</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Scan Python source root for capabilities & taint flows</p>
        <pre>{`toolshield scan test_lab`}</pre>

        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>toolshield proxy</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Launch MCP server behind stdio proxy execution gate</p>
        <pre>{`toolshield proxy --source-root test_lab -- python server.py`}</pre>

        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>toolshield diff</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Compare baseline JSON files for implementation drift</p>
        <pre>{`toolshield diff -b baseline.json -c current.json`}</pre>

        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>toolshield graph</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Display taint flow tree graph (text or dot format)</p>
        <pre>{`toolshield graph test_lab --format text`}</pre>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '1.85rem', marginBottom: '16px' }}>S001 - S009 Policy Rules Reference</h2>
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
      <div className="section-block">
        <h1 className="hero-title">Executive Solution Report</h1>
        <p className="hero-subtitle">
          Hyper-detailed technical analysis, literature review, and step-by-step methodology for ToolShield.
        </p>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>1. The Problem</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
          When AI agents integrate with external tools via Model Context Protocol (MCP), tool descriptions (<code style={{ padding: '2px 6px' }}>tools/list</code>) claim what a tool does, but cannot guarantee how it is implemented. A tool claiming to return weather forecasts can secretly exfiltrate API keys (<code style={{ padding: '2px 6px' }}>os.getenv("API_KEY")</code>) over network POST requests or spawn shell processes.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          Traditional security proxies log or filter text or network traffic <em>during</em> or <em>after</em> process execution. Once gated tool payload bytes touch target process <code style={{ padding: '2px 6px' }}>stdin</code>, zero-day payload execution occurs.
        </p>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>2. Proposed Technical Solution</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
          ToolShield introduces an <strong>Implementation-Aware Pre-Dispatch Execution Gate</strong>. By operating as a JSON-RPC stdio proxy wrapper over child MCP server processes, ToolShield statically analyzes the target Python AST source code and tracks secret taint flows <em>before</em> forwarding any tool invocation request.
        </p>
        <pre>{`[ AI Client ] ---> [ ToolShield Proxy Gate ] ---> ( BLOCK: 0 Target Bytes Written )
                          │
                  [ AST Scanner & Taint ]
                          │
                     [ Policy Engine ]
                          │
                     ALLOW / REVIEW / BLOCK`}</pre>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>3. Step-by-Step Methodology</h2>
        <ol style={{ color: 'var(--text-secondary)', paddingLeft: '24px', lineHeight: '2.0' }}>
          <li><strong>MCP Subprocess Spawning:</strong> Target Python MCP server launched under proxy supervision with isolated stdio pipe redirection.</li>
          <li><strong>Bounded AST Parsing:</strong> Source files parsed into Python Abstract Syntax Trees within strict node and size limits (512KB, 10,000 nodes).</li>
          <li><strong>Import Alias Resolution:</strong> Canonicalizing aliased import names (e.g., <code style={{ padding: '2px 6px' }}>import requests as r</code> &rarr; <code style={{ padding: '2px 6px' }}>requests.post</code>).</li>
          <li><strong>Source Detection:</strong> Identifying secret retrieval calls (<code style={{ padding: '2px 6px' }}>os.getenv</code>, <code style={{ padding: '2px 6px' }}>os.environ</code>, <code style={{ padding: '2px 6px' }}>open(".env")</code>).</li>
          <li><strong>Sink Detection:</strong> Identifying exfiltration and execution targets (<code style={{ padding: '2px 6px' }}>httpx.post</code>, <code style={{ padding: '2px 6px' }}>subprocess.run</code>, <code style={{ padding: '2px 6px' }}>open(..., "w")</code>).</li>
          <li><strong>Taint Flow Propagation:</strong> Tracking variable assignments, dictionary constructions, binary string operations, and keyword arguments from sources to sinks.</li>
          <li><strong>Policy Evaluation (S001-S009):</strong> Evaluating taint flows against policy rules to produce ALLOW, REVIEW, or BLOCK verdicts.</li>
          <li><strong>Zero-Execution Pre-Dispatch Gate:</strong> On BLOCK verdict, ToolShield returns JSON-RPC error <code style={{ padding: '2px 6px' }}>-32000</code> and writes 0 bytes to target <code style={{ padding: '2px 6px' }}>stdin</code>.</li>
        </ol>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>4. Literature Review</h2>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '24px', lineHeight: '1.9' }}>
          <li><strong>OWASP Top 10 for MCP (2025/2026):</strong> Identifies Tool Poisoning, Secret Exfiltration, and Shadow Tool Capabilities as primary threat vectors.</li>
          <li><strong>DevSecOps Tool Poisoning Research:</strong> Highlights risks of innocent-looking utility tools manipulating LLM agent context.</li>
          <li><strong>ResearchGate Web3 MCP Security Survey (2026):</strong> Emphasizes cryptographic baseline hashing for supply chain tool updates.</li>
          <li><strong>arXiv:2608.11878:</strong> Static Analysis for LLM Tool Chaining Safety and Taint Tracking.</li>
          <li><strong>arXiv:2608.04053:</strong> Zero-Trust Execution Gates in Model Context Protocols.</li>
        </ul>
      </div>

      <div className="section-block">
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>5. Comparative Matrix</h2>
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
              <td>NO (Runtime Filter)</td>
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
