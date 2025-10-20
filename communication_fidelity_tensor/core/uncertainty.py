"""
Communication Fidelity Tensor - Uncertainty Function (U)

Implements FR-U-001 through FR-U-004:
- Epistemic uncertainty quantification
- Aleatoric uncertainty measurement
- Interpretation space topology
- Meta-uncertainty tracking
"""

import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from scipy.stats import entropy as scipy_entropy

from ..models import InterpretationAlternative
from ..config import CFTConfig


@dataclass
class UncertaintyResult:
    """Result of uncertainty measurement"""
    U_epistemic: float  # Epistemic uncertainty (model knowledge)
    U_aleatoric: float  # Aleatoric uncertainty (inherent ambiguity)
    U_topology: float  # Interpretation space topology
    U_meta: float  # Meta-uncertainty
    total_uncertainty: float  # Sum of uncertainties
    interpretation_count: int  # Number of viable interpretations
    alternative_interpretations: List[InterpretationAlternative]
    metadata: Dict[str, Any]


class UncertaintyFunction:
    """
    Uncertainty Function (U) - Quantifies uncertainty in interpretation.

    Implements:
    - FR-U-001: Epistemic Uncertainty Quantification
    - FR-U-002: Aleatoric Uncertainty Measurement
    - FR-U-003: Interpretation Space Topology
    - FR-U-004: Meta-Uncertainty Tracking
    """

    def __init__(self, config: CFTConfig):
        """
        Initialize Uncertainty Function.

        Args:
            config: CFT configuration
        """
        self.config = config

    def measure_uncertainty(
        self,
        entry_text: str,
        probability_distribution: Optional[np.ndarray] = None,
        alternative_interpretations: Optional[List[InterpretationAlternative]] = None,
        contextual_information: Optional[Dict[str, Any]] = None,
    ) -> UncertaintyResult:
        """
        Measure complete uncertainty.

        Args:
            entry_text: User journal entry
            probability_distribution: Model's probability distribution over interpretations
            alternative_interpretations: List of alternative interpretations considered
            contextual_information: Available context

        Returns:
            UncertaintyResult with all uncertainty components
        """
        # FR-U-001: Epistemic Uncertainty
        U_epistemic = self.quantify_epistemic_uncertainty(
            probability_distribution, alternative_interpretations
        )

        # FR-U-002: Aleatoric Uncertainty
        U_aleatoric = self.measure_aleatoric_uncertainty(
            entry_text, contextual_information or {}
        )

        # FR-U-003: Interpretation Space Topology
        U_topology, interpretation_count = self.measure_interpretation_topology(
            alternative_interpretations or []
        )

        # FR-U-004: Meta-Uncertainty
        U_meta = self.track_meta_uncertainty(U_epistemic, U_aleatoric)

        total_uncertainty = U_epistemic + U_aleatoric + U_topology + U_meta

        return UncertaintyResult(
            U_epistemic=U_epistemic,
            U_aleatoric=U_aleatoric,
            U_topology=U_topology,
            U_meta=U_meta,
            total_uncertainty=total_uncertainty,
            interpretation_count=interpretation_count,
            alternative_interpretations=alternative_interpretations or [],
            metadata={
                "high_epistemic": U_epistemic > self.config.epistemic_uncertainty_threshold,
                "high_aleatoric": U_aleatoric > self.config.aleatoric_uncertainty_threshold,
                "needs_clarification": U_aleatoric > self.config.aleatoric_uncertainty_threshold,
                "offer_alternatives": interpretation_count > self.config.interpretation_topology_threshold,
                "show_confidence_indicator": total_uncertainty > self.config.max_acceptable_uncertainty,
            }
        )

    def quantify_epistemic_uncertainty(
        self,
        probability_distribution: Optional[np.ndarray],
        alternative_interpretations: Optional[List[InterpretationAlternative]]
    ) -> float:
        """
        FR-U-001: Epistemic Uncertainty Quantification

        Calculate variance in model's interpretations:
        U_epistemic = var[M | S_h]

        This represents uncertainty due to model's limited knowledge.

        Args:
            probability_distribution: Distribution over interpretations
            alternative_interpretations: Alternative interpretations with probabilities

        Returns:
            Epistemic uncertainty [0, 1]
        """
        if probability_distribution is not None:
            # Calculate variance of probability distribution
            variance = float(np.var(probability_distribution))

            # Normalize to [0, 1]
            # Maximum variance for a probability distribution is 0.25 (binary case)
            normalized_variance = min(variance / 0.25, 1.0)

            return normalized_variance

        elif alternative_interpretations:
            # Calculate from alternative interpretations
            probabilities = [interp.probability for interp in alternative_interpretations]

            if len(probabilities) > 1:
                variance = float(np.var(probabilities))
                normalized_variance = min(variance / 0.25, 1.0)
                return normalized_variance
            else:
                return 0.0  # Single interpretation = no epistemic uncertainty

        else:
            # No probability information available
            # Return moderate uncertainty
            return 0.3

    def measure_aleatoric_uncertainty(
        self,
        entry_text: str,
        contextual_information: Dict[str, Any]
    ) -> float:
        """
        FR-U-002: Aleatoric Uncertainty Measurement

        Calculate inherent ambiguity:
        U_aleatoric = H(S_h) - I(S_h; context)

        This represents uncertainty due to inherent ambiguity in the entry.

        Args:
            entry_text: User entry text
            contextual_information: Available contextual information

        Returns:
            Aleatoric uncertainty [0, 1]
        """
        # Calculate entry entropy (ambiguity)
        entry_entropy = self._calculate_text_entropy(entry_text)

        # Calculate mutual information with context
        mutual_information = self._calculate_mutual_information(
            entry_text, contextual_information
        )

        # Aleatoric uncertainty = entropy - mutual information
        # More context reduces aleatoric uncertainty
        aleatoric = entry_entropy - mutual_information

        return float(np.clip(aleatoric, 0, 1))

    def measure_interpretation_topology(
        self,
        alternative_interpretations: List[InterpretationAlternative]
    ) -> tuple[float, int]:
        """
        FR-U-003: Interpretation Space Topology

        Count interpretations above threshold ε:
        U_topology = |{M_i : p(M_i|S_h) > ε}|

        When U_topology > 3, offer interpretation choice to user.

        Args:
            alternative_interpretations: List of alternative interpretations

        Returns:
            Tuple of (topology_score, interpretation_count)
        """
        epsilon = self.config.uncertainty_threshold_epsilon

        # Count interpretations above threshold
        viable_interpretations = [
            interp for interp in alternative_interpretations
            if interp.probability > epsilon
        ]

        count = len(viable_interpretations)

        # Normalize count to [0, 1]
        # Use logarithmic scale since high counts indicate high uncertainty
        if count > 0:
            topology_score = min(np.log(count + 1) / np.log(10), 1.0)
        else:
            topology_score = 0.0

        return float(topology_score), count

    def track_meta_uncertainty(
        self,
        U_epistemic: float,
        U_aleatoric: float
    ) -> float:
        """
        FR-U-004: Meta-Uncertainty Tracking

        Calculate entropy of uncertainties:
        U_meta = H(U_epistemic, U_aleatoric)

        This represents uncertainty about the uncertainty itself.

        Args:
            U_epistemic: Epistemic uncertainty
            U_aleatoric: Aleatoric uncertainty

        Returns:
            Meta-uncertainty [0, 1]
        """
        # Calculate entropy of the uncertainty distribution
        uncertainties = np.array([U_epistemic, U_aleatoric])

        # Normalize to form a probability distribution
        uncertainty_sum = uncertainties.sum()

        if uncertainty_sum > 0:
            uncertainty_probs = uncertainties / uncertainty_sum

            # Calculate Shannon entropy
            # Maximum entropy for 2 values is log(2) ≈ 0.693
            meta_entropy = scipy_entropy(uncertainty_probs, base=2)
            normalized_meta = meta_entropy / np.log2(2)
        else:
            normalized_meta = 0.0

        return float(np.clip(normalized_meta, 0, 1))

    # Helper methods

    def _calculate_text_entropy(self, text: str) -> float:
        """
        Calculate Shannon entropy of text.

        Higher entropy = more ambiguous/complex
        """
        if not text:
            return 0.0

        # Word-level entropy
        words = text.lower().split()
        if not words:
            return 0.0

        # Count word frequencies
        word_counts = {}
        for word in words:
            word_counts[word] = word_counts.get(word, 0) + 1

        total_words = len(words)

        # Calculate entropy
        word_probs = [count / total_words for count in word_counts.values()]
        text_entropy = scipy_entropy(word_probs, base=2)

        # Normalize by maximum possible entropy (uniform distribution)
        max_entropy = np.log2(len(word_counts)) if word_counts else 1.0
        normalized_entropy = text_entropy / max_entropy if max_entropy > 0 else 0.0

        return float(np.clip(normalized_entropy, 0, 1))

    def _calculate_mutual_information(
        self,
        entry_text: str,
        contextual_information: Dict[str, Any]
    ) -> float:
        """
        Calculate mutual information between entry and context.

        More contextual overlap = higher mutual information = lower aleatoric uncertainty.
        """
        if not contextual_information:
            return 0.0

        # Extract context text
        context_text = self._extract_context_text(contextual_information)

        if not context_text:
            return 0.0

        # Simple heuristic: word overlap between entry and context
        entry_words = set(entry_text.lower().split())
        context_words = set(context_text.lower().split())

        # Remove common words
        common_stopwords = {
            "the", "a", "an", "and", "or", "but", "in", "on", "at",
            "to", "for", "of", "with", "by", "from", "as"
        }

        entry_words -= common_stopwords
        context_words -= common_stopwords

        if not entry_words:
            return 0.0

        # Calculate overlap ratio
        overlap = entry_words & context_words
        mutual_info = len(overlap) / len(entry_words)

        return float(np.clip(mutual_info, 0, 1))

    def _extract_context_text(self, contextual_information: Dict[str, Any]) -> str:
        """Extract text from contextual information"""
        text_parts = []

        # Extract various context fields
        if "previous_entries" in contextual_information:
            for entry in contextual_information["previous_entries"]:
                if isinstance(entry, dict) and "content" in entry:
                    text_parts.append(entry["content"])
                elif isinstance(entry, str):
                    text_parts.append(entry)

        if "user_profile" in contextual_information:
            profile = contextual_information["user_profile"]
            if isinstance(profile, dict):
                text_parts.extend(str(v) for v in profile.values())
            elif isinstance(profile, str):
                text_parts.append(profile)

        if "session_context" in contextual_information:
            context = contextual_information["session_context"]
            if isinstance(context, str):
                text_parts.append(context)

        return " ".join(text_parts)

    def generate_alternative_interpretations(
        self,
        entry_text: str,
        num_alternatives: int = 5
    ) -> List[InterpretationAlternative]:
        """
        Generate alternative interpretations for an entry.

        This is a placeholder for actual model-based interpretation generation.
        In production, this would query the language model for alternative readings.

        Args:
            entry_text: User entry
            num_alternatives: Number of alternatives to generate

        Returns:
            List of alternative interpretations
        """
        # Placeholder implementation
        # In production, this would use model to generate actual alternatives

        alternatives = []

        # Detect potential ambiguities
        if "?" in entry_text:
            alternatives.append(InterpretationAlternative(
                interpretation_id="question_seeking_answer",
                probability=0.6,
                description="User is seeking guidance or answers",
                metadata={"type": "question"}
            ))
            alternatives.append(InterpretationAlternative(
                interpretation_id="rhetorical_reflection",
                probability=0.3,
                description="User is reflecting rhetorically",
                metadata={"type": "reflection"}
            ))

        if any(word in entry_text.lower() for word in ["maybe", "perhaps", "uncertain"]):
            alternatives.append(InterpretationAlternative(
                interpretation_id="expression_of_uncertainty",
                probability=0.5,
                description="User is expressing uncertainty about something",
                metadata={"type": "uncertainty"}
            ))

        if not alternatives:
            # Default single interpretation
            alternatives.append(InterpretationAlternative(
                interpretation_id="straightforward_entry",
                probability=0.8,
                description="Straightforward journal entry",
                metadata={"type": "standard"}
            ))

        # Normalize probabilities
        total_prob = sum(a.probability for a in alternatives)
        for alt in alternatives:
            alt.probability /= total_prob

        return alternatives[:num_alternatives]
