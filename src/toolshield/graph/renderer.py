from typing import List
from toolshield.models import TaintFlow


class GraphRenderer:
    """Renders taint flow graphs in text tree or DOT format."""

    @staticmethod
    def render_text(flows: List[TaintFlow], tool_name: str = "tool") -> str:
        lines = [f"[bold cyan]{tool_name}[/bold cyan]"]
        if not flows:
            lines.append("  └── (No taint flows detected)")
            return "\n".join(lines)

        for i, flow in enumerate(flows):
            is_last = i == len(flows) - 1
            prefix = "  └── " if is_last else "  ├── "
            indent = "      " if is_last else "  │   "

            lines.append(f"{prefix}Source: [green]{flow.source.name}[/green] ({flow.source.source_type.value})")
            for transform in flow.transformations:
                lines.append(f"{indent}│   -> Transform: [yellow]{transform}[/yellow]")
            lines.append(f"{indent}└── Sink: [bold red]{flow.sink.name}[/bold red] ({flow.sink.sink_type.value})")

        return "\n".join(lines)

    @staticmethod
    def render_dot(flows: List[TaintFlow], tool_name: str = "tool") -> str:
        lines = ["digraph ToolShieldFlow {", '  rankdir="LR";', '  node [shape=box, fontname="Helvetica"];']

        if not flows:
            lines.append(f'  "{tool_name}" [label="{tool_name}\\n(No flows)"];')
            lines.append("}")
            return "\n".join(lines)

        for flow in flows:
            src_node = f"Source_{flow.source.name}"
            sink_node = f"Sink_{flow.sink.name}"

            lines.append(f'  "{src_node}" [label="{flow.source.name}\\n({flow.source.source_type.value})", color=green];')
            lines.append(f'  "{sink_node}" [label="{flow.sink.name}\\n({flow.sink.sink_type.value})", color=red];')

            prev_node = src_node
            for j, transform in enumerate(flow.transformations):
                trans_node = f"Transform_{j}_{transform}"
                lines.append(f'  "{trans_node}" [label="{transform}", shape=ellipse, color=yellow];')
                lines.append(f'  "{prev_node}" -> "{trans_node}";')
                prev_node = trans_node

            lines.append(f'  "{prev_node}" -> "{sink_node}";')

        lines.append("}")
        return "\n".join(lines)
