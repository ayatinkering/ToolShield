"""Scanner resource limits and constraints."""

MAX_SOURCE_BYTES: int = 512 * 1024  # 512 KB per file
MAX_AST_NODES: int = 10_000         # 10,000 nodes per file
MAX_FUNCTIONS: int = 200            # 200 functions per file
MAX_CALL_DEPTH: int = 2             # max depth for inter-procedural propagation
MAX_ANALYSIS_SECONDS: float = 10.0  # max 10 seconds total analysis budget
