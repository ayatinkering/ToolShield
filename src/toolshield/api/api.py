import os
from typing import Any, Dict, Optional
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from toolshield.baseline.store import BaselineStore
from toolshield.graph.renderer import GraphRenderer
from toolshield.models import PolicyEvaluationResult
from toolshield.policy import PolicyEngine
from toolshield.scanner import ASTScanner

app = FastAPI(
    title="ToolShield Control Plane API",
    description="REST Control Plane API for ToolShield MCP Security Proxy",
    version="0.1.0",
)


class ScanRequest(BaseModel):
    source_root: str = Field(..., description="Path to Python source root of target MCP server")


class DiffRequest(BaseModel):
    baseline_file: str = Field(..., description="Path to baseline JSON file")
    current_file_or_root: str = Field(..., description="Path to current baseline JSON or source root")


@app.get("/health")
def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok", "service": "toolshield-control-plane"}


@app.post("/scan")
def scan_endpoint(request: ScanRequest) -> Dict[str, Any]:
    """Run AST static scan on source root."""
    if not os.path.exists(request.source_root):
        raise HTTPException(status_code=404, detail=f"Source root not found: {request.source_root}")

    scanner = ASTScanner()
    state, caps, sources, sinks, flows = scanner.scan_directory(request.source_root)
    engine = PolicyEngine()
    result = engine.evaluate(state, caps, flows)

    return {
        "analysis_state": state.value,
        "observed_capabilities": [c.value for c in caps],
        "sources_count": len(sources),
        "sinks_count": len(sinks),
        "taint_flows_count": len(flows),
        "verdict": result.verdict.value,
        "risk_score": result.risk_score,
        "rules_fired": result.rules_fired,
    }


@app.post("/diff")
def diff_endpoint(request: DiffRequest) -> Dict[str, Any]:
    """Compare baseline against current state."""
    if not os.path.exists(request.baseline_file):
        raise HTTPException(status_code=404, detail=f"Baseline file not found: {request.baseline_file}")

    try:
        base_data = BaselineStore.load_baseline(request.baseline_file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading baseline file: {e}")

    if request.current_file_or_root.endswith(".json") and os.path.exists(request.current_file_or_root):
        curr_data = BaselineStore.load_baseline(request.current_file_or_root)
    elif os.path.exists(request.current_file_or_root):
        curr_data = {
            "metadata_hash": base_data.get("metadata_hash"),
            "implementation_hash": BaselineStore.compute_implementation_hash(request.current_file_or_root),
        }
    else:
        raise HTTPException(status_code=404, detail=f"Current target not found: {request.current_file_or_root}")

    meta_drift = base_data.get("metadata_hash") != curr_data.get("metadata_hash")
    impl_drift = base_data.get("implementation_hash") != curr_data.get("implementation_hash")

    return {
        "metadata_drift": meta_drift,
        "implementation_drift": impl_drift,
        "baseline_hashes": base_data,
        "current_hashes": curr_data,
    }


@app.get("/graph/{tool}")
def graph_endpoint(
    tool: str,
    source_root: str = Query(..., description="Path to Python source root"),
    format: str = Query("text", description="Output format: 'text' or 'dot'"),
) -> Dict[str, str]:
    """Get taint flow graph for a tool."""
    if not os.path.exists(source_root):
        raise HTTPException(status_code=404, detail=f"Source root not found: {source_root}")

    scanner = ASTScanner()
    _, _, _, _, flows = scanner.scan_directory(source_root)

    if format.lower() == "dot":
        graph_output = GraphRenderer.render_dot(flows, tool_name=tool)
    else:
        graph_output = GraphRenderer.render_text(flows, tool_name=tool)

    return {"tool": tool, "format": format, "graph": graph_output}


@app.get("/policy")
def policy_endpoint() -> Dict[str, Any]:
    """Get active policy rule definitions."""
    return {
        "rules": [
            {"id": "S001", "name": "SECRET_TO_EXTERNAL_NETWORK", "verdict": "BLOCK"},
            {"id": "S002", "name": "CREDENTIAL_TO_PROCESS_EXECUTION", "verdict": "BLOCK"},
            {"id": "S003", "name": "SECRET_TO_SENSITIVE_FILE_WRITE", "verdict": "BLOCK"},
            {"id": "S004", "name": "CAPABILITY_DRIFT", "verdict": "REVIEW"},
            {"id": "S005", "name": "ANALYSIS_FAILED", "verdict": "BLOCK"},
            {"id": "S006", "name": "ANALYSIS_INCOMPLETE", "verdict": "REVIEW"},
            {"id": "S007", "name": "BASELINE_CHANGED", "verdict": "REVIEW"},
            {"id": "S008", "name": "CRITICAL_RUG_PULL", "verdict": "BLOCK"},
            {"id": "S009", "name": "IDENTITY_AMBIGUITY", "verdict": "REVIEW"},
        ]
    }
