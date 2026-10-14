# InjeX

**AI Prompt Injection Detection & Adversarial Robustness Testing**

InjeX is a cybersecurity project that detects potentially malicious prompt injections and evaluates how adversarial text transformations affect machine learning-based detection. It compares a baseline detector with an improved detector trained using adversarially augmented prompts.

The project explores a practical approach to identifying malicious instructions hidden in normal-looking or obfuscated text.

## Overview

Prompt injection is a security risk in applications powered by Large Language Models (LLMs). Attackers may craft instructions intended to override system instructions, manipulate model behavior, or influence how an AI application processes information.

InjeX investigates prompt injection detection through text preprocessing, machine learning classification, adversarial prompt augmentation, and comparative model evaluation.

## Features

- **Prompt Detection:** Classifies prompts as benign or potentially malicious.
- **Text Preprocessing:** Normalizes Unicode text, removes zero-width characters, and standardizes whitespace.
- **Adversarial Testing:** Generates obfuscated prompt variants using character substitution, spacing changes, punctuation modifications, instruction splitting, and Unicode substitutions.
- **Baseline vs. Improved Model:** Compares a baseline detector with a model trained using adversarial augmentation.
- **Performance Evaluation:** Measures accuracy, precision, recall, F1-score, and false-positive rate.
- **Robustness Analysis:** Evaluates detector performance on clean and adversarially transformed test prompts.
- **Visualization:** Presents model comparisons and evaluation results through charts, tables, and confusion matrices.

## How It Works

1. A user submits a prompt for analysis.
2. The text is normalized and preprocessed.
3. The baseline detector classifies the prompt.
4. Adversarial transformations generate modified prompt variants for robustness testing.
5. The improved detector analyzes prompts using a model trained on adversarially augmented data.
6. Both approaches are evaluated using the same relevant test labels.
7. Their performance is compared using standard classification metrics.

## Machine Learning Approach

The current Python implementation uses:

- **Dataset:** `neuralchemy/Prompt-injection-dataset`, configuration `core`.
- **Feature Extraction:** Word-level and character-level TF-IDF.
- **Classifier:** Logistic Regression.
- **Adversarial Augmentation:** Character substitution, spacing obfuscation, punctuation obfuscation, instruction splitting, and Unicode obfuscation.
- **Evaluation:** Accuracy, precision, recall, F1-score, and false-positive rate.

The project is inspired by the research on DataSentinel, which investigates game-theoretic approaches to prompt injection detection. The current implementation uses a TF-IDF and Logistic Regression pipeline rather than a full implementation of DataSentinel's game-theoretic minimax method.

## Tech Stack

**Machine Learning and Backend**
- Python
- scikit-learn
- pandas
- NumPy
- Hugging Face Datasets

**Dashboard**
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- FastAPI

The dashboard stack describes the intended web application architecture. Refer to the actual repository implementation for the components currently integrated.

## Getting Started

### Prerequisites

- Python 3.10 or a compatible version supported by the dependencies
- Node.js and npm, if using the React frontend
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/InjeX.git
cd InjeX
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Set up the Python environment

```bash
python -m venv .venv
```

Activate the environment.

**Windows:**

```bash
.venv\Scripts\activate
```

Install the machine learning dependencies:

```bash
pip install datasets scikit-learn pandas numpy matplotlib seaborn
```

Install any additional dependencies required by the backend's `requirements.txt`, if present.

### 3. Run the existing machine learning implementation

The original Python implementation was developed in a notebook-style format. Review `se_project (1).py` and execute it in the appropriate notebook environment after installing its dependencies.

The script downloads the configured dataset, preprocesses prompts, trains the baseline and improved classifiers, and calculates evaluation metrics.

**Note:** The original script contains notebook-specific commands. It may need to be adapted before running directly as a standard Python script.

### 4. Run the web application

If the repository contains the React frontend and FastAPI backend, follow the startup commands documented in their respective directories or in the project's README instructions.

The frontend and backend must both be configured and running for live detection to work.

## Evaluation Metrics

InjeX evaluates the following metrics:

| Metric | Purpose |
|---|---|
| Accuracy | Overall proportion of correct predictions |
| Precision | Proportion of predicted malicious prompts that are actually malicious |
| Recall | Proportion of malicious prompts correctly detected |
| F1-score | Harmonic mean of precision and recall |
| False Positive Rate | Proportion of benign prompts incorrectly classified as malicious |

Clean and adversarial test results are compared to investigate how text obfuscation affects detection performance.

## Project Structure

The intended application structure separates the frontend, backend, preprocessing, adversarial transformations, detection, and evaluation components. The exact directory structure may vary depending on the current repository implementation.

```text
InjeX/
├── frontend/
│   └── src/
├── backend/
│   └── app/
├── se_project (1).py
├── README.md
└── .gitignore
```

## Limitations

- Detection quality depends on the training data, feature extraction, and classifier.
- Unseen attack patterns may evade detection.
- Adversarial transformations do not cover every possible prompt injection technique.
- Results on public benchmarks may not represent all real-world applications.
- A malicious prompt detector alone cannot guarantee the security of an LLM application.
- The current ML implementation is not the complete game-theoretic DataSentinel algorithm.

## Project Team

- **Shripad Jadhav** — K017
- **Debayan Lahiry** — K032
- **Sarah Samel** — K049

## Academic Context

Developed as a Software Engineering project focused on prompt injection detection, adversarial robustness, and comparative machine learning evaluation.

## Research Reference

Liu, Y., Jia, Y., Jia, J., and Gong, N. Z. *DataSentinel: A Game-Theoretic Detection of Prompt Injection Attacks.* IEEE Symposium on Security and Privacy, 2025.

[Research paper on IEEE Xplore](https://ieeexplore.ieee.org/document/11023476)

## Disclaimer

InjeX is an academic research and demonstration project. Its classifications are predictions, not guarantees of security. It should not be treated as a standalone defense for production LLM applications.

## License

No license has been specified yet. Add a license if you intend to define how others may use, modify, and distribute this project.
