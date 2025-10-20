"""
Setup script for Communication Fidelity Tensor
"""

from setuptools import setup, find_packages

with open("CFT_README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="communication-fidelity-tensor",
    version="1.0.0",
    author="Tobi Olofintuyi",
    author_email="TobiOlofintuyi@gmail.com",
    description="A measurement system for quantifying information transfer, loss, and emergence in human-AI interactions",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/TobiOlofintuyi/TobiOlofintuyi",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "numpy>=1.21.0",
        "scipy>=1.7.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=3.0.0",
            "black>=22.0.0",
            "flake8>=4.0.0",
            "mypy>=0.950",
        ],
        "embeddings": [
            "sentence-transformers>=2.0.0",
            "torch>=1.9.0",
        ],
    },
    project_urls={
        "Bug Reports": "https://github.com/TobiOlofintuyi/TobiOlofintuyi/issues",
        "Source": "https://github.com/TobiOlofintuyi/TobiOlofintuyi",
    },
)
