from typing import List, Optional, Set
from toolshield.models import (
    AnalysisState,
    Capability,
    Finding,
    Policy,
    PolicyEvaluationResult,
    TaintFlow,
    Verdict,
)


class PolicyEngine:
    """Evaluates scanner findings and capability diffs against security policy rules (S001-S009)."""

    def _find_flow(self, flows: List[TaintFlow], source_types: Set[Capability], sink_type: Capability) -> Optional[TaintFlow]:
        """DRY helper to search flows for specific source and sink capability matches."""
        for f in flows:
            if f.source.source_type in source_types and f.sink.sink_type == sink_type:
                return f
        return None

    def evaluate(
        self,
        analysis_state: AnalysisState,
        observed_capabilities: Set[Capability],
        flows: List[TaintFlow],
        policy: Optional[Policy] = None,
        baseline_changed: bool = False,
        critical_rug_pull: bool = False,
        identity_ambiguous: bool = False,
    ) -> PolicyEvaluationResult:
        rules_fired: List[str] = []
        findings: List[Finding] = []
        explanations: List[str] = []
        risk_score: int = 0
        final_verdict: Verdict = Verdict.ALLOW

        # Rule S005: Parse / Scanner failure
        if analysis_state == AnalysisState.FAILED:
            rules_fired.append("S005")
            explanations.append("S005: Python parse failure or scanner exception; safe execution cannot be established.")
            findings.append(
                Finding(
                    rule_id="S005",
                    title="ANALYSIS_FAILED",
                    severity="CRITICAL",
                    verdict=Verdict.BLOCK,
                    description="AST parsing failed for target Python server.",
                )
            )
            return PolicyEvaluationResult(
                verdict=Verdict.BLOCK,
                risk_score=100,
                rules_fired=rules_fired,
                findings=findings,
                explanations=explanations,
            )

        # Rule S001: Secret to external network flow
        s001_flow = self._find_flow(flows, {Capability.ENV_READ, Capability.SECRET_READ}, Capability.NETWORK_OUTBOUND)
        if s001_flow:
            rules_fired.append("S001")
            explanations.append("S001: Confirmed secret source flows directly into external network sink.")
            findings.append(
                Finding(
                    rule_id="S001",
                    title="SECRET_TO_EXTERNAL_NETWORK",
                    severity="CRITICAL",
                    verdict=Verdict.BLOCK,
                    description="Secret key or credential exfiltrated to network endpoint.",
                    flow=s001_flow,
                )
            )

        # Rule S002: Credential to process execution
        s002_flow = self._find_flow(flows, {Capability.ENV_READ, Capability.SECRET_READ}, Capability.PROCESS_EXEC)
        if s002_flow:
            rules_fired.append("S002")
            explanations.append("S002: Credential or secret flows into shell/process execution sink.")
            findings.append(
                Finding(
                    rule_id="S002",
                    title="CREDENTIAL_TO_PROCESS_EXECUTION",
                    severity="CRITICAL",
                    verdict=Verdict.BLOCK,
                    description="Secret passed to process execution.",
                    flow=s002_flow,
                )
            )

        # Rule S003: Secret to sensitive file write
        s003_flow = self._find_flow(flows, {Capability.ENV_READ, Capability.SECRET_READ}, Capability.FILE_WRITE)
        if s003_flow:
            rules_fired.append("S003")
            explanations.append("S003: Secret flows into file write sink.")
            findings.append(
                Finding(
                    rule_id="S003",
                    title="SECRET_TO_SENSITIVE_FILE_WRITE",
                    severity="CRITICAL",
                    verdict=Verdict.BLOCK,
                    description="Secret written to disk file.",
                    flow=s003_flow,
                )
            )

        # Rule S008: Critical Rug Pull
        if critical_rug_pull:
            rules_fired.append("S008")
            explanations.append("S008: Critical rug pull detected! Implementation changed and introduced a critical secret flow.")
            findings.append(
                Finding(
                    rule_id="S008",
                    title="CRITICAL_RUG_PULL",
                    severity="CRITICAL",
                    verdict=Verdict.BLOCK,
                    description="Trusted baseline implementation mutated to add malicious flows.",
                )
            )

        # Evaluate BLOCK condition
        if any(f.verdict == Verdict.BLOCK for f in findings):
            return PolicyEvaluationResult(
                verdict=Verdict.BLOCK,
                risk_score=100,
                rules_fired=rules_fired,
                findings=findings,
                explanations=explanations,
            )

        # Rule S004: Capability Drift / Undeclared Capabilities
        if policy:
            allowed = set(policy.allowed_capabilities)
            drift = observed_capabilities - allowed
            if drift:
                rules_fired.append("S004")
                explanations.append(f"S004: Undeclared capability observed: {[c.value for c in drift]}")
                risk_score += 20 * len(drift)
                findings.append(
                    Finding(
                        rule_id="S004",
                        title="CAPABILITY_DRIFT",
                        severity="HIGH",
                        verdict=Verdict.REVIEW,
                        description=f"Tool exhibits undeclared capabilities: {drift}",
                    )
                )

        # Rule S006: Incomplete Analysis
        if analysis_state == AnalysisState.INCOMPLETE:
            rules_fired.append("S006")
            explanations.append("S006: Analysis incomplete due to resource limits; conservative review required.")
            risk_score += 25
            findings.append(
                Finding(
                    rule_id="S006",
                    title="ANALYSIS_INCOMPLETE",
                    severity="MEDIUM",
                    verdict=Verdict.REVIEW,
                    description="Resource bounds exceeded during scan.",
                )
            )

        # Rule S007: Baseline Changed
        if baseline_changed:
            rules_fired.append("S007")
            explanations.append("S007: Metadata or implementation hash changed since last baseline.")
            risk_score += 20
            findings.append(
                Finding(
                    rule_id="S007",
                    title="BASELINE_CHANGED",
                    severity="MEDIUM",
                    verdict=Verdict.REVIEW,
                    description="Hash mismatch against saved baseline.",
                )
            )

        # Rule S009: Identity Ambiguity
        if identity_ambiguous:
            rules_fired.append("S009")
            explanations.append("S009: Ambiguous tool identity or name collision across servers.")
            risk_score += 20
            findings.append(
                Finding(
                    rule_id="S009",
                    title="IDENTITY_AMBIGUITY",
                    severity="MEDIUM",
                    verdict=Verdict.REVIEW,
                    description="Multiple tools share identical name or mapping.",
                )
            )

        # Calculate final verdict based on REVIEW rules
        if any(f.verdict == Verdict.REVIEW for f in findings):
            final_verdict = Verdict.REVIEW
        else:
            final_verdict = Verdict.ALLOW

        return PolicyEvaluationResult(
            verdict=final_verdict,
            risk_score=min(risk_score, 100),
            rules_fired=rules_fired,
            findings=findings,
            explanations=explanations,
        )
