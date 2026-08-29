import typer
from rich.console import Console
from rich.table import Table
from toolshield import __version__
from toolshield.scanner import ASTScanner
from toolshield.policy import PolicyEngine

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
    
    verdict_color = "green" if result.verdict == "ALLOW" else ("yellow" if result.verdict == "REVIEW" else "bold red")
    table.add_row("Final Verdict", f"[{verdict_color}]{result.verdict.value}[/{verdict_color}]")

    console.print(table)


if __name__ == "__main__":
    app()
