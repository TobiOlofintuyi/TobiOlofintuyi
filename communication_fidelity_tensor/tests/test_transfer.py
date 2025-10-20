"""
Unit tests for Transfer Function (T).

Tests FR-T-001, FR-T-002, FR-T-003.
"""

import pytest
import numpy as np

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from communication_fidelity_tensor.core.transfer import TransferFunction
from communication_fidelity_tensor.models import ConceptNode
from communication_fidelity_tensor.config import CFTConfig


class TestTransferFunction:
    """Unit tests for Transfer Function"""

    @pytest.fixture
    def transfer_fn(self):
        config = CFTConfig()
        return TransferFunction(config)

    def test_semantic_transfer_identical(self, transfer_fn):
        """Test FR-T-001 with identical embeddings"""
        embedding = np.random.randn(768)

        # Identical embeddings should have perfect transfer
        transfer_score = transfer_fn.calculate_semantic_transfer(embedding, embedding)

        assert transfer_score > 0.99, f"Expected near-perfect transfer, got {transfer_score}"

    def test_semantic_transfer_orthogonal(self, transfer_fn):
        """Test FR-T-001 with orthogonal embeddings"""
        # Create orthogonal vectors
        emb1 = np.array([1, 0, 0] + [0] * 765)
        emb2 = np.array([0, 1, 0] + [0] * 765)

        transfer_score = transfer_fn.calculate_semantic_transfer(emb1, emb2)

        # Orthogonal vectors should have low transfer
        assert transfer_score < 0.7, f"Expected low transfer for orthogonal vectors, got {transfer_score}"

    def test_fidelity_calculation(self, transfer_fn):
        """Test FR-T-002: Fidelity Score Calculation"""
        entry_text = "This is a test entry"
        insight_text = "This is a test insight response"
        entry_emb = np.random.randn(768)
        insight_emb = entry_emb + np.random.randn(768) * 0.1  # Similar but not identical

        fidelity = transfer_fn.calculate_fidelity(
            entry_text, insight_text, entry_emb, insight_emb
        )

        assert 0 <= fidelity <= 1, f"Fidelity score out of range: {fidelity}"

    def test_concept_overlap_exact_match(self, transfer_fn):
        """Test FR-T-003 with exact concept matches"""
        entry_concepts = [
            ConceptNode("c1", "compassion", "compassion"),
            ConceptNode("c2", "growth", "growth"),
        ]

        insight_concepts = [
            ConceptNode("c1", "compassion", "compassion"),
            ConceptNode("c2", "growth", "growth"),
        ]

        overlap, ratio = transfer_fn.detect_concept_overlap(entry_concepts, insight_concepts)

        assert ratio == 1.0, f"Expected perfect concept match, got {ratio}"
        assert len(overlap) == 2

    def test_concept_overlap_partial_match(self, transfer_fn):
        """Test FR-T-003 with partial concept matches"""
        entry_concepts = [
            ConceptNode("c1", "compassion", "compassion"),
            ConceptNode("c2", "growth", "growth"),
            ConceptNode("c3", "connection", "connection"),
        ]

        insight_concepts = [
            ConceptNode("c1", "compassion", "compassion"),
        ]

        overlap, ratio = transfer_fn.detect_concept_overlap(entry_concepts, insight_concepts)

        assert 0 < ratio < 1.0, f"Expected partial match, got {ratio}"
        assert len(overlap) == 1

    def test_concept_overlap_category_match(self, transfer_fn):
        """Test FR-T-003 with category-level matches"""
        entry_concepts = [
            ConceptNode("c1", "love", "compassion"),
        ]

        insight_concepts = [
            ConceptNode("c2", "kindness", "compassion"),  # Same category
        ]

        overlap, ratio = transfer_fn.detect_concept_overlap(entry_concepts, insight_concepts)

        assert ratio > 0, f"Expected category match to count, got ratio={ratio}"

    def test_acceptance_criteria_t001(self, transfer_fn):
        """
        Test FR-T-001 Acceptance Criteria: T > 0.75 for high-fidelity transfer
        """
        # Create highly similar embeddings
        base_emb = np.random.randn(768)
        similar_emb = base_emb + np.random.randn(768) * 0.05  # Small perturbation

        transfer_score = transfer_fn.calculate_semantic_transfer(base_emb, similar_emb)

        # Should meet high-fidelity threshold
        assert transfer_score > 0.75

    def test_acceptance_criteria_t003(self, transfer_fn):
        """
        Test FR-T-003 Acceptance Criteria: Must identify ≥90% of explicit concepts
        """
        # Create 10 concepts, all should be matched
        entry_concepts = [
            ConceptNode(f"c{i}", f"concept_{i}", "category")
            for i in range(10)
        ]

        insight_concepts = entry_concepts.copy()

        overlap, ratio = transfer_fn.detect_concept_overlap(entry_concepts, insight_concepts)

        assert ratio >= 0.9, f"Should identify ≥90% of concepts, got {ratio}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
