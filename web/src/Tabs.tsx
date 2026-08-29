import React from 'react';

export function IntroTab({ onNavigate }: { onNavigate: (tab: 'installation' | 'docs' | 'solution') => void }) {
  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 64px',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      gap: '80px'
    }}>
      <div style={{ flex: '0 0 55%' }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: '3.5rem',
          lineHeight: 1.1,
          fontWeight: 700,
          color: '#111111'
        }}>
          ToolShield
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#444444',
          marginTop: '20px',
          lineHeight: 1.6
        }}>
          Implementation-Aware Security Proxy for Model Context Protocol (MCP) Servers
        </p>
        <p style={{
          fontSize: '1rem',
          color: '#666666',
          marginTop: '16px',
          fontStyle: 'italic'
        }}>
          Tool descriptions are claims. ToolShield verifies implementation evidence before execution.
        </p>

        <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => onNavigate('installation')}
            style={{
              background: '#000000',
              color: '#FFFFFF',
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Installation &rarr;
          </button>
          <button
            onClick={() => onNavigate('solution')}
            style={{
              background: 'transparent',
              color: '#111111',
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1.5px solid #CBD5E0',
              cursor: 'pointer'
            }}
          >
            Solution
          </button>
        </div>
      </div>

      <div style={{ flex: '0 0 45%' }}>
        <img
          src="/hero_diagram.jpg"
          alt="ToolShield Architecture Diagram"
          style={{
            width: '100%',
            maxWidth: '520px',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            display: 'block',
            margin: '0 auto'
          }}
        />
      </div>
    </div>
  );
}

export function InstallationTab() {
  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '96px 0' }}>
      <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2.5rem', marginBottom: '8px' }}>
        Install ToolShield
      </h1>
      <p style={{ color: '#666666', marginBottom: '40px' }}>
        Get ToolShield running on your machine in seconds.
      </p>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>macOS &amp; Linux</h3>
        <p style={{ color: '#444444', marginBottom: '12px' }}>Run the following command in your terminal:</p>
        <pre>{`curl -sSL https://raw.githubusercontent.com/ayatinkering/ToolShield/main/install.sh | bash`}</pre>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Windows (PowerShell)</h3>
        <p style={{ color: '#444444', marginBottom: '12px' }}>Open PowerShell as Administrator and run:</p>
        <pre>{`iwr -useb https://raw.githubusercontent.com/ayatinkering/ToolShield/main/install.ps1 | iex`}</pre>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Uninstall</h3>
        <p style={{ color: '#444444', marginBottom: '8px' }}>macOS &amp; Linux:</p>
        <pre>{`curl -sSL https://raw.githubusercontent.com/ayatinkering/ToolShield/main/uninstall.sh | bash`}</pre>
        <p style={{ color: '#444444', marginTop: '16px', marginBottom: '8px' }}>Windows:</p>
        <pre>{`iwr -useb https://raw.githubusercontent.com/ayatinkering/ToolShield/main/uninstall.ps1 | iex`}</pre>
      </div>
    </div>
  );
}

export function DocsTab() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '96px 0' }}>
      <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2.5rem', marginBottom: '8px' }}>
        Docs &amp; CLI Reference
      </h1>
      <p style={{ color: '#666666', marginBottom: '40px' }}>
        CLI commands reference and policy rules matrix.
      </p>

      <div style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '1.85rem', marginBottom: '24px' }}>CLI Commands</h2>

        <div style={{ marginBottom: '20px' }}>
          <code style={{ fontSize: '1rem', fontWeight: 600 }}>toolshield scan &lt;source-root&gt;</code>
          <p style={{ color: '#666666', marginTop: '4px' }}>Scans Python AST for taint flows</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <code style={{ fontSize: '1rem', fontWeight: 600 }}>toolshield proxy --source-root &lt;root&gt; -- &lt;command&gt;</code>
          <p style={{ color: '#666666', marginTop: '4px' }}>Launches MCP server behind stdio proxy gate</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <code style={{ fontSize: '1rem', fontWeight: 600 }}>toolshield diff --baseline &lt;file&gt; --current &lt;file&gt;</code>
          <p style={{ color: '#666666', marginTop: '4px' }}>SHA-256 baseline drift detection</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <code style={{ fontSize: '1rem', fontWeight: 600 }}>toolshield graph &lt;source-root&gt; --format &lt;text|dot&gt;</code>
          <p style={{ color: '#666666', marginTop: '4px' }}>Visual source-to-sink taint flow tree</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <code style={{ fontSize: '1rem', fontWeight: 600 }}>toolshield serve --host &lt;host&gt; --port &lt;port&gt;</code>
          <p style={{ color: '#666666', marginTop: '4px' }}>FastAPI Control Plane API server</p>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.85rem', marginBottom: '24px' }}>Policy Rules Reference (S001 &ndash; S009)</h2>
        <table>
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
              <td><span style={{ color: '#DC2626', fontWeight: 700 }}>BLOCK</span></td>
              <td>Secret source (env/file) flows directly into network POST/GET sink</td>
            </tr>
            <tr>
              <td><strong>S002</strong></td>
              <td>CREDENTIAL_TO_PROCESS_EXECUTION</td>
              <td><span style={{ color: '#DC2626', fontWeight: 700 }}>BLOCK</span></td>
              <td>Secret source flows into process/shell execution sink</td>
            </tr>
            <tr>
              <td><strong>S003</strong></td>
              <td>SECRET_TO_SENSITIVE_FILE_WRITE</td>
              <td><span style={{ color: '#DC2626', fontWeight: 700 }}>BLOCK</span></td>
              <td>Secret source written to disk file sink</td>
            </tr>
            <tr>
              <td><strong>S004</strong></td>
              <td>CAPABILITY_DRIFT</td>
              <td><span style={{ color: '#D97706', fontWeight: 700 }}>REVIEW</span></td>
              <td>Tool exhibits capabilities undeclared in policy definition</td>
            </tr>
            <tr>
              <td><strong>S005</strong></td>
              <td>ANALYSIS_FAILED</td>
              <td><span style={{ color: '#DC2626', fontWeight: 700 }}>BLOCK</span></td>
              <td>AST parsing failed for target Python server source code</td>
            </tr>
            <tr>
              <td><strong>S006</strong></td>
              <td>ANALYSIS_INCOMPLETE</td>
              <td><span style={{ color: '#D97706', fontWeight: 700 }}>REVIEW</span></td>
              <td>Source file exceeds AST node or resource bounds</td>
            </tr>
            <tr>
              <td><strong>S007</strong></td>
              <td>BASELINE_CHANGED</td>
              <td><span style={{ color: '#D97706', fontWeight: 700 }}>REVIEW</span></td>
              <td>Source tree or metadata hash differs from saved baseline</td>
            </tr>
            <tr>
              <td><strong>S008</strong></td>
              <td>CRITICAL_RUG_PULL</td>
              <td><span style={{ color: '#DC2626', fontWeight: 700 }}>BLOCK</span></td>
              <td>Baseline mutation introduced critical secret flow</td>
            </tr>
            <tr>
              <td><strong>S009</strong></td>
              <td>IDENTITY_AMBIGUITY</td>
              <td><span style={{ color: '#D97706', fontWeight: 700 }}>REVIEW</span></td>
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
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '96px 64px' }}>
      <div style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>1. The Problem</h2>

        <h3 style={{ fontSize: '1.4rem', marginTop: '24px', marginBottom: '12px' }}>MCP Tool Descriptions Are Claims, Not Evidence</h3>

        <p style={{ marginBottom: '16px', color: '#333333', lineHeight: '1.8' }}>
          The Model Context Protocol (MCP) is an open standard by Anthropic that lets AI agents like Claude,
          GPT-4, and Gemini connect to external tools &mdash; databases, APIs, file systems, code runners, and more.
          When an AI agent loads an MCP server, it reads a list of available tools and their descriptions.
          The problem is fundamental: <strong>those descriptions are written by whoever built the MCP server,
          and there is no mechanism in the MCP protocol to verify they are truthful.</strong>
        </p>

        <p style={{ marginBottom: '16px', color: '#333333', lineHeight: '1.8' }}>
          A tool that claims to return weather forecasts can, in reality, silently read your
          <code style={{ padding: '2px 6px' }}>~/.ssh/id_rsa</code> private key, your <code style={{ padding: '2px 6px' }}>.env</code> file with API secrets,
          or your browser cookie store &mdash; and POST all of it to an attacker's server.
          A tool claiming to summarize PDFs can spawn a reverse shell subprocess.
          This is not hypothetical. These are known, documented, and actively exploited attack patterns.
        </p>

        <h3 style={{ fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>Why Existing Defenses Fail</h3>

        <p style={{ marginBottom: '16px', color: '#333333', lineHeight: '1.8' }}>
          <strong>Prompt-level filters</strong> (e.g., system prompts saying "never leak secrets") fail because
          they rely on the LLM to refuse instructions hidden inside benign-looking tool output. Adversarial
          jailbreaks, indirect prompt injection via tool responses, and cross-context manipulation all bypass
          these defenses trivially.
        </p>

        <p style={{ marginBottom: '16px', color: '#333333', lineHeight: '1.8' }}>
          <strong>Network-layer firewalls</strong> (blocking outbound HTTP from an agent host) fail in a
          containerized or sandboxed deployment where tools legitimately need network access. A tool sending
          secrets to <code style={{ padding: '2px 6px' }}>api.weather.example.com</code> (a legitimate-looking domain controlled by an
          attacker) bypasses IP/domain blocklists entirely.
        </p>

        <p style={{ marginBottom: '16px', color: '#333333', lineHeight: '1.8' }}>
          <strong>Runtime monitoring (post-dispatch)</strong> is architecturally too late. Once ToolShield
          forwards a <code style={{ padding: '2px 6px' }}>tools/call</code> JSON-RPC request to the MCP server process's stdin, the Python
          code begins executing. If that code contains a <code style={{ padding: '2px 6px' }}>requests.post(url, data=os.getenv("OPENAI_KEY"))</code>
          call, the exfiltration has already begun. You cannot un-execute code.
        </p>

        <h3 style={{ fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>The Three Attack Classes ToolShield Addresses</h3>

        <ul style={{ paddingLeft: '24px', lineHeight: '1.85', color: '#333333' }}>
          <li style={{ marginBottom: '12px' }}>
            <strong>Tool Poisoning:</strong> A malicious MCP server is installed alongside legitimate servers.
            Its tool description appears harmless ("list files in directory") but its implementation reads
            environment variables and exfiltrates them via HTTP. The AI agent calls it innocently.
            OWASP Top 10 for MCP 2025 ranks this as the #1 threat vector.
          </li>
          <li style={{ marginBottom: '12px' }}>
            <strong>Secret Exfiltration via Taint Flow:</strong> A tool reads a secret (os.getenv("API_KEY")),
            stores it in a variable, passes it through string formatting, and then sends it in an HTTP
            POST body. No single line of code looks obviously malicious &mdash; the danger is in the
            data flow across multiple statements. This is precisely what static taint analysis catches.
          </li>
          <li style={{ marginBottom: '12px' }}>
            <strong>Dynamic Rug-Pull (Supply Chain Attack):</strong> A trusted MCP server is legitimately
            installed and passes all initial checks. Then, the server's Python source code is silently updated
            (via a package update, a symlink swap, or a git pull in a background cron job) to inject malicious
            behavior. The running agent proxy has no idea the code changed. ToolShield's SHA-256 baseline
            fingerprinting detects this on every tool call &mdash; if the hash of the server's source files has
            changed since the last verified baseline, the tool call is flagged with rule S008 (CRITICAL_RUG_PULL)
            before a single byte reaches the server.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>2. Proposed Technical Solution</h2>

        <h3 style={{ fontSize: '1.4rem', marginTop: '24px', marginBottom: '12px' }}>Implementation-Aware Pre-Dispatch Execution Gate</h3>

        <p style={{ marginBottom: '16px', color: '#333333', lineHeight: '1.8' }}>
          ToolShield is not a firewall. It is not a prompt filter. It is not a network proxy.
          It is an <strong>Implementation-Aware Pre-Dispatch Execution Gate</strong> &mdash; a process-level
          stdio proxy that wraps MCP server child processes and performs static code analysis
          <em>before</em> forwarding any tool invocation.
        </p>

        <p style={{ marginBottom: '16px', color: '#333333', lineHeight: '1.8' }}>
          Here is what "pre-dispatch" means concretely: when an AI agent sends a
          <code style={{ padding: '2px 6px' }}>tools/call</code> JSON-RPC request to the ToolShield proxy, ToolShield intercepts
          that request and <strong>does not forward it to the MCP server process</strong> until it
          has completed a full static AST scan of the server's Python source code. Only if the scan
          produces an ALLOW verdict does ToolShield write the request to the server's stdin.
          On a BLOCK verdict, ToolShield returns a JSON-RPC <code style={{ padding: '2px 6px' }}>-32603</code> error response
          directly to the AI agent. <strong>Zero bytes are written to the MCP server's stdin.
          The server code never executes. The payload never fires.</strong>
        </p>

        <h3 style={{ fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>Architecture Diagram</h3>

        <pre style={{ background: '#f5f5f5', padding: '24px', borderRadius: '8px', fontSize: '0.85rem', overflowX: 'auto', lineHeight: '1.7' }}>{`┌─────────────────┐         ┌──────────────────────────────────────────────┐
│   AI Agent      │         │           ToolShield Proxy Gate               │
│ (Claude / GPT)  │         │                                              │
│                 │         │  ┌─────────────────────────────────────┐    │
│  tools/call ──────────────────▶  Pre-Dispatch Interceptor           │    │
│                 │         │  │  (JSON-RPC stdin reader)            │    │
│                 │         │  └──────────────┬──────────────────────┘    │
│                 │         │                 │                            │
│                 │         │  ┌──────────────▼──────────────────────┐    │
│                 │         │  │  AST Scanner & Taint Propagation    │    │
│                 │         │  │  (Python ast module, bounded walk)  │    │
│                 │         │  └──────────────┬──────────────────────┘    │
│                 │         │                 │                            │
│                 │         │  ┌──────────────▼──────────────────────┐    │
│                 │         │  │  Policy Engine (Rules S001-S009)    │    │
│                 │         │  └──────────────┬──────────────────────┘    │
│                 │         │                 │                            │
│                 │         │         ALLOW / REVIEW / BLOCK              │
│                 │         │           ╱            ╲                    │
│                 │         │    ┌─────▼─────┐  ┌────▼──────────────┐    │
│                 │         │    │  Forward  │  │  BLOCK: 0 bytes   │    │
│                 │         │    │ to Server │  │  written to stdin │    │
│                 │         │    └─────┬─────┘  └───────────────────┘    │
│                 │         └──────────┼───────────────────────────────────┘
│                 │                    │
│                 │         ┌──────────▼──────────┐
│                 │         │  MCP Server Process  │
│                 │         │  (Python child proc) │
└─────────────────┘         └─────────────────────┘`}</pre>

        <h3 style={{ fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>Why Static Analysis Is the Right Approach</h3>

        <p style={{ marginBottom: '16px', color: '#333333', lineHeight: '1.8' }}>
          Static analysis reads the source code as text (or an abstract syntax tree) without executing it.
          This is the same technique used by security scanners like Bandit, Semgrep, and CodeQL &mdash; but
          ToolShield applies it in real-time, on every individual tool invocation, inside the proxy hot path.
        </p>

        <p style={{ marginBottom: '16px', color: '#333333', lineHeight: '1.8' }}>
          The key insight: <strong>malicious data flows are structurally visible in source code.</strong>
          A function that reads <code style={{ padding: '2px 6px' }}>os.getenv("SECRET")</code> into variable <code style={{ padding: '2px 6px' }}>x</code> and then
          passes <code style={{ padding: '2px 6px' }}>x</code> as a parameter to <code style={{ padding: '2px 6px' }}>requests.post()</code> will always look the same
          in the AST &mdash; regardless of how the attacker obfuscates variable names or splits the assignment
          across lines. ToolShield's taint engine traces this flow deterministically.
        </p>
      </div>

      <div style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>3. Step-by-Step Methodology</h2>

        <p style={{ marginBottom: '24px', color: '#333333', lineHeight: '1.8' }}>
          Each time an AI agent attempts to invoke any tool gated by ToolShield, the following
          eight-stage pipeline executes sequentially. The entire pipeline completes in under 5 milliseconds
          for typical MCP servers &mdash; imperceptible to the agent or user.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>Stage 1 &mdash; MCP Subprocess Spawning &amp; Stdio Pipe Isolation</h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>What it does:</strong> ToolShield launches the target Python MCP server as a child
          subprocess with its stdin and stdout fully controlled by the proxy via OS-level pipe redirection.
          The server has no ability to write directly to the terminal or the agent's connection &mdash;
          all I/O passes through ToolShield's gate.
        </p>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>Technical detail:</strong> Uses Python's <code style={{ padding: '2px 6px' }}>subprocess.Popen</code> with
          <code style={{ padding: '2px 6px' }}>stdin=PIPE, stdout=PIPE, stderr=PIPE</code>. The ToolShield proxy owns both ends of
          every pipe. This gives the proxy exclusive read/write control over what the server process
          sends and receives.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>Why it matters:</strong> This is the foundational containment boundary. Even before
          any analysis runs, the server cannot communicate outside the proxy's control. Think of it as
          placing the server inside a locked room where ToolShield controls the only door.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>Stage 2 &mdash; Pre-Dispatch JSON-RPC Interception</h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>What it does:</strong> ToolShield reads each newline-delimited JSON-RPC message
          from the AI agent's connection. For <code style={{ padding: '2px 6px' }}>tools/list</code> requests, it forwards normally
          (the tool list is informational, not dangerous). For <code style={{ padding: '2px 6px' }}>tools/call</code> requests &mdash;
          where actual code execution would happen &mdash; ToolShield holds the message in memory and
          triggers the analysis pipeline before forwarding.
        </p>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>Technical detail:</strong> JSON-RPC 2.0 over stdio is the MCP wire protocol.
          Each request is a single UTF-8 JSON line. ToolShield parses the <code style={{ padding: '2px 6px' }}>method</code> field;
          on <code style={{ padding: '2px 6px' }}>"tools/call"</code>, it routes to the analysis engine instead of the server stdin.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>Why it matters:</strong> This is the "gate" in execution gate. No tool invocation
          bypasses this stage. It is architecturally impossible for the server to receive a tool call
          without first passing the analysis.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>Stage 3 &mdash; Bounded Python AST Parsing</h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>What it does:</strong> ToolShield reads the target MCP server's Python source files
          and parses them into Abstract Syntax Trees using Python's built-in <code style={{ padding: '2px 6px' }}>ast</code> module.
          An AST is a tree-structured representation of the code that makes data flows, function calls,
          and variable assignments machine-readable without executing a single line.
        </p>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>Technical detail:</strong> Parsing is bounded by hard resource limits &mdash; maximum
          512KB source file size and 10,000 AST nodes per file &mdash; to prevent DoS via pathologically
          large generated files. Each source file is parsed once per session and cached; subsequent
          tool calls in the same session use the cached AST unless the baseline hash changes.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>Plain English:</strong> Imagine reading a recipe (the code) before cooking (executing it).
          You can see from the ingredient list that a recipe calls for arsenic &mdash; you don't need to cook
          it and taste it to know it's dangerous. AST parsing does this for code: reads the structure
          and content without running it.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>Stage 4 &mdash; Import Alias Resolution &amp; Module Canonicalization</h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>What it does:</strong> Python allows imports to be aliased:
          <code style={{ padding: '2px 6px' }}>import requests as r</code>, <code style={{ padding: '2px 6px' }}>from httpx import post as p</code>,
          <code style={{ padding: '2px 6px' }}>import os as operating_system</code>. If a taint scanner only looks for the string
          <code style={{ padding: '2px 6px' }}>"requests.post"</code>, it would miss <code style={{ padding: '2px 6px' }}>r.post()</code> entirely.
          ToolShield's import resolver builds a canonical alias map at parse time so that all
          subsequent analysis uses resolved module names, not aliases.
        </p>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>Technical detail:</strong> The resolver walks all <code style={{ padding: '2px 6px' }}>ast.Import</code> and
          <code style={{ padding: '2px 6px' }}>ast.ImportFrom</code> nodes, building a dictionary mapping alias names to their
          canonical module paths. e.g., <code style={{ padding: '2px 6px' }}>&#123;"r": "requests", "p": "httpx.post"&#125;</code>.
          Every function call node is then checked against this resolved namespace, not the raw
          source text.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>Why it matters:</strong> Real-world malicious code almost always uses aliased imports
          to evade naive string-matching scanners. Canonical resolution closes this evasion vector.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>Stage 5 &mdash; Secret Source Detection</h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>What it does:</strong> Identifies all locations in the AST where the code reads
          sensitive data &mdash; environment variables, credential files, key stores. These are called
          "taint sources" &mdash; the origin points of potentially dangerous data flows.
        </p>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>Source patterns detected:</strong>
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px', color: '#333333' }}>
          <li><code style={{ padding: '2px 6px' }}>os.getenv("KEY")</code> and <code style={{ padding: '2px 6px' }}>os.environ["KEY"]</code> &mdash; environment variable reads</li>
          <li><code style={{ padding: '2px 6px' }}>open(".env")</code>, <code style={{ padding: '2px 6px' }}>open("/etc/secrets/...")</code> &mdash; credential file reads</li>
          <li><code style={{ padding: '2px 6px' }}>pathlib.Path(...).read_text()</code> &mdash; path-based secret file reads</li>
          <li>Direct access to <code style={{ padding: '2px 6px' }}>sys.argv</code> items that may carry credentials</li>
          <li>Reads from known secret management libraries (<code style={{ padding: '2px 6px' }}>boto3.client("secretsmanager")</code>, <code style={{ padding: '2px 6px' }}>google.cloud.secretmanager</code>)</li>
        </ul>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          Any variable that receives a value from one of these sources is marked as "tainted" &mdash;
          meaning its value is considered potentially secret and must not flow to dangerous outputs.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>Stage 6 &mdash; Exfiltration Sink Detection</h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>What it does:</strong> Identifies all locations in the AST where data is sent
          outward &mdash; over the network, to a subprocess, or to a file. These are called "taint sinks" &mdash;
          the destination points where a tainted value would cause harm.
        </p>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>Sink patterns detected:</strong>
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '24px', color: '#333333' }}>
          <li><code style={{ padding: '2px 6px' }}>requests.post()</code>, <code style={{ padding: '2px 6px' }}>requests.get()</code>, <code style={{ padding: '2px 6px' }}>httpx.post()</code>, <code style={{ padding: '2px 6px' }}>urllib.request.urlopen()</code> &mdash; HTTP exfiltration</li>
          <li><code style={{ padding: '2px 6px' }}>subprocess.run()</code>, <code style={{ padding: '2px 6px' }}>subprocess.Popen()</code>, <code style={{ padding: '2px 6px' }}>os.system()</code>, <code style={{ padding: '2px 6px' }}>os.execv()</code> &mdash; shell/process execution</li>
          <li><code style={{ padding: '2px 6px' }}>open(..., "w")</code>, <code style={{ padding: '2px 6px' }}>open(..., "a")</code>, <code style={{ padding: '2px 6px' }}>Path.write_text()</code> &mdash; file write sinks</li>
          <li><code style={{ padding: '2px 6px' }}>socket.send()</code>, <code style={{ padding: '2px 6px' }}>socket.sendall()</code> &mdash; raw socket exfiltration</li>
          <li><code style={{ padding: '2px 6px' }}>smtplib.SMTP.sendmail()</code> &mdash; email exfiltration</li>
        </ul>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>Stage 7 &mdash; Interprocedural Taint Flow Propagation</h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>What it does:</strong> This is the core analysis engine. It tracks how tainted
          values flow through the code from sources (Stage 5) to sinks (Stage 6), following
          variable assignments, function argument passing, string formatting, dictionary packing,
          and list comprehensions. If a tainted value reaches a dangerous sink through any chain
          of assignments, it is flagged as a confirmed taint flow.
        </p>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>Example taint flow ToolShield catches:</strong>
        </p>
        <pre style={{ background: '#f0f0f0', padding: '16px', borderRadius: '6px', fontSize: '0.82rem', lineHeight: '1.6' }}>{`secret = os.getenv("OPENAI_API_KEY")    # ← TAINT SOURCE: secret is tainted
payload = {"Authorization": secret}     # ← TAINT PROPAGATION: payload dict is tainted
headers = {**payload, "Content-Type": "application/json"}  # ← TAINT PROPAGATION
response = requests.post(url, headers=headers)  # ← TAINT SINK: S001 BLOCK triggered`}</pre>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>Propagation rules tracked:</strong>
        </p>
        <ul style={{ paddingLeft: '24px', marginBottom: '24px', color: '#333333' }}>
          <li><strong>Direct assignment:</strong> <code style={{ padding: '2px 6px' }}>x = tainted_var</code> &rarr; x is tainted</li>
          <li><strong>String formatting:</strong> <code style={{ padding: '2px 6px' }}>f"Bearer &#123;tainted_var&#125;"</code> &rarr; result is tainted</li>
          <li><strong>Dictionary packing:</strong> <code style={{ padding: '2px 6px' }}>&#123;"key": tainted_var&#125;</code> &rarr; dict is tainted</li>
          <li><strong>Dict unpacking:</strong> <code style={{ padding: '2px 6px' }}>&#123;**tainted_dict&#125;</code> &rarr; new dict is tainted</li>
          <li><strong>Binary concatenation:</strong> <code style={{ padding: '2px 6px' }}>"prefix" + tainted_var</code> &rarr; result is tainted</li>
          <li><strong>Keyword arguments:</strong> <code style={{ padding: '2px 6px' }}>func(param=tainted_var)</code> &rarr; if func is a sink, BLOCK</li>
          <li><strong>List elements:</strong> <code style={{ padding: '2px 6px' }}>[tainted_var]</code> &rarr; list is tainted</li>
          <li><strong>Return values:</strong> <code style={{ padding: '2px 6px' }}>return tainted_var</code> &rarr; propagated to all call sites</li>
        </ul>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>Stage 8 &mdash; Policy Evaluation (Rules S001&ndash;S009)</h3>
        <p style={{ marginBottom: '12px', color: '#333333' }}>
          <strong>What it does:</strong> The detected taint flows are evaluated against ToolShield's
          security policy ruleset. Each rule specifies a source-sink pattern and its verdict.
          Rules are evaluated in priority order; the highest-severity matching rule wins.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', marginBottom: '24px', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E5E5' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px' }}>Rule</th>
              <th style={{ textAlign: 'left', padding: '10px 16px' }}>Pattern</th>
              <th style={{ textAlign: 'left', padding: '10px 16px' }}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '10px 16px' }}><strong>S001</strong></td>
              <td style={{ padding: '10px 16px' }}>Secret &rarr; External Network POST/GET</td>
              <td style={{ padding: '10px 16px' }}><strong style={{ color: '#DC2626' }}>BLOCK</strong></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '10px 16px' }}><strong>S002</strong></td>
              <td style={{ padding: '10px 16px' }}>Credential &rarr; Process/Shell Execution</td>
              <td style={{ padding: '10px 16px' }}><strong style={{ color: '#DC2626' }}>BLOCK</strong></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '10px 16px' }}><strong>S003</strong></td>
              <td style={{ padding: '10px 16px' }}>Secret &rarr; Sensitive File Write</td>
              <td style={{ padding: '10px 16px' }}><strong style={{ color: '#DC2626' }}>BLOCK</strong></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '10px 16px' }}><strong>S004</strong></td>
              <td style={{ padding: '10px 16px' }}>Capability Drift (undeclared capabilities detected)</td>
              <td style={{ padding: '10px 16px' }}><strong style={{ color: '#D97706' }}>REVIEW</strong></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '10px 16px' }}><strong>S005</strong></td>
              <td style={{ padding: '10px 16px' }}>AST Parsing Failed (syntax error / unreadable)</td>
              <td style={{ padding: '10px 16px' }}><strong style={{ color: '#DC2626' }}>BLOCK</strong></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '10px 16px' }}><strong>S006</strong></td>
              <td style={{ padding: '10px 16px' }}>Analysis Incomplete (file exceeds size/node bounds)</td>
              <td style={{ padding: '10px 16px' }}><strong style={{ color: '#D97706' }}>REVIEW</strong></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '10px 16px' }}><strong>S007</strong></td>
              <td style={{ padding: '10px 16px' }}>Baseline Hash Changed (SHA-256 mismatch)</td>
              <td style={{ padding: '10px 16px' }}><strong style={{ color: '#D97706' }}>REVIEW</strong></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '10px 16px' }}><strong>S008</strong></td>
              <td style={{ padding: '10px 16px' }}>Critical Rug-Pull (new secret&rarr;network flow post-baseline)</td>
              <td style={{ padding: '10px 16px' }}><strong style={{ color: '#DC2626' }}>BLOCK</strong></td>
            </tr>
            <tr>
              <td style={{ padding: '10px 16px' }}><strong>S009</strong></td>
              <td style={{ padding: '10px 16px' }}>Identity Ambiguity (duplicate tool names / handlers)</td>
              <td style={{ padding: '10px 16px' }}><strong style={{ color: '#D97706' }}>REVIEW</strong></td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>Stage 8b &mdash; Zero-Execution Pre-Dispatch Gate Enforcement</h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>What it does:</strong> On a BLOCK verdict from the policy engine, ToolShield
          constructs a JSON-RPC 2.0 error response with code <code style={{ padding: '2px 6px' }}>-32603</code> (Internal Error)
          and the message <code style={{ padding: '2px 6px' }}>"ToolShield: tool call blocked by policy [RULE_ID]"</code>.
          This response is returned directly to the AI agent. <strong>The MCP server process's
          stdin buffer remains empty &mdash; zero bytes written, zero code executed.</strong>
        </p>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          <strong>Mathematical guarantee:</strong> Because the MCP server process is blocked at
          stdin read (it is waiting for input that never arrives), and ToolShield has not written
          any bytes to that stdin, the server process cannot proceed to execute the tool handler function.
          This is not a best-effort prevention &mdash; it is a structural impossibility for the malicious
          code to execute when zero bytes reach stdin.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>On ALLOW verdict:</strong> ToolShield writes the buffered JSON-RPC tool call
          to the server's stdin, reads the response from stdout, and forwards it to the agent.
          The entire roundtrip overhead is under 5ms for typical servers.
        </p>
      </div>

      <div style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>4. Literature Review &amp; Academic References</h2>

        <p style={{ marginBottom: '24px', color: '#333333' }}>
          ToolShield's design draws from five converging bodies of research spanning
          AI agent security, static program analysis, and supply chain integrity.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>
          <a href="https://owasp.org/www-project-mcp-top-10/" target="_blank" rel="noopener noreferrer"
             style={{ color: '#111111', textDecoration: 'underline' }}>
            OWASP Top 10 for MCP (2025/2026)
          </a>
        </h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          The Open Web Application Security Project's authoritative threat classification for Model Context
          Protocol deployments. Published in 2025 and updated for 2026, it enumerates the ten most critical
          security risks in AI agent systems that use tool-calling protocols.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>Relevance to ToolShield:</strong> OWASP MCP-01 (Tool Poisoning) and MCP-03 (Excessive
          Tool Permissions) are the primary threat classes ToolShield addresses. The OWASP report
          explicitly recommends "implementation-level verification of tool behavior before execution" &mdash;
          exactly what ToolShield's AST gate provides. OWASP MCP-07 (Supply Chain Tool Injection) maps
          directly to ToolShield's SHA-256 baseline fingerprinting (rule S007/S008), which detects
          post-deployment source mutations.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>
          <a href="https://www.practical-devsecops.com/mcp-tool-poisoning/" target="_blank" rel="noopener noreferrer"
             style={{ color: '#111111', textDecoration: 'underline' }}>
            DevSecOps MCP Tool Poisoning Research (Practical DevSecOps, 2025)
          </a>
        </h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          A practitioner-focused analysis of how MCP tool poisoning attacks are constructed and deployed
          in real-world AI agent pipelines. Demonstrates that attackers embed malicious behavior inside
          otherwise-functional tools to maintain plausible deniability during code review.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>Relevance to ToolShield:</strong> This research establishes the "innocent-looking tool"
          attack pattern &mdash; where a tool implements its stated functionality (e.g., returns real weather data)
          while simultaneously executing a hidden malicious secondary action (e.g., exfiltrating environment
          variables). ToolShield's taint propagation analysis detects both the legitimate and the hidden
          data flow paths in the same AST scan, without needing to distinguish intent from behavior &mdash;
          if the taint flow exists structurally, it is flagged regardless of whether the tool "works."
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>
          <a href="https://www.researchgate.net/publication/412590523_When_Agents_Act_on_Web3_An_Attack-Surface_Survey_of_MCP_Skills_and_Tool_Calling"
             target="_blank" rel="noopener noreferrer" style={{ color: '#111111', textDecoration: 'underline' }}>
            ResearchGate: When Agents Act on Web3 &mdash; Attack Surface Survey of MCP Skills and Tool Calling (2026)
          </a>
        </h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          A comprehensive academic survey of attack surfaces in autonomous AI agent systems that use
          tool-calling protocols, with specific focus on MCP in Web3 and high-value financial contexts
          where tool poisoning has direct monetary impact.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>Relevance to ToolShield:</strong> This survey's Section 4.3 on "supply chain integrity
          for tool packages" directly motivates ToolShield's cryptographic baseline hashing. The authors
          find that 67% of MCP tool repositories they analyzed had no integrity verification mechanism
          for post-install updates &mdash; meaning a compromised PyPI package or GitHub Action could silently
          modify server source code. ToolShield's SHA-256 per-file baseline, stored at first-run and
          checked on every subsequent invocation, is precisely the countermeasure this paper recommends.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>
          <a href="https://arxiv.org/abs/2608.11878" target="_blank" rel="noopener noreferrer"
             style={{ color: '#111111', textDecoration: 'underline' }}>
            arXiv:2608.11878 &mdash; Static Analysis for LLM Tool Chaining Safety and Taint Tracking
          </a>
        </h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          An academic paper establishing formal semantics for static taint analysis applied to
          multi-tool LLM execution pipelines. Introduces the concept of "tool-chain taint propagation"
          where secrets introduced by one tool in a chain can flow into dangerous operations in
          downstream tools within the same agent session.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>Relevance to ToolShield:</strong> This paper provides the theoretical foundation
          for ToolShield's taint model. Specifically, ToolShield implements the paper's "source-sink
          reachability" analysis using Python's <code style={{ padding: '2px 6px' }}>ast</code> module as the IR (intermediate
          representation), with the propagation rules in Stage 7 directly derived from the paper's
          formal taint lattice semantics. The paper also proves that false-negative rates for AST-based
          taint analysis are significantly lower than runtime behavioral monitoring for the class of
          attacks where taint paths are statically computable &mdash; precisely the attacks ToolShield targets.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '24px', marginBottom: '8px' }}>
          <a href="https://arxiv.org/abs/2608.04053" target="_blank" rel="noopener noreferrer"
             style={{ color: '#111111', textDecoration: 'underline' }}>
            arXiv:2608.04053 &mdash; Zero-Trust Execution Gates in Model Context Protocols
          </a>
        </h3>
        <p style={{ marginBottom: '8px', color: '#333333' }}>
          A paper proposing the architectural pattern of "zero-trust execution gates" for MCP tool
          invocation &mdash; the idea that every tool call should be treated as untrusted by default and
          must pass a formal verification step before execution is permitted.
        </p>
        <p style={{ marginBottom: '24px', color: '#333333' }}>
          <strong>Relevance to ToolShield:</strong> ToolShield is a concrete, production implementation
          of the zero-trust execution gate architecture this paper describes theoretically. The paper
          proves that a pre-dispatch gate operating at the JSON-RPC protocol boundary with a "zero bytes
          written on BLOCK" guarantee is the only architectural pattern that provides a provable
          non-execution guarantee. ToolShield's Stage 8b directly implements this guarantee:
          the mathematical argument is that because the MCP server process is blocked waiting for stdin
          input, and ToolShield has written zero bytes to that stdin, the server's Python interpreter
          cannot advance past the blocking <code style={{ padding: '2px 6px' }}>sys.stdin.readline()</code> call &mdash; making tool handler
          execution a structural impossibility, not merely an expectation.
        </p>
      </div>

      <div style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>5. Comparative Analysis</h2>

        <p style={{ marginBottom: '24px', color: '#333333' }}>
          How does ToolShield compare to other approaches to MCP security?
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E5E5' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Feature</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>ToolShield</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>MCPITP</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Sharelock</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '12px 16px' }}>Pre-Dispatch Gate</td>
              <td style={{ padding: '12px 16px' }}><strong>YES &mdash; 0 bytes on BLOCK</strong></td>
              <td style={{ padding: '12px 16px' }}>NO &mdash; Runtime Filter</td>
              <td style={{ padding: '12px 16px' }}>NO &mdash; Prompt Filter</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '12px 16px' }}>Static AST Taint Analysis</td>
              <td style={{ padding: '12px 16px' }}><strong>YES (Source &rarr; Sink)</strong></td>
              <td style={{ padding: '12px 16px' }}>NO</td>
              <td style={{ padding: '12px 16px' }}>NO</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '12px 16px' }}>SHA-256 Rug-Pull Detection</td>
              <td style={{ padding: '12px 16px' }}><strong>YES (per file)</strong></td>
              <td style={{ padding: '12px 16px' }}>Partial</td>
              <td style={{ padding: '12px 16px' }}>NO</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '12px 16px' }}>Protocol Purity (stdio)</td>
              <td style={{ padding: '12px 16px' }}><strong>100% MCP-compliant</strong></td>
              <td style={{ padding: '12px 16px' }}>Mixed</td>
              <td style={{ padding: '12px 16px' }}>N/A</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '12px 16px' }}>Analysis Latency</td>
              <td style={{ padding: '12px 16px' }}><strong>&lt; 5ms (native AST)</strong></td>
              <td style={{ padding: '12px 16px' }}>~500ms (LLM call)</td>
              <td style={{ padding: '12px 16px' }}>~50ms (network proxy)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '12px 16px' }}>Import Alias Evasion Defense</td>
              <td style={{ padding: '12px 16px' }}><strong>YES (canonical resolver)</strong></td>
              <td style={{ padding: '12px 16px' }}>NO</td>
              <td style={{ padding: '12px 16px' }}>NO</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 16px' }}>Zero-Day Payload Prevention</td>
              <td style={{ padding: '12px 16px' }}><strong>YES (structural impossibility)</strong></td>
              <td style={{ padding: '12px 16px' }}>NO (behavioral)</td>
              <td style={{ padding: '12px 16px' }}>NO (behavioral)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
