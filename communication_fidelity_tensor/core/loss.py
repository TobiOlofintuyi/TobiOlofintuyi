"""
Communication Fidelity Tensor - Loss Function (L)

Implements FR-L-001 through FR-L-005:
- Dimensional reduction loss
- Compression entropy loss
- Architectural limitation detection
- Temporal decay tracking
- Assumption gap detection
"""

import numpy as np
from typing import List, Dict, Set, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

from ..config import CFTConfig


@dataclass
class LossResult:
    """Result of loss measurement"""
    L_dim: float  # Dimensional reduction loss
    L_compress: float  # Compression entropy loss
    L_arch: float  # Architectural limitation loss
    L_temporal: float  # Temporal decay loss
    L_assumption: float  # Assumption gap loss
    total_loss: float  # Sum of all losses
    unprocessable_elements: Set[str]  # Elements outside model domain
    assumption_gaps: List[Dict[str, Any]]  # Detected knowledge gaps
    metadata: Dict[str, Any]


class LossFunction:
    """
    Loss Function (L) - Measures information loss in the transformation.

    Implements:
    - FR-L-001: Dimensional Reduction Loss
    - FR-L-002: Compression Entropy Loss
    - FR-L-003: Architectural Limitation Detection
    - FR-L-004: Temporal Decay Tracking
    - FR-L-005: Assumption Gap Detection
    """

    def __init__(self, config: CFTConfig):
        """
        Initialize Loss Function.

        Args:
            config: CFT configuration
        """
        self.config = config
        self._conversation_history: List[Dict[str, Any]] = []

    def measure_loss(
        self,
        entry_text: str,
        entry_embedding: np.ndarray,
        internal_representation: Any,
        entry_concepts: Optional[List[Any]] = None,
        model_capabilities: Optional[Set[str]] = None,
        conversation_context: Optional[List[Dict]] = None,
    ) -> LossResult:
        """
        Measure complete information loss.

        Args:
            entry_text: Original user entry
            entry_embedding: Embedding of entry
            internal_representation: Model's internal representation
            entry_concepts: Concepts from entry
            model_capabilities: Set of model capability domains
            conversation_context: Previous conversation turns

        Returns:
            LossResult with all loss components
        """
        # FR-L-001: Dimensional Reduction Loss
        L_dim = self.calculate_dimensional_loss(
            entry_embedding, internal_representation
        )

        # FR-L-002: Compression Entropy Loss
        L_compress = self.calculate_compression_loss(
            entry_text, internal_representation
        )

        # FR-L-003: Architectural Limitation Detection
        L_arch, unprocessable = self.detect_architectural_limitations(
            entry_text, entry_concepts, model_capabilities
        )

        # FR-L-004: Temporal Decay Tracking
        L_temporal = self.calculate_temporal_decay(conversation_context or [])

        # FR-L-005: Assumption Gap Detection
        L_assumption, assumption_gaps = self.detect_assumption_gaps(
            entry_text, conversation_context or []
        )

        total_loss = L_dim + L_compress + L_arch + L_temporal + L_assumption

        return LossResult(
            L_dim=L_dim,
            L_compress=L_compress,
            L_arch=L_arch,
            L_temporal=L_temporal,
            L_assumption=L_assumption,
            total_loss=total_loss,
            unprocessable_elements=unprocessable,
            assumption_gaps=assumption_gaps,
            metadata={
                "high_dimensional_loss": L_dim > self.config.dimensional_loss_threshold,
                "high_temporal_decay": L_temporal > self.config.temporal_decay_threshold,
                "needs_clarification": (
                    L_arch > self.config.architectural_loss_threshold or
                    L_assumption > self.config.clarification_trigger_threshold
                ),
            }
        )

    def calculate_dimensional_loss(
        self,
        original_embedding: np.ndarray,
        internal_representation: Any
    ) -> float:
        """
        FR-L-001: Dimensional Reduction Loss

        Calculate compression loss from original to internal representation:
        L_dim = I(S_h) - I(M_internal)

        We approximate this using the information preserved in the embedding.

        Args:
            original_embedding: Original entry embedding
            internal_representation: Internal model representation

        Returns:
            Dimensional loss [0, 1]
        """
        # If internal representation is also an embedding
        if isinstance(internal_representation, np.ndarray):
            # Calculate information retention via dimensionality
            original_info = self._estimate_information_content(original_embedding)
            internal_info = self._estimate_information_content(internal_representation)

            # Loss is normalized difference
            loss = max(0, (original_info - internal_info) / max(original_info, 1e-6))

            return float(np.clip(loss, 0, 1))

        # If internal representation is dict (e.g., parsed structure)
        elif isinstance(internal_representation, dict):
            # Estimate compression based on structure complexity
            # Simple heuristic: ratio of preserved elements
            original_elements = len(original_embedding)
            internal_elements = len(str(internal_representation))

            # Normalize by expected compression
            expected_compression_ratio = 0.3  # Expect 30% retained
            actual_ratio = internal_elements / max(original_elements, 1)

            loss = max(0, 1 - (actual_ratio / expected_compression_ratio))

            return float(np.clip(loss, 0, 1))

        # Default: assume moderate compression loss
        return 0.2

    def calculate_compression_loss(
        self,
        entry_text: str,
        internal_representation: Any
    ) -> float:
        """
        FR-L-002: Compression Entropy Loss

        Measure information lost in encoding:
        L_compress based on conditional entropy H(S_h | M_internal)

        Args:
            entry_text: Original entry text
            internal_representation: Internal representation

        Returns:
            Compression loss [0, 1]
        """
        # Estimate entropy of original text
        original_entropy = self._estimate_text_entropy(entry_text)

        # Estimate entropy of internal representation
        if isinstance(internal_representation, str):
            internal_entropy = self._estimate_text_entropy(internal_representation)
        elif isinstance(internal_representation, dict):
            internal_entropy = self._estimate_text_entropy(str(internal_representation))
        elif isinstance(internal_representation, np.ndarray):
            # For embeddings, use variance as proxy for entropy
            internal_entropy = float(np.std(internal_representation))
        else:
            internal_entropy = original_entropy * 0.5  # Assume 50% retention

        # Conditional entropy: information in original not captured in internal
        # Normalized by original entropy
        if original_entropy > 0:
            loss = max(0, 1 - (internal_entropy / original_entropy))
        else:
            loss = 0.0

        return float(np.clip(loss, 0, 1))

    def detect_architectural_limitations(
        self,
        entry_text: str,
        entry_concepts: Optional[List[Any]] = None,
        model_capabilities: Optional[Set[str]] = None
    ) -> tuple[float, Set[str]]:
        """
        FR-L-003: Architectural Limitation Detection

        Identify concepts outside model domain:
        L_arch = {s ∈ S_h : s ∉ domain(E)}

        Args:
            entry_text: User entry text
            entry_concepts: Parsed concepts
            model_capabilities: Set of model capability domains

        Returns:
            Tuple of (loss_score, unprocessable_elements)
        """
        unprocessable_elements: Set[str] = set()

        # Default model capabilities if not provided
        if model_capabilities is None:
            model_capabilities = {
                "language_understanding",
                "emotional_analysis",
                "pattern_recognition",
                "compassion_modeling",
                "narrative_construction"
            }

        # Check concepts against model domain
        if entry_concepts:
            for concept in entry_concepts:
                concept_category = getattr(concept, 'category', 'unknown')

                # Check if concept is in model's domain
                if concept_category not in model_capabilities:
                    concept_name = getattr(concept, 'name', str(concept))
                    unprocessable_elements.add(concept_name)

        # Heuristic: check for domain-specific terminology
        # that might be outside model's training
        specialized_domains = self._detect_specialized_domains(entry_text)
        for domain in specialized_domains:
            if domain not in model_capabilities:
                unprocessable_elements.add(domain)

        # Calculate loss as ratio of unprocessable elements
        total_elements = len(entry_concepts) if entry_concepts else 1
        total_elements += len(specialized_domains)

        loss = len(unprocessable_elements) / max(total_elements, 1)

        return float(np.clip(loss, 0, 1)), unprocessable_elements

    def calculate_temporal_decay(
        self,
        conversation_context: List[Dict[str, Any]]
    ) -> float:
        """
        FR-L-004: Temporal Decay Tracking

        Model memory decay over conversation length:
        L_temporal(t) per conversation turn

        Args:
            conversation_context: List of previous conversation turns
                Each turn should have 'timestamp' and 'content'

        Returns:
            Temporal decay loss [0, 1]
        """
        if not conversation_context:
            return 0.0  # No history, no decay

        # Calculate conversation length
        num_turns = len(conversation_context)

        # Calculate time elapsed since first turn
        if conversation_context[0].get('timestamp'):
            first_timestamp = conversation_context[0]['timestamp']
            if isinstance(first_timestamp, str):
                first_timestamp = datetime.fromisoformat(first_timestamp)

            current_time = datetime.now()
            time_elapsed = (current_time - first_timestamp).total_seconds()

            # Decay function: exponential decay over turns and time
            # Parameters tuned for typical journaling sessions
            turn_decay = 1 - np.exp(-num_turns / 10)  # Decay over 10 turns
            time_decay = 1 - np.exp(-time_elapsed / 3600)  # Decay over 1 hour

            # Combined decay
            temporal_loss = 0.6 * turn_decay + 0.4 * time_decay
        else:
            # Only turn-based decay if no timestamps
            temporal_loss = 1 - np.exp(-num_turns / 10)

        return float(np.clip(temporal_loss, 0, 1))

    def detect_assumption_gaps(
        self,
        entry_text: str,
        conversation_context: List[Dict[str, Any]]
    ) -> tuple[float, List[Dict[str, Any]]]:
        """
        FR-L-005: Assumption Gap Detection

        Identify priors not explicitly stated.

        Args:
            entry_text: Current entry text
            conversation_context: Previous conversation

        Returns:
            Tuple of (loss_score, list_of_gaps)
        """
        assumption_gaps: List[Dict[str, Any]] = []

        # Detect implicit references
        implicit_references = self._detect_implicit_references(entry_text)

        # Check if references are grounded in context
        for reference in implicit_references:
            is_grounded = self._is_reference_grounded(reference, conversation_context)

            if not is_grounded:
                assumption_gaps.append({
                    "reference": reference,
                    "type": "implicit_reference",
                    "entry_text": entry_text[:100],  # Snippet for context
                    "requires_clarification": True
                })

        # Detect cultural/contextual assumptions
        cultural_assumptions = self._detect_cultural_assumptions(entry_text)
        assumption_gaps.extend(cultural_assumptions)

        # Calculate loss as ratio of gaps to content
        # More gaps = higher loss
        total_references = max(len(implicit_references) + 1, 1)
        loss = len(assumption_gaps) / total_references

        return float(np.clip(loss, 0, 1)), assumption_gaps

    # Helper methods

    def _estimate_information_content(self, embedding: np.ndarray) -> float:
        """Estimate information content of an embedding using entropy"""
        # Use variance as proxy for information content
        return float(np.var(embedding))

    def _estimate_text_entropy(self, text: str) -> float:
        """Estimate Shannon entropy of text"""
        if not text:
            return 0.0

        # Character-level entropy
        char_counts = {}
        for char in text:
            char_counts[char] = char_counts.get(char, 0) + 1

        total_chars = len(text)
        entropy = 0.0

        for count in char_counts.values():
            probability = count / total_chars
            entropy -= probability * np.log2(probability)

        # Normalize by theoretical maximum (log2 of alphabet size)
        max_entropy = np.log2(len(char_counts)) if char_counts else 1
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0

        return float(normalized_entropy)

    def _detect_specialized_domains(self, text: str) -> Set[str]:
        """Detect specialized domain terminology"""
        # Simple keyword-based detection
        # In production, this would use more sophisticated NLP
        domain_keywords = {
            "medical": ["diagnosis", "symptoms", "treatment", "medication", "doctor"],
            "legal": ["lawsuit", "attorney", "contract", "liability", "court"],
            "technical": ["algorithm", "deployment", "infrastructure", "debugging"],
            "financial": ["investment", "portfolio", "dividend", "equity", "debt"],
        }

        detected_domains = set()
        text_lower = text.lower()

        for domain, keywords in domain_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_domains.add(domain)

        return detected_domains

    def _detect_implicit_references(self, text: str) -> List[str]:
        """Detect implicit references (pronouns, demonstratives)"""
        # Simple heuristic: detect pronouns and demonstratives
        implicit_markers = [
            "he", "she", "they", "it", "this", "that", "these", "those",
            "him", "her", "them"
        ]

        references = []
        words = text.lower().split()

        for word in words:
            # Remove punctuation
            clean_word = word.strip('.,!?;:')
            if clean_word in implicit_markers:
                references.append(word)

        return references

    def _is_reference_grounded(
        self,
        reference: str,
        context: List[Dict[str, Any]]
    ) -> bool:
        """Check if a reference is grounded in conversation context"""
        if not context:
            return False  # No context to ground in

        # Simple heuristic: check if recent context provides antecedent
        # In production, use coreference resolution
        recent_context = context[-3:] if len(context) >= 3 else context

        for turn in recent_context:
            content = turn.get('content', '')
            if content and len(content) > 10:  # Non-trivial content
                return True  # Assume grounded if recent substantive context exists

        return False

    def _detect_cultural_assumptions(self, text: str) -> List[Dict[str, Any]]:
        """Detect cultural or contextual assumptions"""
        assumptions = []

        # Detect idioms or cultural references
        # This is a simplified version; production would use cultural knowledge base
        cultural_markers = [
            "you know what I mean", "obviously", "as usual", "like always",
            "the usual", "everyone knows"
        ]

        text_lower = text.lower()
        for marker in cultural_markers:
            if marker in text_lower:
                assumptions.append({
                    "reference": marker,
                    "type": "cultural_assumption",
                    "requires_clarification": True
                })

        return assumptions
