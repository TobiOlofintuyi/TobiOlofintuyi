"""
Communication Fidelity Tensor - Configuration

Configuration parameters as specified in CFT-FRD-001 Appendix C.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CFTConfig:
    """
    Configuration for the Communication Fidelity Tensor system.

    All parameters are based on the requirements in CFT-FRD-001.
    """

    # Embedding Configuration (Appendix C)
    embedding_model: str = "sentence-transformers/all-mpnet-base-v2"  # Placeholder for "inyeon-compassion-v2-768d"
    embedding_dimension: int = 768

    # Threshold Parameters (Appendix C)
    uncertainty_threshold_epsilon: float = 0.1  # ε for interpretation counting
    conservation_tolerance: float = 0.05  # ±5% tolerance for conservation principle
    clarification_trigger_threshold: float = 0.5  # When to trigger clarification prompts
    emergence_detection_sensitivity: float = 0.3  # Threshold for emergence detection

    # Quality Thresholds (Section 11.1)
    target_fidelity_score: float = 0.85  # Success metric: F(T) ≥ 0.85
    acceptable_transfer_score: float = 0.75  # FR-T-001
    max_acceptable_loss: float = 0.20  # Mean L < 0.20
    target_emergence_rate: float = 0.30  # G detected in ≥30% of insights
    max_acceptable_uncertainty: float = 0.35  # U_total < 0.35 for 80% of entries

    # Component-Specific Thresholds
    dimensional_loss_threshold: float = 0.3  # FR-L-001: Flag when L_dim > 0.3
    temporal_decay_threshold: float = 0.4  # FR-L-004: Alert when L_temporal > 0.4
    architectural_loss_threshold: float = 0.2  # FR-I-006: Trigger clarification
    aleatoric_uncertainty_threshold: float = 0.5  # FR-I-006: Trigger clarification
    epistemic_uncertainty_threshold: float = 0.5  # FR-U-001: Surface uncertainty
    high_gain_threshold: float = 0.3  # FR-I-007: Tag high-emergence insights
    interpretation_topology_threshold: int = 3  # FR-U-003: Offer interpretation choice

    # User Validation Thresholds (Section 11.2)
    pattern_completion_validation_target: float = 0.7  # FR-G-002
    high_gain_validation_target: float = 0.75  # Section 11.2
    cultural_appropriateness_target: float = 0.8  # FR-G-003
    clarification_effectiveness_target: float = 0.2  # Section 11.2: L reduction

    # Fairness and Bias Thresholds (Section 11.3)
    cross_cultural_variance_threshold: float = 0.1  # Section 11.3
    demographic_loss_bias_threshold: float = 0.1  # FR-P-003: Alert if L > global mean + 0.1

    # Performance Parameters (FR-S-001)
    realtime_latency_ms: int = 500  # T, L, U must complete within 500ms
    async_latency_ms: int = 2000  # G can complete within 2s
    total_latency_constraint_ms: int = 2000  # Section 2.2: <2s total

    # Feedback Loop Configuration (FR-M-003)
    alignment_checkpoint_frequency_entries: int = 3  # Every 3 entries
    alignment_checkpoint_frequency_days: int = 7  # Or weekly
    alignment_engagement_target: float = 0.6  # >60% engagement rate

    # Storage and Retention (FR-S-003)
    rolling_window_days: int = 30  # Keep last 30 days per user
    use_quantized_embeddings: bool = True  # For archival compression

    # Conservation Principle (FR-C-001)
    conservation_pass_rate_target: float = 0.95  # ≥95% must satisfy conservation

    # Back-Translation Validation (FR-M-004)
    reconstruction_error_threshold: float = 0.2  # Error < 0.2 for high-fidelity

    # Measurement Modes
    enable_realtime_measurement: bool = True
    enable_batch_measurement: bool = False
    enable_user_transparency: bool = True  # FR-I-005: Show confidence indicators

    # Privacy Settings (FR-P-001)
    store_raw_entries: bool = False  # Only within session
    store_embeddings: bool = True  # Aggregated, anonymized
    store_metrics_only: bool = True  # Default privacy-preserving mode

    # Debug and Development
    verbose_logging: bool = False
    enable_attention_logging: bool = False  # FR-M-006
    enable_probability_capture: bool = True  # FR-M-007
    enable_knowledge_graph_tracking: bool = True  # FR-M-008

    def __post_init__(self):
        """Validate configuration parameters"""
        # Ensure thresholds are in valid ranges
        assert 0 <= self.target_fidelity_score <= 1
        assert 0 <= self.acceptable_transfer_score <= 1
        assert 0 <= self.conservation_tolerance <= 1
        assert self.embedding_dimension > 0
        assert self.realtime_latency_ms > 0
        assert self.async_latency_ms > 0

    def get_quality_targets(self) -> dict:
        """Return quality targets for monitoring"""
        return {
            "fidelity_score": self.target_fidelity_score,
            "transfer_score": self.acceptable_transfer_score,
            "max_loss": self.max_acceptable_loss,
            "emergence_rate": self.target_emergence_rate,
            "max_uncertainty": self.max_acceptable_uncertainty,
            "conservation_pass_rate": self.conservation_pass_rate_target,
        }

    def get_alert_thresholds(self) -> dict:
        """Return thresholds that trigger alerts or interventions"""
        return {
            "dimensional_loss": self.dimensional_loss_threshold,
            "temporal_decay": self.temporal_decay_threshold,
            "architectural_loss": self.architectural_loss_threshold,
            "aleatoric_uncertainty": self.aleatoric_uncertainty_threshold,
            "epistemic_uncertainty": self.epistemic_uncertainty_threshold,
        }

    def should_trigger_clarification(self, L_arch: float, U_aleatoric: float) -> bool:
        """
        Determine if clarification prompt should be triggered (FR-I-006).

        Args:
            L_arch: Architectural limitation loss
            U_aleatoric: Aleatoric uncertainty

        Returns:
            True if clarification should be requested
        """
        return (L_arch > self.architectural_loss_threshold or
                U_aleatoric > self.aleatoric_uncertainty_threshold)

    def should_show_confidence_indicator(self, U_total: float) -> bool:
        """
        Determine if confidence indicator should be shown to user (FR-I-005).

        Args:
            U_total: Total uncertainty

        Returns:
            True if confidence indicator should be displayed
        """
        return U_total > self.max_acceptable_uncertainty

    def should_highlight_emergence(self, G_total: float) -> bool:
        """
        Determine if emergent insight should be highlighted (FR-I-007).

        Args:
            G_total: Total gain/emergence

        Returns:
            True if insight should be visually marked as emergent
        """
        return G_total > self.high_gain_threshold


# Default configuration instance
DEFAULT_CONFIG = CFTConfig()
