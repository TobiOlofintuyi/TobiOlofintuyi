"""
Communication Fidelity Tensor - Gain Function (G)

Implements FR-G-001 through FR-G-004:
- Novel connection synthesis
- Pattern completion
- Analogical transfer
- Emergence detection
"""

import numpy as np
from typing import List, Dict, Set, Any, Optional, Tuple
from dataclasses import dataclass

from ..models import ConceptNode
from ..config import CFTConfig


@dataclass
class GainResult:
    """Result of gain/emergence measurement"""
    G_synthesis: float  # Novel connection synthesis
    G_pattern: float  # Pattern completion
    G_transfer: float  # Analogical transfer
    G_emergence: float  # Overall emergence score
    total_gain: float  # Sum of all gains
    novel_connections: List[Tuple[ConceptNode, ConceptNode]]  # New connections formed
    completed_patterns: List[Dict[str, Any]]  # Patterns completed
    analogies: List[Dict[str, Any]]  # Cross-domain insights
    emergent_content: Set[str]  # Content in insight not in entry
    metadata: Dict[str, Any]


class GainFunction:
    """
    Gain Function (G) - Measures emergent insights and novel information.

    Implements:
    - FR-G-001: Novel Connection Synthesis
    - FR-G-002: Pattern Completion
    - FR-G-003: Analogical Transfer
    - FR-G-004: Emergence Detection
    """

    def __init__(self, config: CFTConfig, knowledge_graph: Optional[Any] = None):
        """
        Initialize Gain Function.

        Args:
            config: CFT configuration
            knowledge_graph: Model's knowledge graph for connection synthesis
        """
        self.config = config
        self.knowledge_graph = knowledge_graph

    def measure_gain(
        self,
        entry_text: str,
        entry_concepts: List[ConceptNode],
        insight_text: str,
        insight_concepts: List[ConceptNode],
        entry_embedding: np.ndarray,
        insight_embedding: np.ndarray,
        training_patterns: Optional[List[Dict]] = None,
    ) -> GainResult:
        """
        Measure complete gain/emergence.

        Args:
            entry_text: Original user entry
            entry_concepts: Concepts from entry
            insight_text: Generated insight
            insight_concepts: Concepts in insight
            entry_embedding: Entry embedding
            insight_embedding: Insight embedding
            training_patterns: Model's training patterns for pattern completion

        Returns:
            GainResult with all gain components
        """
        # FR-G-001: Novel Connection Synthesis
        G_synthesis, novel_connections = self.synthesize_novel_connections(
            entry_concepts, insight_concepts
        )

        # FR-G-002: Pattern Completion
        G_pattern, completed_patterns = self.complete_patterns(
            entry_text, insight_text, training_patterns or []
        )

        # FR-G-003: Analogical Transfer
        G_transfer, analogies = self.generate_analogical_transfer(
            entry_text, insight_text, entry_concepts, insight_concepts
        )

        # FR-G-004: Emergence Detection
        G_emergence, emergent_content = self.detect_emergence(
            entry_text, insight_text, entry_embedding, insight_embedding
        )

        total_gain = G_synthesis + G_pattern + G_transfer + G_emergence

        return GainResult(
            G_synthesis=G_synthesis,
            G_pattern=G_pattern,
            G_transfer=G_transfer,
            G_emergence=G_emergence,
            total_gain=total_gain,
            novel_connections=novel_connections,
            completed_patterns=completed_patterns,
            analogies=analogies,
            emergent_content=emergent_content,
            metadata={
                "high_emergence": total_gain > self.config.high_gain_threshold,
                "novel_connection_count": len(novel_connections),
                "pattern_count": len(completed_patterns),
                "analogy_count": len(analogies),
                "should_highlight": total_gain > self.config.high_gain_threshold,
            }
        )

    def synthesize_novel_connections(
        self,
        entry_concepts: List[ConceptNode],
        insight_concepts: List[ConceptNode]
    ) -> Tuple[float, List[Tuple[ConceptNode, ConceptNode]]]:
        """
        FR-G-001: Novel Connection Synthesis

        Detect connections not explicit in entry.
        Acceptance: ≥1 emergent connection per insight

        Args:
            entry_concepts: Concepts from user entry
            insight_concepts: Concepts in generated insight

        Returns:
            Tuple of (synthesis_score, novel_connections)
        """
        novel_connections: List[Tuple[ConceptNode, ConceptNode]] = []

        # Find concepts in insight that weren't in entry
        entry_concept_ids = {c.concept_id for c in entry_concepts}
        new_concepts = [c for c in insight_concepts if c.concept_id not in entry_concept_ids]

        # For each new concept, find its connection to entry concepts
        for new_concept in new_concepts:
            for entry_concept in entry_concepts:
                # Check if there's a meaningful connection
                connection_strength = self._measure_concept_connection(
                    entry_concept, new_concept
                )

                if connection_strength > 0.5:  # Threshold for meaningful connection
                    novel_connections.append((entry_concept, new_concept))

        # Score based on number of novel connections
        # Normalize by entry concept count
        base_score = len(novel_connections) / max(len(entry_concepts), 1)
        synthesis_score = min(base_score, 1.0)  # Cap at 1.0

        return float(synthesis_score), novel_connections

    def complete_patterns(
        self,
        entry_text: str,
        insight_text: str,
        training_patterns: List[Dict[str, Any]]
    ) -> Tuple[float, List[Dict[str, Any]]]:
        """
        FR-G-002: Pattern Completion

        Identify model-completed patterns.
        Acceptance: User validation score ≥0.7 for completions

        Args:
            entry_text: User entry (may contain partial narratives)
            insight_text: Generated insight
            training_patterns: Model's training patterns

        Returns:
            Tuple of (pattern_score, completed_patterns)
        """
        completed_patterns: List[Dict[str, Any]] = []

        # Detect partial narratives in entry
        partial_narratives = self._detect_partial_narratives(entry_text)

        # Check if insight completes any patterns
        for narrative in partial_narratives:
            # Check against training patterns or insight content
            completion = self._find_pattern_completion(
                narrative, insight_text, training_patterns
            )

            if completion:
                completed_patterns.append({
                    "partial_narrative": narrative,
                    "completion": completion,
                    "confidence": completion.get("confidence", 0.5),
                    "pattern_type": completion.get("type", "unknown")
                })

        # Score based on number and quality of completions
        if completed_patterns:
            avg_confidence = sum(p["confidence"] for p in completed_patterns) / len(completed_patterns)
            pattern_score = avg_confidence * min(len(completed_patterns) / 2, 1.0)
        else:
            pattern_score = 0.0

        return float(pattern_score), completed_patterns

    def generate_analogical_transfer(
        self,
        entry_text: str,
        insight_text: str,
        entry_concepts: List[ConceptNode],
        insight_concepts: List[ConceptNode]
    ) -> Tuple[float, List[Dict[str, Any]]]:
        """
        FR-G-003: Analogical Transfer

        Generate relevant analogies/metaphors.
        Acceptance: Cultural appropriateness score ≥0.8

        Args:
            entry_text: User entry
            insight_text: Generated insight
            entry_concepts: Entry concepts
            insight_concepts: Insight concepts

        Returns:
            Tuple of (transfer_score, analogies)
        """
        analogies: List[Dict[str, Any]] = []

        # Detect cross-domain mappings
        entry_domains = {c.category for c in entry_concepts}
        insight_domains = {c.category for c in insight_concepts}

        # Find domains in insight not in entry (potential analogies)
        new_domains = insight_domains - entry_domains

        # Extract analogical statements from insight
        analogy_markers = [
            "like", "similar to", "as if", "reminds me of",
            "analogous to", "comparable to", "just as"
        ]

        insight_lower = insight_text.lower()
        for marker in analogy_markers:
            if marker in insight_lower:
                # Extract context around marker
                analogy = self._extract_analogy_context(insight_text, marker)
                if analogy:
                    analogies.append({
                        "analogy": analogy,
                        "marker": marker,
                        "source_domain": list(entry_domains),
                        "target_domain": list(new_domains),
                        "cultural_appropriateness": self._assess_cultural_appropriateness(analogy),
                    })

        # Score based on number and quality of analogies
        if analogies:
            avg_appropriateness = sum(
                a["cultural_appropriateness"] for a in analogies
            ) / len(analogies)
            transfer_score = avg_appropriateness * min(len(analogies) / 2, 1.0)
        else:
            transfer_score = 0.0

        return float(transfer_score), analogies

    def detect_emergence(
        self,
        entry_text: str,
        insight_text: str,
        entry_embedding: np.ndarray,
        insight_embedding: np.ndarray
    ) -> Tuple[float, Set[str]]:
        """
        FR-G-004: Emergence Detection

        Identify content in insight not present in entry.
        Emergence score = (Understood - Sent) / Understood

        Args:
            entry_text: User entry
            insight_text: Generated insight
            entry_embedding: Entry embedding
            insight_embedding: Insight embedding

        Returns:
            Tuple of (emergence_score, emergent_content_set)
        """
        emergent_content: Set[str] = set()

        # Text-level emergence: words in insight not in entry
        entry_words = set(entry_text.lower().split())
        insight_words = set(insight_text.lower().split())

        # Find substantive new words (exclude common words)
        common_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for"}
        new_words = insight_words - entry_words - common_words

        # Filter for meaningful emergent content (length > 3)
        emergent_content = {word for word in new_words if len(word) > 3}

        # Semantic-level emergence: embedding distance
        # High distance suggests novel semantic content
        embedding_distance = np.linalg.norm(insight_embedding - entry_embedding)

        # Normalize distance to [0, 1]
        # Typical embedding distances range from 0 to ~2 for unit vectors
        normalized_distance = min(embedding_distance / 2.0, 1.0)

        # Combined emergence score
        word_emergence = len(emergent_content) / max(len(insight_words), 1)
        semantic_emergence = normalized_distance

        # Weighted combination: 40% word-level, 60% semantic
        emergence_score = 0.4 * word_emergence + 0.6 * semantic_emergence

        return float(np.clip(emergence_score, 0, 1)), emergent_content

    # Helper methods

    def _measure_concept_connection(
        self,
        concept1: ConceptNode,
        concept2: ConceptNode
    ) -> float:
        """
        Measure connection strength between two concepts.

        Uses knowledge graph if available, otherwise embedding similarity.
        """
        # If knowledge graph available, use it
        if self.knowledge_graph:
            # In production, query knowledge graph for path between concepts
            # For now, use category proximity as proxy
            if concept1.category == concept2.category:
                return 0.8
            elif self._are_related_categories(concept1.category, concept2.category):
                return 0.6
            else:
                return 0.3

        # Fall back to embedding similarity if available
        if concept1.embedding is not None and concept2.embedding is not None:
            similarity = np.dot(concept1.embedding, concept2.embedding) / (
                np.linalg.norm(concept1.embedding) * np.linalg.norm(concept2.embedding)
            )
            return float((similarity + 1) / 2)  # Normalize to [0, 1]

        # Default: moderate connection
        return 0.5

    def _are_related_categories(self, cat1: str, cat2: str) -> bool:
        """Check if two categories are related"""
        # Define category relationships for Inyeon ontology
        related_pairs = {
            ("compassion", "growth"),
            ("compassion", "connection"),
            ("growth", "connection"),
            ("emotional", "compassion"),
            ("cognitive", "growth"),
        }

        return (cat1, cat2) in related_pairs or (cat2, cat1) in related_pairs

    def _detect_partial_narratives(self, text: str) -> List[str]:
        """Detect partial narratives or incomplete thoughts"""
        partial_narratives = []

        # Heuristic: sentences ending with ellipsis or trailing off
        sentences = text.split('.')

        for sentence in sentences:
            sentence = sentence.strip()
            if sentence:
                # Check for incompleteness markers
                if any(marker in sentence.lower() for marker in [
                    "...", "and then", "but", "however", "though",
                    "i wonder", "maybe", "perhaps"
                ]):
                    partial_narratives.append(sentence)

        return partial_narratives

    def _find_pattern_completion(
        self,
        partial: str,
        insight: str,
        patterns: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Find if insight completes a partial narrative"""
        # Simple heuristic: check if insight addresses the partial
        partial_lower = partial.lower()
        insight_lower = insight.lower()

        # Extract key words from partial
        key_words = [w for w in partial_lower.split() if len(w) > 4]

        if not key_words:
            return None

        # Check if insight addresses these key words
        matches = sum(1 for word in key_words if word in insight_lower)
        match_ratio = matches / len(key_words)

        if match_ratio > 0.5:  # More than half the key words addressed
            return {
                "partial": partial,
                "completion": insight[:100],  # First 100 chars of insight
                "confidence": match_ratio,
                "type": "contextual_completion"
            }

        return None

    def _extract_analogy_context(self, text: str, marker: str) -> Optional[str]:
        """Extract analogy context around a marker"""
        marker_index = text.lower().find(marker)
        if marker_index == -1:
            return None

        # Extract surrounding context (50 chars before and after)
        start = max(0, marker_index - 50)
        end = min(len(text), marker_index + len(marker) + 50)

        context = text[start:end].strip()
        return context if len(context) > 10 else None

    def _assess_cultural_appropriateness(self, analogy: str) -> float:
        """
        Assess cultural appropriateness of an analogy.

        In production, this would use cultural knowledge base.
        For now, simple heuristics.
        """
        # Check for potentially inappropriate content
        inappropriate_markers = [
            "offensive", "stereotype", "discriminatory", "biased"
        ]

        analogy_lower = analogy.lower()

        # If contains inappropriate markers, score low
        if any(marker in analogy_lower for marker in inappropriate_markers):
            return 0.3

        # Check for universal vs. culturally-specific references
        universal_concepts = [
            "love", "growth", "connection", "challenge", "journey",
            "light", "darkness", "seasons", "nature"
        ]

        has_universal = any(concept in analogy_lower for concept in universal_concepts)

        if has_universal:
            return 0.85  # High appropriateness for universal concepts
        else:
            return 0.6  # Moderate for neutral content
