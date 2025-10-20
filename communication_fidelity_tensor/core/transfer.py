"""
Communication Fidelity Tensor - Transfer Function (T)

Implements FR-T-001, FR-T-002, FR-T-003:
- Semantic transfer measurement
- Fidelity score calculation
- Concept overlap detection
"""

import numpy as np
from typing import List, Dict, Set, Tuple, Any, Optional
from dataclasses import dataclass

from ..models import ConceptNode
from ..config import CFTConfig


@dataclass
class TransferResult:
    """Result of transfer measurement"""
    transfer_score: float  # T
    fidelity_score: float  # F(T)
    concept_overlap: Set[Tuple[ConceptNode, ConceptNode]]  # Matched concepts
    matched_concept_ratio: float  # Percentage of concepts matched
    semantic_similarity: float  # Embedding similarity
    reconstruction_similarity: float  # How well insight reflects entry
    metadata: Dict[str, Any]


class TransferFunction:
    """
    Transfer Function (T) - Measures information transfer from input to output.

    Implements:
    - FR-T-001: Semantic Transfer Measurement
    - FR-T-002: Fidelity Score Calculation
    - FR-T-003: Concept Overlap Detection
    """

    def __init__(self, config: CFTConfig, embedding_model: Any = None):
        """
        Initialize Transfer Function.

        Args:
            config: CFT configuration
            embedding_model: Model for generating embeddings (e.g., sentence-transformers)
        """
        self.config = config
        self.embedding_model = embedding_model

    def measure_transfer(
        self,
        entry_text: str,
        entry_embedding: np.ndarray,
        insight_text: str,
        insight_embedding: np.ndarray,
        entry_concepts: Optional[List[ConceptNode]] = None,
        insight_concepts: Optional[List[ConceptNode]] = None,
    ) -> TransferResult:
        """
        Measure complete transfer from entry to insight.

        Args:
            entry_text: Original user journal entry
            entry_embedding: Embedding of entry
            insight_text: AI-generated insight
            insight_embedding: Embedding of insight
            entry_concepts: Parsed concepts from entry
            insight_concepts: Concepts in generated insight

        Returns:
            TransferResult with T and F(T) scores
        """
        # FR-T-001: Semantic Transfer Measurement
        transfer_score = self.calculate_semantic_transfer(
            entry_embedding, insight_embedding
        )

        # FR-T-002: Fidelity Score Calculation
        fidelity_score = self.calculate_fidelity(
            entry_text, insight_text, entry_embedding, insight_embedding
        )

        # FR-T-003: Concept Overlap Detection
        concept_overlap = set()
        matched_concept_ratio = 0.0
        if entry_concepts and insight_concepts:
            concept_overlap, matched_concept_ratio = self.detect_concept_overlap(
                entry_concepts, insight_concepts
            )

        # Reconstruction similarity (back-translation check)
        reconstruction_similarity = self.calculate_reconstruction_similarity(
            entry_embedding, insight_embedding
        )

        return TransferResult(
            transfer_score=transfer_score,
            fidelity_score=fidelity_score,
            concept_overlap=concept_overlap,
            matched_concept_ratio=matched_concept_ratio,
            semantic_similarity=transfer_score,
            reconstruction_similarity=reconstruction_similarity,
            metadata={
                "entry_length": len(entry_text),
                "insight_length": len(insight_text),
                "num_entry_concepts": len(entry_concepts) if entry_concepts else 0,
                "num_insight_concepts": len(insight_concepts) if insight_concepts else 0,
                "high_fidelity": transfer_score > self.config.acceptable_transfer_score,
            }
        )

    def calculate_semantic_transfer(
        self,
        entry_embedding: np.ndarray,
        insight_embedding: np.ndarray
    ) -> float:
        """
        FR-T-001: Semantic Transfer Measurement

        Calculate semantic intersection via embedding similarity:
        T = cosine_similarity(embed(S_h), embed(H_reconstructed))

        Args:
            entry_embedding: Embedding of user entry
            insight_embedding: Embedding of AI insight

        Returns:
            Transfer score T ∈ [0,1]
        """
        # Cosine similarity
        similarity = self._cosine_similarity(entry_embedding, insight_embedding)

        # Ensure in valid range [0, 1]
        # Cosine similarity is in [-1, 1], normalize to [0, 1]
        transfer_score = (similarity + 1) / 2

        return float(np.clip(transfer_score, 0, 1))

    def calculate_fidelity(
        self,
        entry_text: str,
        insight_text: str,
        entry_embedding: np.ndarray,
        insight_embedding: np.ndarray
    ) -> float:
        """
        FR-T-002: Fidelity Score Calculation

        Measure preserved information ratio:
        F(T) = |T| / |S_h|

        This represents how much of the original signal is preserved in the transfer.

        Args:
            entry_text: Original entry text
            insight_text: Generated insight text
            entry_embedding: Entry embedding
            insight_embedding: Insight embedding

        Returns:
            Fidelity score F(T) ∈ [0,1]
        """
        # Calculate semantic transfer
        transfer_score = self.calculate_semantic_transfer(entry_embedding, insight_embedding)

        # Estimate information content ratio
        # We approximate |T| / |S_h| using multiple signals:
        # 1. Semantic similarity (primary)
        # 2. Length ratio (secondary - insight shouldn't be too short)
        # 3. Concept coverage (if available)

        length_ratio = min(len(insight_text) / max(len(entry_text), 1), 1.0)

        # Weighted combination
        # Semantic transfer is the primary signal (80%)
        # Length adequacy contributes 20%
        fidelity = 0.8 * transfer_score + 0.2 * length_ratio

        return float(np.clip(fidelity, 0, 1))

    def detect_concept_overlap(
        self,
        entry_concepts: List[ConceptNode],
        insight_concepts: List[ConceptNode]
    ) -> Tuple[Set[Tuple[ConceptNode, ConceptNode]], float]:
        """
        FR-T-003: Concept Overlap Detection

        Graph-based node matching against ontology.
        Must identify ≥90% of explicit concepts.

        Args:
            entry_concepts: Concepts extracted from entry
            insight_concepts: Concepts in generated insight

        Returns:
            Tuple of (matched_pairs, match_ratio)
            - matched_pairs: Set of (entry_concept, insight_concept) pairs
            - match_ratio: Ratio of entry concepts matched
        """
        if not entry_concepts:
            return set(), 1.0  # No concepts to match

        matched_pairs: Set[Tuple[ConceptNode, ConceptNode]] = set()

        # Create concept mapping by ID and category
        insight_concept_map = {
            c.concept_id: c for c in insight_concepts
        }
        insight_categories = {
            c.category: c for c in insight_concepts
        }

        for entry_concept in entry_concepts:
            # Direct ID match (exact concept)
            if entry_concept.concept_id in insight_concept_map:
                matched_pairs.add((entry_concept, insight_concept_map[entry_concept.concept_id]))
            # Category match (related concept)
            elif entry_concept.category in insight_categories:
                matched_pairs.add((entry_concept, insight_categories[entry_concept.category]))
            # Embedding similarity match (if embeddings available)
            elif entry_concept.embedding is not None:
                best_match = self._find_best_concept_match(entry_concept, insight_concepts)
                if best_match:
                    matched_pairs.add((entry_concept, best_match))

        match_ratio = len(matched_pairs) / len(entry_concepts)

        return matched_pairs, match_ratio

    def calculate_reconstruction_similarity(
        self,
        entry_embedding: np.ndarray,
        insight_embedding: np.ndarray
    ) -> float:
        """
        Calculate how well the insight reconstructs the original entry.

        This supports FR-M-004: Back-Translation Validation.

        Args:
            entry_embedding: Original entry embedding
            insight_embedding: Generated insight embedding

        Returns:
            Reconstruction similarity ∈ [0,1]
        """
        # Use cosine similarity as reconstruction metric
        similarity = self._cosine_similarity(entry_embedding, insight_embedding)

        # Normalize to [0, 1]
        return float((similarity + 1) / 2)

    def _cosine_similarity(
        self,
        embedding1: np.ndarray,
        embedding2: np.ndarray
    ) -> float:
        """
        Calculate cosine similarity between two embeddings.

        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector

        Returns:
            Cosine similarity ∈ [-1, 1]
        """
        # Normalize vectors
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        # Compute cosine similarity
        similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)

        return float(similarity)

    def _find_best_concept_match(
        self,
        target_concept: ConceptNode,
        candidate_concepts: List[ConceptNode],
        threshold: float = 0.7
    ) -> Optional[ConceptNode]:
        """
        Find best matching concept using embedding similarity.

        Args:
            target_concept: Concept to match
            candidate_concepts: List of potential matches
            threshold: Minimum similarity threshold

        Returns:
            Best matching concept or None
        """
        if target_concept.embedding is None:
            return None

        best_match = None
        best_similarity = threshold

        for candidate in candidate_concepts:
            if candidate.embedding is None:
                continue

            similarity = self._cosine_similarity(
                target_concept.embedding,
                candidate.embedding
            )

            if similarity > best_similarity:
                best_similarity = similarity
                best_match = candidate

        return best_match

    def get_transfer_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding for text using configured model.

        Args:
            text: Input text

        Returns:
            Embedding vector
        """
        if self.embedding_model is None:
            # Return random embedding for testing
            return np.random.randn(self.config.embedding_dimension)

        # Use actual embedding model
        if hasattr(self.embedding_model, 'encode'):
            embedding = self.embedding_model.encode(text)
            return np.array(embedding)
        else:
            raise ValueError("Embedding model must have 'encode' method")
