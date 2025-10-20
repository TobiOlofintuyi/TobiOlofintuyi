"""
Integration tests for the Communication Fidelity Tensor system.

Tests FR-T-002: Integration Testing requirements.
"""

import pytest
import numpy as np
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from communication_fidelity_tensor import (
    CommunicationFidelityTensor,
    CFTConfig,
    TransferTopology,
    ConceptNode,
)


class TestCFTIntegration:
    """Integration tests for complete CFT pipeline"""

    @pytest.fixture
    def cft(self):
        """Create CFT instance"""
        config = CFTConfig()
        return CommunicationFidelityTensor(config=config)

    @pytest.fixture
    def sample_entry(self):
        """Sample journal entry"""
        return {
            "entry_id": "test_001",
            "text": "I've been feeling overwhelmed with work lately. I wonder if I'm taking on too much.",
            "embedding": np.random.randn(768),
            "concepts": [
                ConceptNode("c1", "overwhelm", "emotional"),
                ConceptNode("c2", "work", "context"),
            ]
        }

    @pytest.fixture
    def sample_insight(self):
        """Sample AI insight"""
        return {
            "text": "It sounds like you're experiencing stress from work demands. This is common when we don't set boundaries.",
            "embedding": np.random.randn(768),
            "concepts": [
                ConceptNode("c1", "overwhelm", "emotional"),
                ConceptNode("c3", "boundaries", "growth"),
            ]
        }

    def test_complete_measurement(self, cft, sample_entry, sample_insight):
        """Test complete CFT measurement pipeline"""
        measurement = cft.measure(
            entry_id=sample_entry["entry_id"],
            entry_text=sample_entry["text"],
            entry_embedding=sample_entry["embedding"],
            insight_text=sample_insight["text"],
            insight_embedding=sample_insight["embedding"],
            entry_concepts=sample_entry["concepts"],
            insight_concepts=sample_insight["concepts"],
        )

        # Verify measurement structure
        assert measurement.entry_id == "test_001"
        assert 0 <= measurement.transfer_score <= 1
        assert 0 <= measurement.fidelity_score <= 1
        assert measurement.total_loss >= 0
        assert measurement.total_gain >= 0
        assert measurement.total_uncertainty >= 0

        # Verify components
        assert "L_dim" in measurement.loss_components
        assert "G_synthesis" in measurement.gain_components
        assert "U_epistemic" in measurement.uncertainty_components

    def test_conservation_principle(self, cft, sample_entry, sample_insight):
        """
        Test FR-C-001: Conservation Principle Validation

        Verify |S_h| + |G| = |T| + |L| + |U| within tolerance
        """
        measurement = cft.measure(
            entry_id=sample_entry["entry_id"],
            entry_text=sample_entry["text"],
            entry_embedding=sample_entry["embedding"],
            insight_text=sample_insight["text"],
            insight_embedding=sample_insight["embedding"],
        )

        # Calculate both sides of conservation equation
        S_h = 1.0  # Normalized
        left_side = S_h + measurement.total_gain
        right_side = measurement.transfer_score + measurement.total_loss + measurement.total_uncertainty

        error = abs(left_side - right_side)

        # Should be within tolerance
        assert error <= cft.config.conservation_tolerance, \
            f"Conservation violated: error={error}, tolerance={cft.config.conservation_tolerance}"

    def test_performance_constraint(self, cft, sample_entry, sample_insight):
        """
        Test FR-S-001: Latency Constraint

        Measurement should complete within 2 seconds
        """
        import time
        start = time.time()

        measurement = cft.measure(
            entry_id=sample_entry["entry_id"],
            entry_text=sample_entry["text"],
            entry_embedding=sample_entry["embedding"],
            insight_text=sample_insight["text"],
            insight_embedding=sample_insight["embedding"],
        )

        elapsed_ms = (time.time() - start) * 1000

        assert elapsed_ms < cft.config.total_latency_constraint_ms, \
            f"Latency constraint violated: {elapsed_ms}ms > {cft.config.total_latency_constraint_ms}ms"

    def test_session_measurement(self, cft):
        """Test measuring an entire session"""
        session = TransferTopology(
            session_id="session_001",
            user_id="user_123"
        )

        entries = [
            {
                "entry_id": f"entry_{i}",
                "text": f"Journal entry {i}",
                "embedding": np.random.randn(768),
                "concepts": [],
            }
            for i in range(3)
        ]

        insights = [
            {
                "text": f"Insight for entry {i}",
                "embedding": np.random.randn(768),
                "concepts": [],
            }
            for i in range(3)
        ]

        updated_session = cft.measure_session(session, entries, insights)

        assert len(updated_session.measurements) == 3
        assert updated_session.get_session_statistics()["entry_count"] == 3

    def test_quality_flags(self, cft, sample_entry, sample_insight):
        """Test quality flag generation"""
        measurement = cft.measure(
            entry_id=sample_entry["entry_id"],
            entry_text=sample_entry["text"],
            entry_embedding=sample_entry["embedding"],
            insight_text=sample_insight["text"],
            insight_embedding=sample_insight["embedding"],
        )

        flags = measurement.get_quality_flags()

        # Verify all expected flags are present
        expected_flags = [
            "high_fidelity",
            "acceptable_transfer",
            "high_loss",
            "high_uncertainty",
            "needs_clarification",
            "has_emergence",
            "conservation_valid",
            "low_confidence",
        ]

        for flag in expected_flags:
            assert flag in flags

    def test_user_feedback_generation(self, cft, sample_entry, sample_insight):
        """Test FR-I-005, FR-I-006, FR-I-007: User feedback generation"""
        measurement = cft.measure(
            entry_id=sample_entry["entry_id"],
            entry_text=sample_entry["text"],
            entry_embedding=sample_entry["embedding"],
            insight_text=sample_insight["text"],
            insight_embedding=sample_insight["embedding"],
        )

        feedback = cft.get_user_facing_feedback(measurement)

        # Verify feedback structure
        assert "show_confidence_indicator" in feedback
        assert "request_clarification" in feedback
        assert "highlight_emergence" in feedback

    def test_system_health_metrics(self, cft):
        """Test system health metric calculation"""
        # Create sample measurements
        measurements = []
        for i in range(10):
            entry_emb = np.random.randn(768)
            insight_emb = np.random.randn(768)

            measurement = cft.measure(
                entry_id=f"entry_{i}",
                entry_text=f"Entry {i}",
                entry_embedding=entry_emb,
                insight_text=f"Insight {i}",
                insight_embedding=insight_emb,
            )
            measurements.append(measurement)

        health = cft.get_system_health(measurements)

        # Verify health metrics
        assert "mean_fidelity" in health
        assert "conservation_pass_rate" in health
        assert "meets_targets" in health
        assert 0 <= health["mean_fidelity"] <= 1


class TestEdgeCases:
    """Test edge cases and error handling"""

    @pytest.fixture
    def cft(self):
        return CommunicationFidelityTensor()

    def test_empty_text(self, cft):
        """Test with empty text"""
        with pytest.raises(Exception):
            cft.measure(
                entry_id="test",
                entry_text="",
                entry_embedding=np.random.randn(768),
                insight_text="",
                insight_embedding=np.random.randn(768),
            )

    def test_missing_parameters(self, cft):
        """Test with missing required parameters"""
        with pytest.raises(ValueError):
            cft.measure(
                entry_id="test",
                entry_text=None,
                entry_embedding=np.random.randn(768),
                insight_text=None,
                insight_embedding=np.random.randn(768),
            )

    def test_very_long_text(self, cft):
        """Test with very long text"""
        long_text = "word " * 10000  # 10k words

        measurement = cft.measure(
            entry_id="test_long",
            entry_text=long_text,
            entry_embedding=np.random.randn(768),
            insight_text=long_text,
            insight_embedding=np.random.randn(768),
        )

        assert measurement is not None
        assert 0 <= measurement.fidelity_score <= 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
