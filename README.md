# ⚡ Real-Time AI Image Classification Web Application
> **Powered by Ultralytics YOLO11 and Flask**

---

## 📌 Project Overview
This project is an end-to-end Computer Vision web application that demonstrates how to operationalize state-of-the-art Deep Learning models (**Ultralytics YOLO11 Classification**) into a production-ready Web API featuring a modern, responsive Glassmorphism dashboard.

It supports dynamic multi-scale model selection (Nano through Extra-Large), automated weight management, top-5 prediction outputs with visual highlights, a 1,000-class inspector modal, and strict 20 MB upload size validation.

### 🔑 Key Learning Objectives
* **Model Deployment**: Integrating PyTorch/YOLO deep learning models into Python web backends.
* **Dynamic Model Switching**: Loading multiple YOLO11 model scales (`n`, `s`, `m`, `l`, `x`) dynamically without server restarts.
* **Asynchronous Web Interfaces**: Handling multipart file uploads, drag-and-drop actions, and AJAX responses with native JavaScript (Fetch API).
* **Environment Management**: Standardizing dependencies using Conda and standard Python virtual environments.

---

## 🏗️ Architecture & Tech Stack

```text
[ Browser UI (HTML5 / CSS3 / Vanilla JS) ]
                   │
                   ▼  (HTTP POST multipart/form-data /predict)
           [ Flask Web API ]
                   │
                   ▼  (Inference on models/yolo11*-cls.pt)
      [ Ultralytics YOLO11 Engine ]
                   │
                   ▼  (JSON Response: Top-5 Predictions & Scores)
   [ Glassmorphism Visual Dashboard ]


* **Backend Engine:** Python 3.12, Flask, Werkzeug
* **Deep Learning Framework:** Ultralytics YOLO11, PyTorch, Pillow
* **Frontend Design:** HTML5, Modern Glassmorphism CSS3, Vanilla ES6 JavaScript
* **Environment Management:** Anaconda / Miniconda / Python venv

---

## 📁 Repository Structure

```text
YOLO-Image-Classifier/
│
├── app.py              # Application entry point, API routes, and cache-busting headers
├── config.py           # Configuration settings, models registry, and dataset metadata
├── prediction.py       # YOLO11 wrapper, Top-5 prediction logic, and models/ folder resolver
├── requirements.txt    # Python dependencies
├── .gitignore          # Version control ignore patterns
├── README.md           # Documentation
│
├── models/             # Storage for downloaded / custom .pt weights
│   └── yolo11n-cls.pt  # YOLO11 Nano classification weights (auto-managed)
│
├── templates/          # HTML Templates
│   └── index.html      # Main Glassmorphism Web Dashboard
│
└── static/             # Static Assets
    ├── css/
    │   └── style.css   # Modern Dark/Glassmorphism Styles
    ├── js/
    │   └── script.js   # Client-side Drag-and-Drop, AJAX, and Class Search Logic
    └── uploads/        # Temporary upload directory

```

---

## ⚙️ Installation & Quick Start Guide

### 1. Clone the Repository

```bash
git clone [https://github.com/ajaypalsinghtuli/YOLO-Image-Classifier.git](https://github.com/ajaypalsinghtuli/YOLO-Image-Classifier.git)
cd YOLO-Image-Classifier

```

### 2. Set Up Environment & Install Dependencies

**Option A: Using Conda / Miniconda (Recommended)**

```bash
# Create a fresh Conda environment with Python 3.12:
conda create -n yolo_classifier python=3.12 -y

# Activate the Conda environment:
conda activate yolo_classifier

# Install dependencies via pip:
pip install -r requirements.txt

```

*(Optional)* If using an NVIDIA GPU for accelerated inference, install CUDA-enabled PyTorch inside your Conda environment:

```bash
conda install pytorch torchvision pytorch-cuda=12.1 -c pytorch -c nvidia

```

**Option B: Standard Python Virtual Environment (venv)**

```bash
# Create virtual environment
python -m venv venv

# Activate on Windows:
venv\Scripts\activate

# Activate on Linux/macOS:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

```

### 3. Launch the Application

```bash
python app.py

```

Open your browser and navigate to: `http://127.0.0.1:5000/`

---

## ✨ Features Breakdown

* **Multi-Scale Model Selection:**
* **Nano (`yolo11n-cls`):** Fastest inference, built for low-power edge chips.
* **Small (`yolo11s-cls`):** Better accuracy while remaining lightweight.
* **Medium (`yolo11m-cls`):** Balanced speed and accuracy for general use.
* **Large (`yolo11l-cls`):** Higher precision, requires more compute.
* **Extra-Large (`yolo11x-cls`):** Maximum classification accuracy.
*(Weights are automatically stored in and loaded directly from the `models/` directory).*


* **Top-5 Probabilities with Visual Hierarchy:** Computes and displays the top 5 predicted classes with animated confidence bars and a distinct visual highlight on the #1 predicted class.
* **1,000-Class Inspector Modal:** Built-in modal with real-time text search to browse all 1,000 ImageNet categories supported by the models.
* **20 MB File Size Enforcement:** Client-side validation prevents oversized uploads with a backend HTTP 413 error handler protection.

---

## 📊 YOLO11 Classification Model Comparison

| Model Variant | Parameters | Top-1 Accuracy (ImageNet) | Top-5 Accuracy (ImageNet) | Recommended Target |
| --- | --- | --- | --- | --- |
| **YOLO11n-cls** | ~1.6M | 70.0% | 89.5% | Edge AI, IoT, Mobile devices |
| **YOLO11s-cls** | ~5.5M | 75.4% | 92.8% | Lightweight cloud inference |
| **YOLO11m-cls** | ~11.0M | 77.3% | 93.8% | General production servers |
| **YOLO11l-cls** | ~16.5M | 78.3% | 94.4% | High-precision workflows |
| **YOLO11x-cls** | ~28.5M | 79.5% | 95.1% | Maximum accuracy requirements |

---

## 📡 API Reference

### 1. Classify Image

* **URL:** `/predict`
* **Method:** `POST`
* **Content-Type:** `multipart/form-data`

**Form Parameters:**

| Field | Type | Description |
| --- | --- | --- |
| `file` | file | Image file (.jpg, .jpeg, .png, .webp, max 20 MB) |
| `model` | string | Model key (`yolo11n-cls`, `yolo11s-cls`, `yolo11m-cls`, `yolo11l-cls`, `yolo11x-cls`) |

**Success Response:**

```json
{
  "success": true,
  "image_url": "/static/uploads/sample.jpg",
  "model_used": "YOLO11 Medium (m)",
  "predictions": [
    { "rank": 1, "class_id": 263, "class_name": "Pembroke Welsh Corgi", "confidence": 91.45, "is_top": true },
    { "rank": 2, "class_id": 264, "class_name": "Cardigan Welsh Corgi", "confidence": 6.20, "is_top": false }
  ]
}

```

### 2. Inspect Model Classes

* **URL:** `/api/classes`
* **Method:** `GET`
* **Query Parameters:** `model` (e.g., `?model=yolo11n-cls`)

**Success Response:**

```json
{
  "model": "yolo11n-cls",
  "total_classes": 1000,
  "classes": {
    "0": "tench",
    "1": "goldfish"
  }
}

```

---

## 🔮 Future Roadmap & Custom Model Support

* **Object Detection & Instance Segmentation:** Extend the UI to support bounding box visualization (`yolo11*-det`) and polygon mask rendering (`yolo11*-seg`).
* **Custom Model Upload Interface:** Drop-in custom-trained `.pt` weights for proprietary datasets with automatic class list parsing.
* **Real-Time Webcam Streaming:** Stream frames directly from browser video devices via WebRTC / Canvas for live inference.
* **Export & Batch Inference:** Batch classify entire directories and export results to JSON/CSV formats.

---

## 👨‍💻 Author & Contact

**Ajaypal Singh**

* **GitHub:** [@ajaypalsinghtuli](https://github.com/ajaypalsinghtuli)
* **Kaggle:** [ajaypalsinghlo](https://www.kaggle.com/ajaypalsinghlo)

```

```