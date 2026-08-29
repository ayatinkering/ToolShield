import asyncio
import os
import sys
import yaml
from typing import Optional, Set
from toolshield.models import AnalysisState, Capability, Policy, Verdict
from toolshield.policy import PolicyEngine
from toolshield.proxy.router import JSONRPCRouter
from toolshield.scanner import ASTScanner


class StdioProxyGate:
    """JSON-RPC stdio proxy server enforcing pre-dispatch policy evaluation."""

    def __init__(self, source_root: str, target_cmd: list[str], policy_file: Optional[str] = None):
        self.source_root = source_root
        self.target_cmd = target_cmd
        self.policy_file = policy_file
        self.policy: Optional[Policy] = None

        if policy_file and os.path.exists(policy_file):
            with open(policy_file, "r", encoding="utf-8") as f:
                pdata = yaml.safe_load(f)
                if pdata:
                    self.policy = Policy.model_validate(pdata)

        self.scanner = ASTScanner()
        self.policy_engine = PolicyEngine()
        self.target_bytes_written: int = 0
        self.registered_tools: dict = {}
        self._background_tasks: Set[asyncio.Task] = set()

        self.analysis_state, self.observed_caps, self.sources, self.sinks, self.flows = (
            self.scanner.scan_directory(self.source_root)
        )

    def evaluate_tool_call(self, tool_name: str):
        """Evaluate policy verdict for a given tool call."""
        return self.policy_engine.evaluate(
            analysis_state=self.analysis_state,
            observed_capabilities=self.observed_caps,
            flows=self.flows,
            policy=self.policy,
        )

    async def run(self, input_stream=None, output_stream=None):
        """Run the proxy forwarding loop."""
        reader = input_stream or sys.stdin
        writer = output_stream or sys.stdout

        proc = await asyncio.create_subprocess_exec(
            *self.target_cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        async def forward_target_stdout():
            while True:
                line = await proc.stdout.readline()
                if not line:
                    break
                out_str = line.decode("utf-8") if isinstance(line, bytes) else line
                writer.write(out_str)
                writer.flush()

        async def forward_target_stderr():
            while True:
                line = await proc.stderr.readline()
                if not line:
                    break
                err_str = line.decode("utf-8") if isinstance(line, bytes) else line
                sys.stderr.write(f"[Target stderr] {err_str}")
                sys.stderr.flush()

        task_out = asyncio.create_task(forward_target_stdout())
        task_err = asyncio.create_task(forward_target_stderr())

        self._background_tasks.add(task_out)
        self._background_tasks.add(task_err)

        task_out.add_done_callback(self._background_tasks.discard)
        task_err.add_done_callback(self._background_tasks.discard)

        while True:
            # Asynchronous non-blocking stream line reading
            if hasattr(reader, "readline"):
                if asyncio.iscoroutinefunction(reader.readline):
                    line_bytes = await reader.readline()
                else:
                    line_bytes = await asyncio.to_thread(reader.readline)
            else:
                break

            if not line_bytes:
                break

            line_str = line_bytes.decode("utf-8") if isinstance(line_bytes, bytes) else line_bytes
            msg, err = JSONRPCRouter.parse(line_str)

            if msg and msg.msg_type == "request" and msg.method == "tools/call":
                tool_name = msg.params.get("name", "unknown")
                eval_res = self.evaluate_tool_call(tool_name)

                if eval_res.verdict == Verdict.BLOCK:
                    sys.stderr.write(f"[ToolShield PROXY] BLOCK tool call '{tool_name}': {eval_res.explanations}\n")
                    sys.stderr.flush()
                    err_response = JSONRPCRouter.create_error_response(
                        msg_id=msg.id,
                        rules_fired=eval_res.rules_fired,
                        risk_score=eval_res.risk_score,
                    )
                    writer.write(err_response)
                    writer.flush()
                    continue

            payload_bytes = line_str.encode("utf-8")
            proc.stdin.write(payload_bytes)
            await proc.stdin.drain()
            self.target_bytes_written += len(payload_bytes)

        await proc.wait()
