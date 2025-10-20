"""
Communication Fidelity Tensor - Main Orchestrator

Coordinates all CFT components and implements conservation principle validation.
Implements FR-C-001 and FR-M-002.
"""

import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime
import time

from ..models import CFTMeasurement, TransferTopology, ConceptNode, InterpretationAlternative
from ..config import CFTConfig
from .transfer import TransferFunction, TransferResult
from .loss import LossFunction, LossResult
from .gain import GainFunction, GainResult
from .uncertainty import UncertaintyFunction, UncertaintyResult


class CommunicationFidelityTensor:
    """
    Main CFT orchestrator.

    Coordinates Transfer, Loss, Gain, and Uncertainty functions to produce
    complete fidelity measurements with conservation principle validation.
    """

    def __init__(
        self,
        config: Optional[CFTConfig] = None,
        embedding_model: Optional[Any] = None,
        knowledge_graph: Optional[Any] = None
    ):
        """
        Initialize CFT system.

        Args:
            config: Configuration (uses default if None)
            embedding_model: Embedding model for semantic similarity
            knowledge_graph: Knowledge graph for concept connections
        """
        self.config = config or CFTConfig()

        # Initialize function modules
        self.transfer_fn = TransferFunction(self.config, embedding_model)
        self.loss_fn = LossFunction(self.config)
        self.gain_fn = GainFunction(self.config, knowledge_graph)
        self.uncertainty_fn = UncertaintyFunction(self.config)

        # Performance tracking
        self._measurement_times: List[float] = []

    def measure(
        self,
        entry_id: str,
        entry_text: str,
        entry_embedding: np.ndarray,
        insight_text: str,
        insight_embedding: np.ndarray,
        entry_concepts: Optional[List[ConceptNode]] = None,
        insight_concepts: Optional[List[ConceptNode]] = None,
        internal_representation: Optional[Any] = None,
        conversation_context: Optional[List[Dict]] = None,
        probability_distribution: Optional[np.ndarray] = None,
        alternative_interpretations: Optional[List[InterpretationAlternative]] = None,
        model_capabilities: Optional[set] = None,
        training_patterns: Optional[List[Dict]] = None,
    ) -> CFTMeasurement:
        """
        Perform complete CFT measurement.

        Implements FR-M-002: Real-Time Fidelity Measurement.

        Args:
            entry_id: Unique identifier for this entry
            entry_text: Original user journal entry
            entry_embedding: Embedding of entry
            insight_text: AI-generated insight
            insight_embedding: Embedding of insight
            entry_concepts: Concepts extracted from entry
            insight_concepts: Concepts in generated insight
            internal_representation: Model's internal representation
            conversation_context: Previous conversation turns
            probability_distribution: Model's probability distribution
            alternative_interpretations: Alternative interpretations
            model_capabilities: Model capability domains
            training_patterns: Training patterns for pattern completion

        Returns:
            Complete CFTMeasurement

        Raises:
            ValueError: If required parameters are missing
        """
        start_time = time.time()

        # Validate inputs
        if entry_text is None or insight_text is None:
            raise ValueError("entry_text and insight_text are required")

        # Default empty lists
        entry_concepts = entry_concepts or []
        insight_concepts = insight_concepts or []
        conversation_context = conversation_context or []

        # Step 1: Measure Transfer (T)
        transfer_result = self.transfer_fn.measure_transfer(
            entry_text=entry_text,
            entry_embedding=entry_embedding,
            insight_text=insight_text,
            insight_embedding=insight_embedding,
            entry_concepts=entry_concepts,
            insight_concepts=insight_concepts,
        )

        # Step 2: Measure Loss (L)
        loss_result = self.loss_fn.measure_loss(
            entry_text=entry_text,
            entry_embedding=entry_embedding,
            internal_representation=internal_representation or insight_embedding,
            entry_concepts=entry_concepts,
            model_capabilities=model_capabilities,
            conversation_context=conversation_context,
        )

        # Step 3: Measure Gain (G)
        gain_result = self.gain_fn.measure_gain(
            entry_text=entry_text,
            entry_concepts=entry_concepts,
            insight_text=insight_text,
            insight_concepts=insight_concepts,
            entry_embedding=entry_embedding,
            insight_embedding=insight_embedding,
            training_patterns=training_patterns,
        )

        # Step 4: Measure Uncertainty (U)
        # Generate alternatives if not provided
        if alternative_interpretations is None:
            alternative_interpretations = self.uncertainty_fn.generate_alternative_interpretations(
                entry_text
            )

        uncertainty_result = self.uncertainty_fn.measure_uncertainty(
            entry_text=entry_text,
            probability_distribution=probability_distribution,
            alternative_interpretations=alternative_interpretations,
            contextual_information={
                "previous_entries": conversation_context,
                "entry_concepts": entry_concepts
            },
        )

        # Step 5: Validate Conservation Principle (FR-C-001)
        conservation_check, conservation_error = self.validate_conservation(
            transfer_result=transfer_result,
            loss_result=loss_result,
            gain_result=gain_result,
            uncertainty_result=uncertainty_result,
        )

        # Calculate elapsed time
        elapsed_time = time.time() - start_time
        self._measurement_times.append(elapsed_time)

        # Create CFTMeasurement
        measurement = CFTMeasurement(
            entry_id=entry_id,
            timestamp=datetime.now(),
            transfer_score=transfer_result.transfer_score,
            fidelity_score=transfer_result.fidelity_score,
            loss_components={
                "L_dim": loss_result.L_dim,
                "L_compress": loss_result.L_compress,
                "L_arch": loss_result.L_arch,
                "L_temporal": loss_result.L_temporal,
                "L_assumption": loss_result.L_assumption,
            },
            gain_components={
                "G_synthesis": gain_result.G_synthesis,
                "G_pattern": gain_result.G_pattern,
                "G_transfer": gain_result.G_transfer,
                "G_emergence": gain_result.G_emergence,
            },
            uncertainty_components={
                "U_epistemic": uncertainty_result.U_epistemic,
                "U_aleatoric": uncertainty_result.U_aleatoric,
                "U_topology": uncertainty_result.U_topology,
                "U_meta": uncertainty_result.U_meta,
            },
            conservation_check=conservation_check,
            conservation_error=conservation_error,
            metadata={
                "measurement_time_ms": elapsed_time * 1000,
                "entry_length": len(entry_text),
                "insight_length": len(insight_text),
                "num_entry_concepts": len(entry_concepts),
                "num_insight_concepts": len(insight_concepts),
                "conversation_length": len(conversation_context),
                "transfer_metadata": transfer_result.metadata,
                "loss_metadata": loss_result.metadata,
                "gain_metadata": gain_result.metadata,
                "uncertainty_metadata": uncertainty_result.metadata,
            }
        )

        # Validate performance constraints (FR-S-001)
        self._check_performance_constraints(elapsed_time)

        return measurement

    def validate_conservation(
        self,
        transfer_result: TransferResult,
        loss_result: LossResult,
        gain_result: GainResult,
        uncertainty_result: UncertaintyResult,
    ) -> tuple[bool, float]:
        """
        FR-C-001: Information Conservation Check

        Validate: |S_h| + |G| = |T| + |L| + |U|

        Acceptance: ≥95% of transactions satisfy conservation within ±5% tolerance

        Args:
            transfer_result: Transfer measurement result
            loss_result: Loss measurement result
            gain_result: Gain measurement result
            uncertainty_result: Uncertainty measurement result

        Returns:
            Tuple of (conservation_valid, error_magnitude)
        """
        # Left side: Original signal + Gain
        # We approximate |S_h| as 1.0 (normalized)
        S_h = 1.0
        G_total = gain_result.total_gain

        left_side = S_h + G_total

        # Right side: Transfer + Loss + Uncertainty
        T = transfer_result.transfer_score
        L_total = loss_result.total_loss
        U_total = uncertainty_result.total_uncertainty

        right_side = T + L_total + U_total

        # Calculate error
        error = abs(left_side - right_side)

        # Check against tolerance
        tolerance = self.config.conservation_tolerance
        conservation_valid = error <= tolerance

        return conservation_valid, float(error)

    def measure_session(
        self,
        session: TransferTopology,
        entries: List[Dict[str, Any]],
        insights: List[Dict[str, Any]],
    ) -> TransferTopology:
        """
        Measure CFT for an entire session.

        Args:
            session: TransferTopology session object
            entries: List of entry dictionaries with text, embedding, concepts
            insights: List of insight dictionaries with text, embedding, concepts

        Returns:
            Updated TransferTopology with measurements
        """
        if len(entries) != len(insights):
            raise ValueError("Number of entries must match number of insights")

        for i, (entry, insight) in enumerate(zip(entries, insights)):
            # Extract data
            entry_id = entry.get("entry_id", f"{session.session_id}_{i}")
            entry_text = entry["text"]
            entry_embedding = entry["embedding"]
            entry_concepts = entry.get("concepts", [])

            insight_text = insight["text"]
            insight_embedding = insight["embedding"]
            insight_concepts = insight.get("concepts", [])

            # Get conversation context (previous entries)
            conversation_context = [
                {"content": e["text"], "timestamp": e.get("timestamp")}
                for e in entries[:i]
            ]

            # Measure
            measurement = self.measure(
                entry_id=entry_id,
                entry_text=entry_text,
                entry_embedding=entry_embedding,
                insight_text=insight_text,
                insight_embedding=insight_embedding,
                entry_concepts=entry_concepts,
                insight_concepts=insight_concepts,
                conversation_context=conversation_context,
            )

            # Add to session
            session.add_sent(entry_id, entry_text, entry.get("metadata"))
            session.add_understood(entry_id, entry.get("parsed_data", {}), entry_embedding)
            session.add_generated(entry_id, insight_text, insight.get("metadata"))
            session.add_measurement(measurement)

        return session

    def get_user_facing_feedback(self, measurement: CFTMeasurement) -> Dict[str, Any]:
        """
        Generate user-facing feedback based on measurement.

        Implements FR-I-005, FR-I-006, FR-I-007.

        Args:
            measurement: CFT measurement

        Returns:
            Dictionary of user-facing feedback elements
        """
        feedback = {
            "show_confidence_indicator": False,
            "confidence_message": None,
            "request_clarification": False,
            "clarification_prompt": None,
            "highlight_emergence": False,
            "emergence_marker": None,
        }

        quality_flags = measurement.get_quality_flags()

        # FR-I-005: Confidence Indicator
        if self.config.should_show_confidence_indicator(measurement.total_uncertainty):
            feedback["show_confidence_indicator"] = True
            feedback["confidence_message"] = (
                "I'm exploring this with you—let me know if this resonates"
            )

        # FR-I-006: Clarification Prompt
        L_arch = measurement.loss_components.get("L_arch", 0)
        U_aleatoric = measurement.uncertainty_components.get("U_aleatoric", 0)

        if self.config.should_trigger_clarification(L_arch, U_aleatoric):
            feedback["request_clarification"] = True
            feedback["clarification_prompt"] = (
                self._generate_clarification_prompt(measurement)
            )

        # FR-I-007: Emergence Highlighting
        if self.config.should_highlight_emergence(measurement.total_gain):
            feedback["highlight_emergence"] = True
            feedback["emergence_marker"] = "New connection discovered"

        return feedback

    def _generate_clarification_prompt(self, measurement: CFTMeasurement) -> str:
        """Generate a clarification prompt based on measurement"""
        # This is a simple version; production would be more sophisticated
        if measurement.loss_components.get("L_arch", 0) > 0.2:
            return "Could you tell me more about what that means to you?"
        elif measurement.uncertainty_components.get("U_aleatoric", 0) > 0.5:
            return "I want to make sure I understand—could you clarify?"
        else:
            return "Tell me more about this."

    def _check_performance_constraints(self, elapsed_time: float):
        """
        Check if performance constraints are met (FR-S-001).

        Logs warning if constraints violated.
        """
        elapsed_ms = elapsed_time * 1000

        if elapsed_ms > self.config.total_latency_constraint_ms:
            print(f"Warning: CFT measurement took {elapsed_ms:.2f}ms, "
                  f"exceeds constraint of {self.config.total_latency_constraint_ms}ms")

    def get_performance_stats(self) -> Dict[str, float]:
        """Get performance statistics"""
        if not self._measurement_times:
            return {}

        times_ms = [t * 1000 for t in self._measurement_times]

        return {
            "mean_latency_ms": np.mean(times_ms),
            "median_latency_ms": np.median(times_ms),
            "p95_latency_ms": np.percentile(times_ms, 95),
            "p99_latency_ms": np.percentile(times_ms, 99),
            "max_latency_ms": np.max(times_ms),
            "measurement_count": len(times_ms),
        }

    def get_system_health(self, measurements: List[CFTMeasurement]) -> Dict[str, Any]:
        """
        Calculate system health metrics (Section 11.1).

        Args:
            measurements: List of recent measurements

        Returns:
            Dictionary of health metrics
        """
        if not measurements:
            return {"status": "no_data"}

        fidelities = [m.fidelity_score for m in measurements]
        transfers = [m.transfer_score for m in measurements]
        losses = [m.total_loss for m in measurements]
        gains = [m.total_gain for m in measurements]
        uncertainties = [m.total_uncertainty for m in measurements]

        conservation_passes = sum(m.conservation_check for m in measurements)

        return {
            "mean_fidelity": np.mean(fidelities),
            "fidelity_variance": np.var(fidelities),
            "mean_transfer": np.mean(transfers),
            "mean_loss": np.mean(losses),
            "mean_gain": np.mean(gains),
            "mean_uncertainty": np.mean(uncertainties),
            "conservation_pass_rate": conservation_passes / len(measurements),
            "high_fidelity_rate": sum(f >= 0.85 for f in fidelities) / len(measurements),
            "emergence_rate": sum(g > 0 for g in gains) / len(measurements),
            "meets_targets": {
                "fidelity": np.mean(fidelities) >= self.config.target_fidelity_score,
                "transfer": np.mean(transfers) >= self.config.acceptable_transfer_score,
                "loss": np.mean(losses) <= self.config.max_acceptable_loss,
                "emergence": sum(g > 0 for g in gains) / len(measurements) >= self.config.target_emergence_rate,
                "conservation": conservation_passes / len(measurements) >= self.config.conservation_pass_rate_target,
            }
        }
