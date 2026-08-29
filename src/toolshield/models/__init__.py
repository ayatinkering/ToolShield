from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Capability(str, Enum):
    """Capability types derived from AST or declared in policy."""
    ENV_READ = "ENV_READ"
    SECRET_READ = "SECRET_READ"
    FILE_READ = "FILE_READ"
    FILE_WRITE = "FILE_WRITE"
    NETWORK_OUTBOUND = "NETWORK_OUTBOUND"
    PROCESS_EXEC = "PROCESS_EXEC"
    DYNAMIC_EXEC = "DYNAMIC_EXEC"
    MCP_TOOL_CALL = "MCP_TOOL_CALL"
    UNKNOWN_DYNAMIC = "UNKNOWN_DYNAMIC"


class AnalysisState(str, Enum):
    """Analysis completeness status for bounded AST scanner."""
    COMPLETE = "COMPLETE"
    INCOMPLETE = "INCOMPLETE"
    FAILED = "FAILED"


class Verdict(str, Enum):
    """Policy evaluation verdict."""
    ALLOW = "ALLOW"
    REVIEW = "REVIEW"
    BLOCK = "BLOCK"


class Location(BaseModel):
    """Source code provenance location."""
    file_path: str
    line: int
    column: int
    end_line: Optional[int] = None
    end_column: Optional[int] = None


class Source(BaseModel):
    """Sensitive data or resource source."""
    source_id: str
    source_type: Capability
    name: str
    location: Location
    details: Dict[str, Any] = Field(default_factory=dict)


class Sink(BaseModel):
    """Dangerous execution or exfiltration sink."""
    sink_id: str
    sink_type: Capability
    name: str
    location: Location
    details: Dict[str, Any] = Field(default_factory=dict)


class TaintFlow(BaseModel):
    """Source-to-sink data or control flow path."""
    flow_id: str
    source: Source
    sink: Sink
    transformations: List[str] = Field(default_factory=list)
    confidence: float = 1.0
    description: str


class Finding(BaseModel):
    """Security finding or rule violation."""
    rule_id: str
    title: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    verdict: Verdict
    description: str
    location: Optional[Location] = None
    flow: Optional[TaintFlow] = None


class ToolIdentity(BaseModel):
    """Unique identity and hashes for a tool in an MCP server."""
    server_identity: str
    tool_name: str
    metadata_hash: str
    implementation_hash: str

    @property
    def full_identity(self) -> str:
        return f"{self.server_identity}::{self.tool_name}"


class PolicyRule(BaseModel):
    """Individual security rule in a policy definition."""
    rule_id: str
    description: str
    verdict: Verdict
    source_type: Optional[Capability] = None
    sink_type: Optional[Capability] = None
    conditions: Dict[str, Any] = Field(default_factory=dict)


class Policy(BaseModel):
    """Policy definition for a tool or server."""
    name: str
    version: str = "1.0.0"
    allowed_capabilities: List[Capability] = Field(default_factory=list)
    allowed_hosts: List[str] = Field(default_factory=list)
    denied_capabilities: List[Capability] = Field(default_factory=list)
    rules: List[PolicyRule] = Field(default_factory=list)


class PolicyEvaluationResult(BaseModel):
    """Result of policy evaluation for a gated tool call."""
    verdict: Verdict
    risk_score: int = Field(ge=0, le=100)
    rules_fired: List[str] = Field(default_factory=list)
    findings: List[Finding] = Field(default_factory=list)
    explanations: List[str] = Field(default_factory=list)
