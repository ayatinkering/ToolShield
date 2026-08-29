import ast
from typing import Dict, List, Optional, Tuple, Set
from toolshield.models import Capability, Location


# Known sensitive file names/patterns
SENSITIVE_FILE_NAMES: Set[str] = {
    ".env",
    "id_rsa",
    "id_ed25519",
    "credentials",
    "shadow",
    "passwd",
    "secrets.json",
    "secrets.yaml",
}

# Network sink functions
NETWORK_SINKS: Set[str] = {
    "requests.get",
    "requests.post",
    "requests.put",
    "requests.patch",
    "requests.delete",
    "httpx.get",
    "httpx.post",
    "httpx.put",
    "httpx.patch",
    "httpx.delete",
    "urllib.request.urlopen",
    "aiohttp.ClientSession.get",
    "aiohttp.ClientSession.post",
    "socket.connect",
}

# Process execution sinks
PROCESS_SINKS: Set[str] = {
    "subprocess.run",
    "subprocess.Popen",
    "subprocess.call",
    "subprocess.check_call",
    "subprocess.check_output",
    "os.system",
    "os.popen",
    "os.execv",
    "os.execve",
}

# File write modes
WRITE_MODES: Set[str] = {"w", "wb", "a", "ab", "w+", "a+"}
READ_MODES: Set[str] = {"r", "rb", "r+"}


def extract_location(node: ast.AST, file_path: str) -> Location:
    """Extract source location from an AST node."""
    return Location(
        file_path=file_path,
        line=getattr(node, "lineno", 1),
        column=getattr(node, "col_offset", 0),
        end_line=getattr(node, "end_lineno", None),
        end_column=getattr(node, "end_col_offset", None),
    )


def is_env_read(call_str: str, node: ast.Call) -> bool:
    """Check if call is os.getenv, os.environ.get, or os.environ[...] access."""
    if call_str in ("os.getenv", "os.environ.get", "os.environ"):
        return True
    return False


def is_sensitive_file_read(node: ast.Call, canonical_func: str) -> Optional[str]:
    """Check if open() call is reading a sensitive file."""
    if canonical_func != "open":
        return None

    if not node.args:
        return None

    # Check mode (arg index 1 or kwarg 'mode')
    mode = "r"
    if len(node.args) > 1 and isinstance(node.args[1], ast.Constant):
        mode = str(node.args[1].value)
    for kw in node.keywords:
        if kw.arg == "mode" and isinstance(kw.value, ast.Constant):
            mode = str(kw.value.value)

    if mode not in READ_MODES:
        return None

    # Check filename
    first_arg = node.args[0]
    if isinstance(first_arg, ast.Constant):
        filename = str(first_arg.value)
        for sensitive in SENSITIVE_FILE_NAMES:
            if sensitive in filename:
                return filename

    return None


def is_file_write(node: ast.Call, canonical_func: str) -> Optional[str]:
    """Check if call is writing to a file (open in write mode or pathlib write)."""
    if canonical_func in ("pathlib.Path.write_text", "pathlib.Path.write_bytes"):
        return canonical_func

    if canonical_func == "open":
        mode = ""
        if len(node.args) > 1 and isinstance(node.args[1], ast.Constant):
            mode = str(node.args[1].value)
        for kw in node.keywords:
            if kw.arg == "mode" and isinstance(kw.value, ast.Constant):
                mode = str(kw.value.value)

        if mode in WRITE_MODES:
            return "open(..., write_mode)"

    return None
