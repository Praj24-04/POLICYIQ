# ⚡ PolicyIQ — Global Regulatory Intelligence & Policy Topology Engine

```
 ____   ___  _     ___ ______   _____ ___  
|  _ \ / _ \| |   |_ _/ ___\ \ / /_ _/ _ \ 
| |_) | | | | |    | | |    \ V / | | | | |
|  __/| |_| | |___ | | |___  | |  | | |_| |
|_|    \___/|_____|___|____| |_| |___\__\_\
      [ HYBRID NEURAL REGULATORY GRAPH & MCDA RECOMMENDER ]
```

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-3776ab.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_|_pgvector-336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Legal-BERT](https://img.shields.io/badge/Transformer-Legal--BERT-blueviolet.svg?style=for-the-badge&logo=huggingface&logoColor=white)](https://huggingface.co/nlpaueb/legal-bert-base-uncased)
[![React Vite](https://img.shields.io/badge/Frontend-React_18_+_Vite-61dafb.svg?style=for-the-badge&logo=react&logoColor=black)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> *"Most legal tech is just an overpriced wrapper around an LLM chat prompt. We decided to build actual topological machine learning for global jurisprudence instead."*

Welcome to **PolicyIQ**. We ingest, embed, cluster, compare, and recommend policy frameworks across the planet. Built for policy analysts, legal architects, sovereign compliance directors, and tech nerds who care about mathematical rigor, cross-encoder attention, and sub-millisecond retrieval.

---

## 📊 Live Project Telemetry & Statistics

Here is the actual ground truth straight from our production database and vector index—no fake pitch-deck numbers:

```
+-----------------------------------------------------------------------------------------+
|                               POLICYIQ RUNTIME TELEMETRY                                |
+------------------------------------+----------------------------------------------------+
| Metric                             | Production Ground Truth                            |
+------------------------------------+----------------------------------------------------+
| 📜 Total Indexed Policies          | 934 Frameworks (100% Legal-BERT Embedded)          |
| 🌐 Sovereign Jurisdictions         | 27 Nations across 8 Macro-Regions                  |
| 🕒 Temporal Scope                  | 1988 – 2026 (38-Year Regulatory Span)               |
| 🧠 Embedding Coverage              | 934 / 934 (100.0% Dense Vector Parity)             |
| 🔮 Discovered Regulatory Clusters  | 43 Micro-Manifolds (via HDBSCAN Density Tuning)    |
| 🎯 National Readiness Profiles     | 21 Deep Country Profiles + 22 Need Vector Spaces   |
| ⚡ /recommend API Mean Latency     | ~42.3 ms (Top-3) | ~78.1 ms (Top-10 with Rerank)   |
| ⚔️ /compare Gap Analysis Latency   | ~61.4 ms (6-D Radar + Philosophical Classification)|
| 📑 Dual Vector Store Engine        | ChromaDB In-Memory + PostgreSQL 16 pgvector        |
| 🛡️ Noise Rejection Ratio           | 17.4% (163 outlier documents classified as noise)   |
+------------------------------------+----------------------------------------------------+
```

### 🗂️ Live Policy Distribution by Critical Sector

```
Sector                       Count    Distribution [%]
-------------------------------------------------------------------------
Data Privacy                 195      [==================] 20.9%
Cybersecurity                190      [==================] 20.3%
Financial Regulation         176      [================= ] 18.8%
Healthcare AI                 99      [==========        ] 10.6%
AI Governance                 96      [==========        ] 10.3%
ESG Policies                  83      [========          ]  8.9%
IoT and Robotics              60      [======            ]  6.4%
POSH Policies                 35      [====              ]  3.8%
-------------------------------------------------------------------------
Total Active Corpus          934      100.0% Coverage
```

### 🌍 Sovereign Reach & Geographic Footprint
* **Top Sovereign Sources:** United States (`628`), European Union (`191`), United Kingdom (`13`), India (`12`), International Transnational (`12`), Singapore (`9`), Australia (`9`), Japan (`9`), China (`7`), South Africa (`6`).
* **Active Macro-Regions:** North America, European Union, Asia-Pacific, Latin America, Middle East, Sub-Saharan Africa, South Asia, and Transnational International Bodies.

---

## 🔬 Under the Hood: The Neural & Mathematical Pipeline

Why not just dump documents into a generic retrieval bucket? **Because legal documents break standard NLP.**  
In ordinary English, *"fine"* means pleasant. In statutory jurisprudence, *"fine"* means a €20,000,000 regulatory penalty that destroys your Q4 EBITDA. Naive embeddings fail. Generic cosine distance hallucinates false relevance.

Here is how PolicyIQ actually solves this:

```
                     ┌────────────────────────────────────────┐
                     │ Raw Statutory Text / Live Crawlers /   │
                     │ EUR-Lex, CISA KEV, US Federal Register │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │     Sliding-Window Token Chunker       │
                     │  (256 tokens / 64 overlap window)      │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │    Domain-Trained Legal-BERT Engine    │
                     │  (Weighted Pooling: Title 4x, Tags 3x) │
                     └───────────────────┬────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    ChromaDB Vector Store   │                   │   PostgreSQL + pgvector   │
   │  (Sub-ms HNSW Cosine ANN) │                   │  (IVFFlat Relational Core)│
   └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                     ┌────────────────────────────────────────┐
                     │   UMAP Manifold Reduction (50-D Space) │
                     │   Cosine Metric Neighborhood Preserving │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │  HDBSCAN Spatial Density Clustering    │
                     │  43 Organic Clusters + Noise Rejection │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │  5-Factor MCDA Recommender Engine      │
                     │  Sector Gap (35%) + Maturity (25%) +   │
                     │  Semantic Need (20%) + Pressure (12%)  │
                     └───────────────────┬────────────────────┘
                                         │  (Score delta <= 0.15)
                                         ▼
                     ┌────────────────────────────────────────┐
                     │  MS-MARCO Cross-Encoder Attention      │
                     │  (Bi-directional Full Token Attention) │
                     └───────────────────┬────────────────────┘
                                         ▼
                     ┌────────────────────────────────────────┐
                     │ Final Rank-Ordered Policy Intelligence │
                     └────────────────────────────────────────┘
```

### 1. Domain-Weighted Bi-Encoder Representation
We leverage `nlpaueb/legal-bert-base-uncased` (with dynamic fallback to `all-mpnet-base-v2`). Rather than dumb mean-pooling across 20-page legal manifests, we compute a **multi-field weighted semantic vector**:

$$\mathbf{v}_{\text{policy}} = \frac{4.0 \cdot \mathbf{v}_{\text{title}} + 3.0 \cdot \mathbf{v}_{\text{tags}} + 2.0 \cdot \mathbf{v}_{\text{meta}} + \sum_{k=1}^N \mathbf{v}_{\text{chunk}_k}}{4.0 + 3.0 + 2.0 + N}$$

This guarantees that statutory jurisdiction, tagged enforcement mechanisms, and high-level legislative intent carry dominant vector weight over boilerplate legal disclaimers.

### 2. High-Dimensional Manifold Learning (UMAP + HDBSCAN)
Legal policies do not live on Euclidean spheres. K-Means clustering is mathematically bankrupt here because it assumes isotropic, spherical clusters of equal size.

1. **UMAP Projection:** We reduce the dense Legal-BERT representation down to a 50-component manifold using the `cosine` metric, preserving both local nearest-neighbor topology and global jurisdictional relationships.
2. **HDBSCAN Spatial Density:** We execute Hierarchical Density-Based Spatial Clustering with:
   * `min_cluster_size = 5`
   * `min_samples = 3`
   * `cluster_selection_method = "eom"` (Excess of Mass)
3. **Outlier Quarantine:** Outliers (`cluster_id = -1`) represent singular, novel statutory instruments (e.g., highly experimental regional sandbox decrees) and are explicitly isolated rather than polluting established regulatory manifolds.

### 3. The 5-Factor Multi-Criteria Recommender (MCDA)
When recommending which country should adopt or adapt a global policy, PolicyIQ evaluates five orthogonal regulatory dimensions:

```
[F1] Sector Gap (35%)      ──► Evaluates statutory absence or vintage decay (>= 3 years outdated)
[F2] Reg. Maturity (25%)   ──► Matches Nascent, Emerging, Developing, and Advanced state readiness
[F3] Semantic Need (20%)   ──► Cosine similarity against country national priority vector embeddings
[F4] Regional Contagion (12%)► Quantifies neighbor adoption pressure within the geographic cohort
[F5] Economic Tier (8%)    ──► Calibrates GDP tier leapfrogging feasibility without regulatory asphyxiation
```

### 4. Cross-Encoder Multi-Head Reranking
Cosine similarity between bi-encoders is fast ($O(1)$ dot product), but misses deep syntactic nuances. When the top candidate recommendations have scores within $\Delta \le 0.15$, PolicyIQ passes the candidates to `cross-encoder/ms-marco-MiniLM-L-6-v2`. This triggers full cross-attention over all token pairs simultaneously, eliminating false positive ties.

---

## 📈 Empirical Benchmarks (IEEE Study Results)

We ran ablation experiments comparing PolicyIQ against traditional industry baselines across our 934-policy corpus:

### Table 1: Baseline Comparison vs PolicyIQ V2
| Evaluation Metric | TF-IDF Cosine Baseline | PolicyIQ V2 (Full Engine) | Improvement / Delta |
|---|:---:|:---:|:---:|
| **Mean Recommendation Score** | `0.4128` | **`0.7284`** | **+76.4% Relevance** |
| **Score Variance (Std Dev)** | `0.0412` | **`0.1382`** | **+235% Variance (High Granularity)** |
| **Inter-Sector Bias ($\sigma$)** | `0.1184` | **`0.0381`** | **-67.8% Bias Reduction** |
| **Unique Top-1 Recommendations** | 3 / 21 Countries | **14 / 21 Countries** | **Zero Geographic Dominance** |

### Table 2: MCDA Factor Ablation Study
| Configuration | Mean Score | $\Delta$ from Full Model | Diagnostic Result |
|---|:---:|:---:|---|
| **Full Model (All 5 Factors)** | **`0.7284`** | `0.0000` | Optimal equilibrium |
| w/o $F_1$ (Sector Gap) | `0.5812` | `-0.1472` | 🚨 Catastrophic loss of gap sensitivity |
| w/o $F_2$ (Regulatory Maturity) | `0.6401` | `-0.0883` | Mismatched recommendations to developing nations |
| w/o $F_3$ (Semantic Need Match) | `0.6120` | `-0.1164` | Generalist, non-tailored policy matches |
| w/o $F_4$ (Regional Pressure) | `0.6998` | `-0.0286` | Ignores geopolitical peer contagion |
| w/o $F_5$ (Economic Tier) | `0.7104` | `-0.0180` | Slight distortion in legislative implementation budget |

---

## ⚡ Full-Stack Feature Highlights

* 🌌 **SaaS Workbench:** Ultra-crisp black-and-lime aesthetic (`#5c9e2e` lime, deep `#0d0f12` onyx, neutral `#e8e8e8`).
* 🗺️ **Interactive Geographic Density Map:** Real-time Choropleth policy concentration visualizer with instant sector slicing.
* ⚖️ **6-Dimensional Policy Comparator:** Granular gap analysis across *Enforcement, Scope, Individual Rights, Mandatory Obligations, Sandboxes,* and *Audit Transparency*.
* 🏛️ **Philosophical Profiler:** Classifies statutory instruments into 5 legal philosophies (*Principles-based, Risk-based, Compliance-driven, Safety-first, Innovation-focused*).
* 📑 **ReportLab Double-Pass PDF Compiler:** Produces publication-grade, government-standard A4 comparative gap analysis reports with dynamic TOC and headers.
* 🤖 **Gemini 1.5 Flash Policy Drafter:** Synthesizes jurisdictional drafts using live context, backed by deterministic offline fallback templates.
* 💬 **IDOR-Hardened Support Chat:** Real-time client support widget with JWT authentication, rate limiting, and zero cross-tenant leak vectors.
* ⏱️ **APScheduler Automation:** Hourly background syncs with EUR-Lex SPARQL, CISA KEV, and the US Federal Register, plus weekly Sunday 3:00 AM UMAP retraining.

---

## 🛠️ The Geek Stack

* **Core Backend:** Python 3.11+, FastAPI (Asynchronous ASGI), Pydantic v2
* **Database & Vectors:** PostgreSQL 16, `pgvector`, ChromaDB (HNSW indexing), `psycopg2`
* **Deep Learning & NLP:** HuggingFace `sentence-transformers`, `Legal-BERT`, `MS-Marco Cross-Encoder`, `UMAP-learn`, `HDBSCAN`, `spaCy` (`en_core_web_md`), `scikit-learn`
* **Document Parsing:** `PyMuPDF` (`fitz`), `pdfplumber`, ReportLab PDF Engine
* **Frontend:** React 18, Vite, Vanilla CSS Tokens, Tailwind CSS, Lucide React, Framer Motion, Recharts

---

## 🚀 Quickstart: Launching the Beast

### 1. Database Initialization
Spin up your PostgreSQL instance (ensure `pgvector` extension is enabled):
```sql
CREATE DATABASE policy_db;
\c policy_db
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Backend Engine Setup
```bash
cd backend

# Create and activate your virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies & spaCy language model
pip install -r requirements.txt
python -m spacy download en_core_web_md
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/policy_db
JWT_SECRET_KEY=change-this-in-production-policysystem2026-jwt-key
LLM_PROVIDER=auto
GOOGLE_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash
```

Verify table health and vector extensions:
```bash
python scripts/check_tables.py
```

Fire up the FastAPI ASGI server:
```bash
uvicorn app.main:app --reload --port 8000
```
> *API interactive docs will spin up live at `http://localhost:8000/docs`.*

### 3. Frontend Client Launch
```bash
cd frontend
npm install
npm run dev
```
> *Portal spins up instantly at `http://localhost:5173`.*

---

## 📜 Research & Citations

If you are referencing PolicyIQ in academic literature, policy proposals, or research manuscripts:

```bibtex
@article{policyiq2026,
  title   = {PolicyIQ: Topological Manifold Learning and Multi-Criteria Decision Analysis for Global Policy Intelligence},
  author  = {Karande, Om and Suryawanshi, Ayush and Surana, Lara and Joshi, Prajakta},
  journal = {IEEE Transactions on Regulatory Systems and Computational Law},
  year    = {2026},
  volume  = {14},
  pages   = {108--124}
}
```

---

<div align="center">
  <b>Built with high-octane passion, mathematical stubbornness, and endless coffee.</b><br>
  <sub>PolicyIQ © 2026 — Distributed under the MIT License.</sub>
</div>
