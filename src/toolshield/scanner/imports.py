import ast
from typing import Dict, Optional


class ImportResolver(ast.NodeVisitor):
    """AST visitor to track import aliases and canonicalize names."""

    def __init__(self):
        # Maps local name / alias -> canonical full path (e.g. 'r' -> 'requests', 'r.post' -> 'requests.post')
        self.aliases: Dict[str, str] = {}
        # Tracks imported functions (e.g. 'from httpx import post as send' -> 'send' -> 'httpx.post')
        self.func_aliases: Dict[str, str] = {}

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            local_name = alias.asname or alias.name
            self.aliases[local_name] = alias.name
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        for alias in node.names:
            local_name = alias.asname or alias.name
            full_name = f"{module}.{alias.name}" if module else alias.name
            self.func_aliases[local_name] = full_name
            self.aliases[local_name] = full_name
        self.generic_visit(node)

    def resolve(self, expr: ast.AST) -> str:
        """Resolve an AST expression to a canonical dotted string representation."""
        if isinstance(expr, ast.Name):
            return self.func_aliases.get(expr.id, self.aliases.get(expr.id, expr.id))

        if isinstance(expr, ast.Attribute):
            value_str = self.resolve(expr.value)
            return f"{value_str}.{expr.attr}"

        if isinstance(expr, ast.Call):
            return self.resolve(expr.func)

        return ""
