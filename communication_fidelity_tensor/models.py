"""
Communication Fidelity Tensor - Core Data Models

This module defines the core data structures for the CFT system as specified
in CFT-FRD-001 Appendix A.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Any, Optional
from enum import Enum


class MeasurementStatus(Enum):
    """Status of a CFT measurement"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class CFTMeasurement:
    """
    Core CFT measurement data structure as per Appendix A.

    Captures all components of the Communication Fidelity Tensor for a single
    journal entry interaction.

    Attributes:
        entry_id: Unique identifier for the journal entry
        timestamp: When the measurement was taken
        transfer_score: T - Semantic transfer score [0,1]
        fidelity_score: F(T) - Information preservation ratio [0,1]
        loss_components: Dictionary of loss measurements
            - L_dim: Dimensional reduction loss
            - L_compress: Compression entropy loss
            - L_arch: Architectural limitation loss
            - L_temporal: Temporal decay loss
            - L_assumption: Assumption gap loss
        gain_components: Dictionary of emergence/gain measurements
            - G_synthesis: Novel connection synthesis
            - G_pattern: Pattern completion
            - G_transfer: Analogical transfer
            - G_emergence: Overall emergence score
        uncertainty_components: Dictionary of uncertainty measurements
            - U_epistemic: Epistemic uncertainty
            - U_aleatoric: Aleatoric uncertainty
            - U_topology: Interpretation space topology
            - U_meta: Meta-uncertainty
        conservation_check: Boolean indicating if conservation principle holds
        conservation_error: Magnitude of conservation violation (if any)
        metadata: Additional contextual information
    """
    entry_id: str
    timestamp: datetime
    transfer_score: float  # T
    fidelity_score: float  # F(T)
    loss_components: Dict[str, float]
    gain_components: Dict[str, float]
    uncertainty_components: Dict[str, float]
    conservation_check: bool
    conservation_error: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    status: MeasurementStatus = MeasurementStatus.COMPLETED

    def __post_init__(self):
        """Validate measurement constraints"""
        # Ensure scores are in valid range
        assert 0 <= self.transfer_score <= 1, "Transfer score must be in [0,1]"
        assert 0 <= self.fidelity_score <= 1, "Fidelity score must be in [0,1]"

        # Validate all component scores are non-negative
        for component, value in self.loss_components.items():
            assert value >= 0, f"Loss component {component} must be non-negative"

        for component, value in self.gain_components.items():
            assert value >= 0, f"Gain component {component} must be non-negative"

        for component, value in self.uncertainty_components.items():
            assert value >= 0, f"Uncertainty component {component} must be non-negative"

    @property
    def total_loss(self) -> float:
        """Calculate total loss |L|"""
        return sum(self.loss_components.values())

    @property
    def total_gain(self) -> float:
        """Calculate total gain |G|"""
        return sum(self.gain_components.values())

    @property
    def total_uncertainty(self) -> float:
        """Calculate total uncertainty |U|"""
        return sum(self.uncertainty_components.values())

    def get_quality_flags(self) -> Dict[str, bool]:
        """
        Generate quality flags based on FR requirements.

        Returns:
            Dictionary of boolean flags indicating quality issues
        """
        return {
            "high_fidelity": self.fidelity_score >= 0.85,  # Success metric
            "acceptable_transfer": self.transfer_score > 0.75,  # FR-T-001
            "high_loss": self.total_loss > 0.3,  # FR-L-001
            "high_uncertainty": self.total_uncertainty > 0.35,  # Section 11.1
            "needs_clarification": (
                self.loss_components.get("L_arch", 0) > 0.2 or
                self.uncertainty_components.get("U_aleatoric", 0) > 0.5
            ),  # FR-I-006
            "has_emergence": self.total_gain > 0.3,  # FR-G-004
            "conservation_valid": self.conservation_check,
            "low_confidence": self.uncertainty_components.get("U_epistemic", 0) > 0.5,
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "entry_id": self.entry_id,
            "timestamp": self.timestamp.isoformat(),
            "transfer_score": self.transfer_score,
            "fidelity_score": self.fidelity_score,
            "loss_components": self.loss_components,
            "gain_components": self.gain_components,
            "uncertainty_components": self.uncertainty_components,
            "conservation_check": self.conservation_check,
            "conservation_error": self.conservation_error,
            "metadata": self.metadata,
            "status": self.status.value,
            "quality_flags": self.get_quality_flags(),
        }


@dataclass
class TransferTopology:
    """
    Instrumented conversation protocol tracker as per FR-M-001.

    Tracks the four states of information flow through the system:
    1. Sent: User journal entries
    2. Understood: Parsed/embedded representations
    3. Generated: AI insights produced
    4. Confirmed: User validations

    This enables transfer topology measurement and alignment verification.
    """
    session_id: str
    user_id: str
    created_at: datetime = field(default_factory=datetime.now)

    # Four topology states
    sent: List[Dict[str, Any]] = field(default_factory=list)
    understood: List[Dict[str, Any]] = field(default_factory=list)
    generated: List[Dict[str, Any]] = field(default_factory=list)
    confirmed: List[Dict[str, Any]] = field(default_factory=list)

    # CFT measurements for each entry
    measurements: List[CFTMeasurement] = field(default_factory=list)

    # Session-level aggregates
    session_metadata: Dict[str, Any] = field(default_factory=dict)

    def add_sent(self, entry_id: str, content: str, metadata: Optional[Dict] = None):
        """Record user journal entry (Sent state)"""
        self.sent.append({
            "entry_id": entry_id,
            "content": content,
            "timestamp": datetime.now(),
            "metadata": metadata or {}
        })

    def add_understood(self, entry_id: str, parsed_data: Dict, embedding: Any, metadata: Optional[Dict] = None):
        """Record parsed/embedded representation (Understood state)"""
        self.understood.append({
            "entry_id": entry_id,
            "parsed_data": parsed_data,
            "embedding": embedding,
            "timestamp": datetime.now(),
            "metadata": metadata or {}
        })

    def add_generated(self, entry_id: str, insight: str, metadata: Optional[Dict] = None):
        """Record AI-generated insight (Generated state)"""
        self.generated.append({
            "entry_id": entry_id,
            "insight": insight,
            "timestamp": datetime.now(),
            "metadata": metadata or {}
        })

    def add_confirmed(self, entry_id: str, validation: Dict, metadata: Optional[Dict] = None):
        """Record user validation (Confirmed state)"""
        self.confirmed.append({
            "entry_id": entry_id,
            "validation": validation,
            "timestamp": datetime.now(),
            "metadata": metadata or {}
        })

    def add_measurement(self, measurement: CFTMeasurement):
        """Add a CFT measurement to the session"""
        self.measurements.append(measurement)

    def get_session_statistics(self) -> Dict[str, Any]:
        """
        Calculate session-level statistics as per Section 11.1.

        Returns:
            Dictionary of aggregated metrics
        """
        if not self.measurements:
            return {
                "entry_count": 0,
                "mean_fidelity": 0.0,
                "mean_transfer": 0.0,
                "mean_loss": 0.0,
                "mean_gain": 0.0,
                "mean_uncertainty": 0.0,
                "fidelity_variance": 0.0,
                "conservation_pass_rate": 0.0,
            }

        n = len(self.measurements)
        fidelities = [m.fidelity_score for m in self.measurements]
        transfers = [m.transfer_score for m in self.measurements]
        losses = [m.total_loss for m in self.measurements]
        gains = [m.total_gain for m in self.measurements]
        uncertainties = [m.total_uncertainty for m in self.measurements]

        return {
            "entry_count": n,
            "mean_fidelity": sum(fidelities) / n,
            "mean_transfer": sum(transfers) / n,
            "mean_loss": sum(losses) / n,
            "mean_gain": sum(gains) / n,
            "mean_uncertainty": sum(uncertainties) / n,
            "fidelity_variance": self._variance(fidelities),
            "conservation_pass_rate": sum(m.conservation_check for m in self.measurements) / n,
            "high_fidelity_rate": sum(f >= 0.85 for f in fidelities) / n,
            "emergence_rate": sum(m.total_gain > 0 for m in self.measurements) / n,
        }

    @staticmethod
    def _variance(values: List[float]) -> float:
        """Calculate variance"""
        if not values:
            return 0.0
        mean = sum(values) / len(values)
        return sum((x - mean) ** 2 for x in values) / len(values)

    def get_alignment_checkpoint_data(self) -> Dict[str, Any]:
        """
        Generate data for alignment checkpoint as per FR-M-003.

        Returns recent themes, uncertainties, and emergent connections
        for user validation.
        """
        recent_measurements = self.measurements[-3:] if len(self.measurements) >= 3 else self.measurements

        # Extract high-uncertainty items
        uncertainties = []
        for m in recent_measurements:
            if m.uncertainty_components.get("U_epistemic", 0) > 0.4:
                uncertainties.append({
                    "entry_id": m.entry_id,
                    "uncertainty": m.uncertainty_components
                })

        # Extract emergent connections
        emergent = []
        for m in recent_measurements:
            if m.total_gain > 0.3:
                emergent.append({
                    "entry_id": m.entry_id,
                    "gain": m.gain_components
                })

        return {
            "recent_entries": len(recent_measurements),
            "uncertainties": uncertainties,
            "emergent_connections": emergent,
            "session_stats": self.get_session_statistics(),
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "sent_count": len(self.sent),
            "understood_count": len(self.understood),
            "generated_count": len(self.generated),
            "confirmed_count": len(self.confirmed),
            "measurements": [m.to_dict() for m in self.measurements],
            "session_statistics": self.get_session_statistics(),
            "session_metadata": self.session_metadata,
        }


@dataclass
class ConceptNode:
    """
    Represents a concept in the knowledge graph for FR-T-003 and FR-M-008.

    Used for concept overlap detection and compassion ontology mapping.
    """
    concept_id: str
    name: str
    category: str  # e.g., "compassion", "growth", "connection"
    embedding: Optional[Any] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __hash__(self):
        return hash(self.concept_id)

    def __eq__(self, other):
        if not isinstance(other, ConceptNode):
            return False
        return self.concept_id == other.concept_id


@dataclass
class InterpretationAlternative:
    """
    Represents an alternative interpretation for uncertainty quantification (FR-M-007).
    """
    interpretation_id: str
    probability: float
    description: str
    metadata: Dict[str, Any] = field(default_factory=dict)
