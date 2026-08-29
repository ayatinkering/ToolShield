from typing import Any, Dict, Optional, Union
from pydantic import BaseModel, Field


class JSONRPCMessage(BaseModel):
    """Pydantic model for JSON-RPC 2.0 messages with strict validation."""

    jsonrpc: str = Field(default="2.0", pattern="^2\\.0$")
    id: Optional[Union[int, str]] = None
    method: Optional[str] = None
    params: Dict[str, Any] = Field(default_factory=dict)
    result: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None

    @property
    def msg_type(self) -> str:
        if self.method:
            return "request" if self.id is not None else "notification"
        if self.error:
            return "error"
        if self.result is not None:
            return "response"
        return "unknown"


class JSONRPCRouter:
    """Parser and router for JSON-RPC stdio traffic using Pydantic JSONRPCMessage validation."""

    @staticmethod
    def parse(line: str) -> tuple[Optional[JSONRPCMessage], Optional[str]]:
        """Parse a single JSON line into a JSONRPCMessage."""
        line = line.strip()
        if not line:
            return None, "Empty line"

        try:
            msg = JSONRPCMessage.model_validate_json(line)
            return msg, None
        except Exception as e:
            return None, f"Invalid JSON-RPC 2.0 message: {e}"

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
        err_msg = JSONRPCMessage(
            id=msg_id,
            error={
                "code": code,
                "message": message,
                "data": {
                    "verdict": verdict,
                    "rules": rules_fired or [],
                    "risk": risk_score,
                },
            },
        )
        return err_msg.model_dump_json(exclude_none=True) + "\n"
