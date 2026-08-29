import asyncio
import os
import sys
from typing import List, Optional
import typer
from rich.console import Console
from rich.table import Table
from toolshield import __version__
from toolshield.baseline.store import BaselineStore
from toolshield.models import Verdict
from toolshield.policy import PolicyEngine
from toolshield.proxy.gate import StdioProxyGate
from toolshield.scanner import ASTScanner

app = typer.Typer(
    name="toolshield",
    help="Implementation-aware security proxy for Model Context Protocol (MCP) servers.",
)
console = Console()


@app.command()
def version():
    """Print ToolShield version."""
    console.print(f"[bold green]ToolShield[/bold green] version [cyan]{__version__}[/cyan]")


@app.command()
def scan(source_root: str = typer.Argument(..., help="Path to Python source root of target MCP server")):
    """Scan Python MCP server source for capabilities, taint flows, and security policy rules."""
    console.print(f"[bold blue]Scanning target source root:[/bold blue] {source_root}")
    scanner = ASTScanner()
    state, caps, sources, sinks, flows = scanner.scan_directory(source_root)

    engine = PolicyEngine()
    result = engine.evaluate(state, caps, flows)

    table = Table(title="ToolShield Scan Summary")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="bold")

    table.add_row("Analysis State", state.value)
    table.add_row("Observed Capabilities", ", ".join([c.value for c in caps]) or "None")
    table.add_row("Sources Detected", str(len(sources)))
    table.add_row("Sinks Detected", str(len(sinks)))
    table.add_row("Taint Flows", str(len(flows)))
    table.add_row("Risk Score", str(result.risk_score))

    verdict_color = "green" if result.verdict == Verdict.ALLOW else ("yellow" if result.verdict == Verdict.REVIEW else "bold red")
    table.add_row("Final Verdict", f"[{verdict_color}]{result.verdict.value}[/{verdict_color}]")

    console.print(table)


@app.command()
def proxy(
    source_root: str = typer.Option(..., "--source-root", "-s", help="Path to Python source root"),
    policy_file: Optional[str] = typer.Option(None, "--policy", "-p", help="Path to policy YAML file"),
    target_command: List[str] = typer.Argument(..., help="Command to launch target MCP server subprocess"),
):
    """Launch target MCP server behind ToolShield stdio proxy execution gate."""
    # Ensure stdout remains protocol-pure: send logs/UI to stderr
    err_console = Console(stderr=True)
    err_console.print(f"[bold green]ToolShield Proxy Gate starting for:[/bold green] {target_command}")
    
    proxy_gate = StdioProxyGate(
        source_root=source_root,
        target_cmd=target_command,
        policy_file=policy_file,
    )

    try:
        asyncio.run(proxy_gate.run())
    except KeyboardInterrupt:
        err_console.print("[bold yellow]ToolShield Proxy stopped by user.[/bold yellow]")


@app.command()
def diff(
    baseline: str = typer.Option(..., "--baseline", "-b", help="Path to baseline JSON file"),
    current: str = typer.Option(..., "--current", "-c", help="Path to current baseline JSON file or current source root"),
):
    """Compare baseline JSON file against current baseline JSON file for drift."""
    base_data = BaselineStore.load_baseline(baseline)

    if current.endswith(".json") and os.path.exists(current):
        curr_data = BaselineStore.load_baseline(current)
    else:
        # Evaluate current source root directly
        curr_data = {
            "metadata_hash": base_data.get("metadata_hash"),
            "implementation_hash": BaselineStore.compute_implementation_hash(current),
        }

    meta_drift = base_data.get("metadata_hash") != curr_data.get("metadata_hash")
    impl_drift = base_data.get("implementation_hash") != curr_data.get("implementation_hash")

    table = Table(title="ToolShield Baseline Diff Summary")
    table.add_column("Property", style="cyan")
    table.add_column("Baseline Hash", style="dim")
    table.add_column("Current Hash", style="dim")
    table.add_column("Drift Status", style="bold")

    meta_status = "[red]DRIFT DETECTED[/red]" if meta_drift else "[green]NO DRIFT[/green]"
    impl_status = "[bold red]CRITICAL DRIFT[/bold red]" if impl_drift else "[green]NO DRIFT[/green]"

    table.add_row(
        "Metadata Hash",
        base_data.get("metadata_hash", "N/A")[:12] + "...",
        curr_data.get("metadata_hash", "N/A")[:12] + "...",
        meta_status,
    )
    table.add_row(
        "Implementation Hash",
        base_data.get("implementation_hash", "N/A")[:12] + "...",
        curr_data.get("implementation_hash", "N/A")[:12] + "...",
        impl_status,
    )

    console.print(table)


if __name__ == "__main__":
    app()
