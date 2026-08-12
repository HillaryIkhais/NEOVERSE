from setuptools import setup, find_packages

setup(
    name="arm-triage",
    version="1.0.0",
    description="Arm-Native inference router explicitly designed for Oracle Cloud Ampere A1 (Arm Neoverse) instances.",
    author="ARM-TRIAGE Team",
    packages=find_packages(),
    py_modules=["cli"],
    install_requires=[
        "streamlit",
        # "vllm" is required but omitted here to allow graceful failure on non-Arm systems for demo purposes.
    ],
    entry_points={
        "console_scripts": [
            "arm-triage=cli:main",
        ],
    },
)
