import ast
import os
import time
from typing import Dict, List, Optional, Set, Tuple, Any
from toolshield.models import (
    AnalysisState,
    Capability,
    Finding,
    Location,
    Sink,
    Source,
    TaintFlow,
    Verdict,
)
from toolshield.scanner.bounds import (
    MAX_AST_NODES,
    MAX_CALL_DEPTH,
    MAX_FUNCTIONS,
    MAX_SOURCE_BYTES,
)
from toolshield.scanner.imports import ImportResolver
from toolshield.scanner.sources_sinks import (
    NETWORK_SINKS,
    PROCESS_SINKS,
    WRITE_MODES,
    extract_location,
    is_env_read,
    is_file_write,
    is_sensitive_file_read,
)


class TaintVisitor(ast.NodeVisitor):
    """AST Visitor that tracks variable assignments, taint flows, sources, and sinks."""

    def __init__(self, file_path: str, resolver: ImportResolver):
        self.file_path = file_path
        self.resolver = resolver
        self.sources: Dict[str, Source] = {}  # var_name -> Source
        self.all_sources: List[Source] = []
        self.all_sinks: List[Sink] = []
        self.flows: List[TaintFlow] = []
        self.observed_capabilities: Set[Capability] = set()
        self.analysis_state: AnalysisState = AnalysisState.COMPLETE
        self.ast_node_count: int = 0
        self.function_count: int = 0

    def visit(self, node: ast.AST):
        self.ast_node_count += 1
        if self.ast_node_count > MAX_AST_NODES:
            self.analysis_state = AnalysisState.INCOMPLETE
            return
        super().visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        self.function_count += 1
        if self.function_count > MAX_FUNCTIONS:
            self.analysis_state = AnalysisState.INCOMPLETE
            return
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self.visit_FunctionDef(node)  # type: ignore

    def visit_Assign(self, node: ast.Assign):
        targets = []
        for target in node.targets:
            if isinstance(target, ast.Name):
                targets.append(target.id)

        rhs_source = self._evaluate_expr_for_source(node.value)

        for var_name in targets:
            if rhs_source:
                self.sources[var_name] = rhs_source
            else:
                self.sources.pop(var_name, None)

        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        canonical_func = self.resolver.resolve(node.func)
        loc = extract_location(node, self.file_path)

        if is_env_read(canonical_func, node):
            self.observed_capabilities.add(Capability.ENV_READ)

        sensitive_file = is_sensitive_file_read(node, canonical_func)
        if sensitive_file:
            self.observed_capabilities.add(Capability.SECRET_READ)
            self.observed_capabilities.add(Capability.FILE_READ)

        if canonical_func in NETWORK_SINKS:
            self.observed_capabilities.add(Capability.NETWORK_OUTBOUND)
            sink = Sink(
                sink_id=f"sink_net_{loc.line}_{loc.column}",
                sink_type=Capability.NETWORK_OUTBOUND,
                name=canonical_func,
                location=loc,
            )
            self.all_sinks.append(sink)
            self._check_taint_to_sink(node, sink)

        elif canonical_func in PROCESS_SINKS:
            self.observed_capabilities.add(Capability.PROCESS_EXEC)
            sink = Sink(
                sink_id=f"sink_proc_{loc.line}_{loc.column}",
                sink_type=Capability.PROCESS_EXEC,
                name=canonical_func,
                location=loc,
            )
            self.all_sinks.append(sink)
            self._check_taint_to_sink(node, sink)

        elif canonical_func in ("eval", "exec"):
            self.observed_capabilities.add(Capability.DYNAMIC_EXEC)
            sink = Sink(
                sink_id=f"sink_dyn_{loc.line}_{loc.column}",
                sink_type=Capability.DYNAMIC_EXEC,
                name=canonical_func,
                location=loc,
            )
            self.all_sinks.append(sink)
            self._check_taint_to_sink(node, sink)

        file_write = is_file_write(node, canonical_func)
        if file_write:
            self.observed_capabilities.add(Capability.FILE_WRITE)
            sink = Sink(
                sink_id=f"sink_write_{loc.line}_{loc.column}",
                sink_type=Capability.FILE_WRITE,
                name=canonical_func,
                location=loc,
            )
            self.all_sinks.append(sink)
            self._check_taint_to_sink(node, sink)

        self.generic_visit(node)

    def _evaluate_expr_for_source(self, expr: ast.AST) -> Optional[Source]:
        """Recursively evaluate an expression for secret source taint."""
        if expr is None:
            return None

        loc = extract_location(expr, self.file_path)

        if isinstance(expr, ast.Call):
            canonical_func = self.resolver.resolve(expr.func)
            if is_env_read(canonical_func, expr):
                source_name = "os.getenv"
                if expr.args and isinstance(expr.args[0], ast.Constant):
                    source_name = str(expr.args[0].value)

                source = Source(
                    source_id=f"src_env_{loc.line}_{loc.column}",
                    source_type=Capability.ENV_READ,
                    name=source_name,
                    location=loc,
                )
                self.all_sources.append(source)
                return source

            sensitive_file = is_sensitive_file_read(expr, canonical_func)
            if sensitive_file:
                source = Source(
                    source_id=f"src_file_{loc.line}_{loc.column}",
                    source_type=Capability.SECRET_READ,
                    name=sensitive_file,
                    location=loc,
                )
                self.all_sources.append(source)
                return source

            # Handle method calls on tainted objects (e.g., key.strip())
            if isinstance(expr.func, ast.Attribute):
                return self._evaluate_expr_for_source(expr.func.value)

        elif isinstance(expr, ast.Attribute):
            return self._evaluate_expr_for_source(expr.value)

        elif isinstance(expr, ast.Subscript):
            canonical_val = self.resolver.resolve(expr.value)
            if canonical_val in ("os.environ", "environ"):
                source_name = "os.environ"
                if isinstance(expr.slice, ast.Constant):
                    source_name = str(expr.slice.value)
                source = Source(
                    source_id=f"src_sub_{loc.line}_{loc.column}",
                    source_type=Capability.ENV_READ,
                    name=source_name,
                    location=loc,
                )
                self.all_sources.append(source)
                return source
            return self._evaluate_expr_for_source(expr.value)

        elif isinstance(expr, ast.BinOp):
            return self._evaluate_expr_for_source(expr.left) or self._evaluate_expr_for_source(expr.right)

        elif isinstance(expr, ast.Name):
            return self.sources.get(expr.id)

        elif isinstance(expr, ast.Dict):
            for val in expr.values:
                src = self._evaluate_expr_for_source(val)
                if src:
                    return src

        elif isinstance(expr, (ast.List, ast.Tuple, ast.Set)):
            elements = expr.elts if hasattr(expr, "elts") else getattr(expr, "elt", [])
            for elt in elements:
                src = self._evaluate_expr_for_source(elt)
                if src:
                    return src

        elif isinstance(expr, ast.JoinedStr):  # f-string
            for value in expr.values:
                if isinstance(value, ast.FormattedValue):
                    src = self._evaluate_expr_for_source(value.value)
                    if src:
                        return src

        return None

    def _check_taint_to_sink(self, call_node: ast.Call, sink: Sink):
        """Check if any argument passed to call_node carries a source taint."""
        for arg in call_node.args:
            src = self._evaluate_expr_for_source(arg)
            if src:
                flow = TaintFlow(
                    flow_id=f"flow_{src.source_id}_{sink.sink_id}",
                    source=src,
                    sink=sink,
                    transformations=["assignment", "call_argument"],
                    description=f"Source {src.name} flows directly into sink {sink.name}",
                )
                self.flows.append(flow)

        for kw in call_node.keywords:
            src = self._evaluate_expr_for_source(kw.value)
            if src:
                flow = TaintFlow(
                    flow_id=f"flow_{src.source_id}_{sink.sink_id}",
                    source=src,
                    sink=sink,
                    transformations=["assignment", "kwarg"],
                    description=f"Source {src.name} flows into kwarg sink {sink.name}",
                )
                self.flows.append(flow)


class ASTScanner:
    """Bounded Python AST Scanner for MCP tool implementations."""

    def scan_file(self, file_path: str) -> Tuple[AnalysisState, Set[Capability], List[Source], List[Sink], List[TaintFlow]]:
        if not os.path.exists(file_path):
            return AnalysisState.FAILED, set(), [], [], []

        if os.path.getsize(file_path) > MAX_SOURCE_BYTES:
            return AnalysisState.INCOMPLETE, set(), [], [], []

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            tree = ast.parse(content, filename=file_path)
        except Exception:
            return AnalysisState.FAILED, set(), [], [], []

        resolver = ImportResolver()
        resolver.visit(tree)

        visitor = TaintVisitor(file_path, resolver)
        visitor.visit(tree)

        return (
            visitor.analysis_state,
            visitor.observed_capabilities,
            visitor.all_sources,
            visitor.all_sinks,
            visitor.flows,
        )

    def scan_directory(
        self, root_dir: str
    ) -> Tuple[AnalysisState, Set[Capability], List[Source], List[Sink], List[TaintFlow]]:
        overall_state = AnalysisState.COMPLETE
        overall_caps: Set[Capability] = set()
        all_sources: List[Source] = []
        all_sinks: List[Sink] = []
        all_flows: List[TaintFlow] = []

        for dirpath, _, filenames in os.walk(root_dir):
            for fname in sorted(filenames):
                if fname.endswith(".py"):
                    fpath = os.path.join(dirpath, fname)
                    state, caps, sources, sinks, flows = self.scan_file(fpath)

                    if state == AnalysisState.FAILED:
                        overall_state = AnalysisState.FAILED
                    elif state == AnalysisState.INCOMPLETE and overall_state != AnalysisState.FAILED:
                        overall_state = AnalysisState.INCOMPLETE

                    overall_caps.update(caps)
                    all_sources.extend(sources)
                    all_sinks.extend(sinks)
                    all_flows.extend(flows)

        return overall_state, overall_caps, all_sources, all_sinks, all_flows
