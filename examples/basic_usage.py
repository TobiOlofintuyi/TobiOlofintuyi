"""
Basic Usage Example for Communication Fidelity Tensor

This example demonstrates how to use the CFT system to measure
information transfer fidelity in a journaling interaction.
"""

import numpy as np
from datetime import datetime

from communication_fidelity_tensor import (
    CommunicationFidelityTensor,
    CFTConfig,
    TransferTopology,
    ConceptNode,
)


def main():
    """Basic CFT usage example"""

    print("=" * 80)
    print("Communication Fidelity Tensor - Basic Usage Example")
    print("=" * 80)
    print()

    # Step 1: Initialize CFT system
    print("1. Initializing CFT system...")
    config = CFTConfig()
    cft = CommunicationFidelityTensor(config=config)
    print("   ✓ CFT initialized")
    print()

    # Step 2: Prepare user journal entry
    print("2. Processing user journal entry...")
    entry_text = """
    I've been feeling overwhelmed with work lately. There's so much on my plate,
    and I'm not sure how to prioritize everything. I wonder if I'm taking on too
    much, or if I just need better time management skills.
    """

    # In production, you would use an actual embedding model
    # For this example, we use random embeddings
    entry_embedding = np.random.randn(768)

    # Parse concepts from entry (in production, use NLP)
    entry_concepts = [
        ConceptNode("c1", "overwhelm", "emotional"),
        ConceptNode("c2", "work", "context"),
        ConceptNode("c3", "prioritization", "cognitive"),
    ]

    print(f"   Entry: {entry_text.strip()[:100]}...")
    print(f"   Extracted {len(entry_concepts)} concepts")
    print()

    # Step 3: Generate AI insight (simulated)
    print("3. Processing AI-generated insight...")
    insight_text = """
    It sounds like you're experiencing stress from high work demands. This is
    common when we don't set clear boundaries. Consider identifying your top 3
    priorities and focusing your energy there. Remember, saying no to some things
    allows you to say yes to what truly matters.
    """

    insight_embedding = np.random.randn(768)

    insight_concepts = [
        ConceptNode("c1", "overwhelm", "emotional"),  # Transferred
        ConceptNode("c4", "boundaries", "growth"),    # Emergent
        ConceptNode("c5", "priorities", "cognitive"), # Related to c3
    ]

    print(f"   Insight: {insight_text.strip()[:100]}...")
    print(f"   Extracted {len(insight_concepts)} concepts")
    print()

    # Step 4: Measure CFT
    print("4. Measuring Communication Fidelity...")
    measurement = cft.measure(
        entry_id="example_001",
        entry_text=entry_text,
        entry_embedding=entry_embedding,
        insight_text=insight_text,
        insight_embedding=insight_embedding,
        entry_concepts=entry_concepts,
        insight_concepts=insight_concepts,
    )

    print("   ✓ Measurement complete")
    print()

    # Step 5: Display results
    print("5. CFT Measurement Results:")
    print("-" * 80)
    print(f"   Transfer Score (T):        {measurement.transfer_score:.3f}")
    print(f"   Fidelity Score F(T):       {measurement.fidelity_score:.3f}")
    print()

    print("   Loss Components:")
    for component, value in measurement.loss_components.items():
        print(f"      {component:15s}: {value:.3f}")
    print(f"   Total Loss:                {measurement.total_loss:.3f}")
    print()

    print("   Gain Components:")
    for component, value in measurement.gain_components.items():
        print(f"      {component:15s}: {value:.3f}")
    print(f"   Total Gain:                {measurement.total_gain:.3f}")
    print()

    print("   Uncertainty Components:")
    for component, value in measurement.uncertainty_components.items():
        print(f"      {component:15s}: {value:.3f}")
    print(f"   Total Uncertainty:         {measurement.total_uncertainty:.3f}")
    print()

    print(f"   Conservation Check:        {'PASS' if measurement.conservation_check else 'FAIL'}")
    print(f"   Conservation Error:        {measurement.conservation_error:.4f}")
    print()

    # Step 6: Quality flags
    print("6. Quality Flags:")
    print("-" * 80)
    flags = measurement.get_quality_flags()
    for flag, value in flags.items():
        status = "✓" if value else "✗"
        print(f"   {status} {flag:25s}: {value}")
    print()

    # Step 7: User-facing feedback
    print("7. User-Facing Feedback:")
    print("-" * 80)
    feedback = cft.get_user_facing_feedback(measurement)

    if feedback["show_confidence_indicator"]:
        print(f"   💬 {feedback['confidence_message']}")

    if feedback["request_clarification"]:
        print(f"   ❓ {feedback['clarification_prompt']}")

    if feedback["highlight_emergence"]:
        print(f"   ✨ {feedback['emergence_marker']}")

    if not any([
        feedback["show_confidence_indicator"],
        feedback["request_clarification"],
        feedback["highlight_emergence"]
    ]):
        print("   No special feedback needed - high quality interaction")

    print()

    # Step 8: Conservation principle validation
    print("8. Conservation Principle Validation:")
    print("-" * 80)
    S_h = 1.0  # Normalized original signal
    left_side = S_h + measurement.total_gain
    right_side = measurement.transfer_score + measurement.total_loss + measurement.total_uncertainty

    print(f"   |S_h| + |G| = {left_side:.4f}")
    print(f"   |T| + |L| + |U| = {right_side:.4f}")
    print(f"   Difference = {abs(left_side - right_side):.4f}")
    print(f"   Tolerance = {config.conservation_tolerance:.4f}")
    print(f"   Status: {'✓ VALID' if measurement.conservation_check else '✗ INVALID'}")
    print()

    print("=" * 80)
    print("Example complete!")
    print("=" * 80)


def session_example():
    """Example of measuring an entire session"""

    print("\n" + "=" * 80)
    print("Session-Level CFT Measurement Example")
    print("=" * 80)
    print()

    # Initialize
    cft = CommunicationFidelityTensor()
    session = TransferTopology(
        session_id="session_001",
        user_id="user_123"
    )

    # Simulate 3 journal entries and insights
    entries = [
        {
            "entry_id": f"entry_{i}",
            "text": f"This is journal entry number {i}. I'm reflecting on my day.",
            "embedding": np.random.randn(768),
            "concepts": [ConceptNode(f"c{i}", f"concept_{i}", "reflection")],
        }
        for i in range(3)
    ]

    insights = [
        {
            "text": f"Here's an insight for entry {i}. Your reflection shows growth.",
            "embedding": np.random.randn(768),
            "concepts": [ConceptNode(f"c{i}", f"concept_{i}", "reflection")],
        }
        for i in range(3)
    ]

    # Measure session
    print("Measuring session with 3 entries...")
    updated_session = cft.measure_session(session, entries, insights)

    # Display session statistics
    stats = updated_session.get_session_statistics()

    print("\nSession Statistics:")
    print("-" * 80)
    print(f"   Entries processed:         {stats['entry_count']}")
    print(f"   Mean Fidelity:             {stats['mean_fidelity']:.3f}")
    print(f"   Mean Transfer:             {stats['mean_transfer']:.3f}")
    print(f"   Mean Loss:                 {stats['mean_loss']:.3f}")
    print(f"   Mean Gain:                 {stats['mean_gain']:.3f}")
    print(f"   Conservation Pass Rate:    {stats['conservation_pass_rate']:.1%}")
    print(f"   High Fidelity Rate:        {stats['high_fidelity_rate']:.1%}")
    print(f"   Emergence Rate:            {stats['emergence_rate']:.1%}")
    print()

    # Alignment checkpoint
    checkpoint_data = updated_session.get_alignment_checkpoint_data()
    print("Alignment Checkpoint Data:")
    print("-" * 80)
    print(f"   Recent entries:            {checkpoint_data['recent_entries']}")
    print(f"   Uncertainties detected:    {len(checkpoint_data['uncertainties'])}")
    print(f"   Emergent connections:      {len(checkpoint_data['emergent_connections'])}")
    print()

    print("=" * 80)


if __name__ == "__main__":
    # Run basic example
    main()

    # Run session example
    session_example()
