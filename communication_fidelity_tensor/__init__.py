"""
Communication Fidelity Tensor (CFT) - Inyeon AI

A measurement system that quantifies information transfer, loss, and emergence
in human-AI journaling interactions.

Based on CFT-FRD-001 Functional Requirements Document.
"""

__version__ = "1.0.0"
__author__ = "Inyeon AI"

from .models import (
    CFTMeasurement,
    TransferTopology,
    ConceptNode,
    InterpretationAlternative,
    MeasurementStatus,
)

from .config import CFTConfig, DEFAULT_CONFIG

from .core.cft import CommunicationFidelityTensor
from .core.transfer import TransferFunction, TransferResult
from .core.loss import LossFunction, LossResult
from .core.gain import GainFunction, GainResult
from .core.uncertainty import UncertaintyFunction, UncertaintyResult

__all__ = [
    # Main orchestrator
    "CommunicationFidelityTensor",

    # Core functions
    "TransferFunction",
    "LossFunction",
    "GainFunction",
    "UncertaintyFunction",

    # Results
    "TransferResult",
    "LossResult",
    "GainResult",
    "UncertaintyResult",

    # Data models
    "CFTMeasurement",
    "TransferTopology",
    "ConceptNode",
    "InterpretationAlternative",
    "MeasurementStatus",

    # Configuration
    "CFTConfig",
    "DEFAULT_CONFIG",
]
