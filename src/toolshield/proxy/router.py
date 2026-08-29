import json
from typing import Any, Dict, Optional, Tuple, Union


class JSONRPCMessage:
    """JSON-RPC 2.0 message model preserving exact request IDs (int or str)."""

    def __init__(
        self,
        raw_dict: Dict[str, Any],
        msg_type: str,  # 'request', 'response', 'notification', 'error'
        method: Optional[str] = None,
        msg_id: Optional[Union[int, str]] = None,
        params: Optional[Dict[str, Any]] = None,
    ):
        self.raw_dict = raw_dict
        self.msg_type = msg_type
        self.method = method
        self.msg_id = msg_id
        self.params = params or {}


class JSONRPCRouter:
    """Parser and router for JSON-RPC stdio traffic."""

    @staticmethod
    def parse(line: str) -> Tuple[Optional[JSONRPCMessage], Optional[str]]:
        """Parse a single JSON line into a JSONRPCMessage."""
        line = line.strip()
        if not line:
            return None, "Empty line"

        try:
            data = json.loads(line)
        except Exception as e:
            return None, f"Invalid JSON: {e}"

        if not isinstance(data, dict) or data.get("jsonrpc") != "2.0":
            return None, "Not JSON-RPC 2.0 format"

        msg_id = data.get("id")
        method = data.get("method")
        params = data.get("params", {})

        if method:
            if msg_id is not None:
                msg_type = "request"
            else:
                msg_type = "notification"
        elif "result" in data or "error" in data:
            if "error" in data:
                msg_type = "error"
            else:
                msg_type = "response"
        else:
            msg_type = "unknown"

        return (
            JSONRPCMessage(
                raw_dict=data,
                msg_type=msg_type,
                method=method,
                msg_id=msg_id,
                params=params,
            ),
            None,
        )

    @staticmethod
    def create_error_response(
        msg_id: Union[int, str],
        code: int = -32000,
        message: str = "ToolShield policy blocked tool execution",
        verdict: str = "BLOCK",
        rules_fired: list = None,
        risk_score: int = 100,
    ) -> str:
        """Create a protocol-compliant JSON-RPC error response for blocked calls."""
        err_resp = {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {
                "code": code,
                "message": message,
                "data": {
                    "verdict": verdict,
                    "rules": rules_fired or [],
                    "risk": risk_score,
                },
            },
        }
        return json.dumps(err_resp) + "\n"
