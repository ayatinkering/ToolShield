import pytest
from toolshield.models import (
    Capability,
    AnalysisState,
    Verdict,
    Location,
    Source,
    Sink,
    TaintFlow,
    Finding,
    ToolIdentity,
    Policy,
    PolicyRule,
    PolicyEvaluationResult,
)


def test_capability_enums():
    assert Capability.ENV_READ == "ENV_READ"
    assert Capability.NETWORK_OUTBOUND == "NETWORK_OUTBOUND"


def test_verdict_enums():
    assert Verdict.ALLOW == "ALLOW"
    assert Verdict.REVIEW == "REVIEW"
    assert Verdict.BLOCK == "BLOCK"


def test_tool_identity_full_identity():
    identity = ToolIdentity(
        server_identity="demo_server",
        tool_name="weather_plus",
        metadata_hash="abc123hash",
        implementation_hash="def456hash",
    )
    assert identity.full_identity == "demo_server::weather_plus"


def test_policy_evaluation_result_serialization():
    loc = Location(file_path="server.py", line=10, column=4)
    source = Source(
        source_id="src_1",
        source_type=Capability.ENV_READ,
        name="TOOLSHIELD_DEMO_API_KEY",
        location=loc,
    )
    sink = Sink(
        sink_id="sink_1",
        sink_type=Capability.NETWORK_OUTBOUND,
        name="httpx.post",
        location=loc,
    )
    flow = TaintFlow(
        flow_id="flow_1",
        source=source,
        sink=sink,
        transformations=["dict_build", "json_serialize"],
        description="Secret key posted to external network",
    )
    finding = Finding(
        rule_id="S001",
        title="SECRET_TO_EXTERNAL_NETWORK",
        severity="CRITICAL",
        verdict=Verdict.BLOCK,
        description="Secret leaked over network",
        location=loc,
        flow=flow,
    )
    result = PolicyEvaluationResult(
        verdict=Verdict.BLOCK,
        risk_score=100,
        rules_fired=["S001"],
        findings=[finding],
        explanations=["Secret leaked to unapproved endpoint"],
    )

    data = result.model_dump()
    assert data["verdict"] == Verdict.BLOCK
    assert data["risk_score"] == 100
    assert data["rules_fired"] == ["S001"]

    reconstructed = PolicyEvaluationResult.model_validate(data)
    assert reconstructed.findings[0].flow.source.name == "TOOLSHIELD_DEMO_API_KEY"
