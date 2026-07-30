# Real-Time AI Image Classification Web Application
> **Powered by Ultralytics YOLO11 and Flask-RESTful**

---

## 📌 Project Overview
This project is an end-to-end Computer Vision web application designed as a template for final-year **B.Tech (Computer Science & Engineering / Data Science / AI & ML)** capstone projects. 

It demonstrates how to operationalize a state-of-the-art Deep Learning model (**Ultralytics YOLO11 Classification**) into a production-ready Web API using Flask and modern frontend architecture.

### 🔑 Key Learning Objectives
* **Model Deployment**: Integrating PyTorch/YOLO deep learning models into Python backends.
* **RESTful API Architecture**: Designing decoupled backends using `Flask-RESTful`.
* **Asynchronous Web Interfaces**: Handling multipart file uploads, drag-and-drop actions, and AJAX responses with native JavaScript (Fetch API).
* **Environment & Package Management**: Standardizing dependencies using Conda and standard Python virtual environments.

---

## 🏗️ Architecture & Tech Stack


```

[ User UI (HTML5/CSS3/JS) ] ──(HTTP POST /api/upload)──> [ Flask REST API ]
│
(Runs Inference)
▼
[ YOLO11-cls Engine ]

```

* **Backend Engine**: Python 3.12, Flask, Flask-RESTful
* **Deep Learning Framework**: Ultralytics YOLO11, PyTorch, OpenCV, Pillow
* **Frontend Design**: HTML5, CSS3 (Modern Glassmorphism Design), JavaScript (Vanilla ES6)
* **Environment Management**: Anaconda / Miniconda

---

## 📁 Repository Structure

```text
YOLO-Image-Classifier/
│
├── app.py              # Application entry point and RESTful API routes
├── config.py           # Configuration settings and path resolutions
├── prediction.py       # Model wrapper and inference handling
├── requirements.txt    # Python dependencies
├── .gitignore          # Version control ignore patterns
├── README.md           # Documentation
│
├── models/             # Deep learning weights directory
│   └── yolo11n-cls.pt  # Ultralytics YOLO11 Nano classification weights
│
├── templates/          # HTML Templates
│   └── index.html      # Main Web Dashboard
│
└── static/             # Static Assets
    ├── css/
    │   └── style.css   # Modern Dashboard Styles
    ├── js/
    │   └── script.js   # Client-side UI & Async API Logic
    └── uploads/        # Temporary upload directory

```

---

## ⚙️ Quick Start Guide

### 1. Clone the Repository

```bash
git clone [https://github.com/ajaypalsinghtuli/YOLO-Image-Classifier.git](https://github.com/ajaypalsinghtuli/YOLO-Image-Classifier.git)
cd YOLO-Image-Classifier

```

### 2. Set Up Environment

#### Option A: Conda (Recommended)

```bash
conda create -n yolo_classifier python=3.12 -y
conda activate yolo_classifier
pip install -r requirements.txt

```

#### Option B: Standard Python Virtual Environment (`venv`)

```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

```

### 3. Launch Application

```bash
python app.py

```

Open `http://127.0.0.1:5000` in your browser.

---

## 📡 API Reference

### Upload Image for Inference

* **URL**: `/api/upload`
* **Method**: `POST`
* **Content-Type**: `multipart/form-data`

#### Form Parameters

| Field | Type | Description |
| --- | --- | --- |
| `image` | `file` | Image file (`.jpg`, `.jpeg`, `.png`, `.webp`) |

#### Response (`200 OK`)

```json
{
  "status": "success",
  "filename": "sample.jpg",
  "prediction": "groom",
  "confidence": 39.9,
  "top_k": [
    { "class": "groom", "confidence": 39.9 },
    { "class": "suit", "confidence": 21.4 },
    { "class": "tuxedo", "confidence": 18.2 },
    { "class": "bow_tie", "confidence": 8.1 },
    { "class": "gown", "confidence": 4.3 }
  ],
  "inference_time": 42
}

```

---

## 🎯 Code Quality Suggestions & Backend Upgrades

To align the codebase with professional data science and software design standards, consider making two key updates:

### 1. Update `prediction.py` to Return Top-K Probabilities

Your JavaScript frontend is already built to render a Top-5 probability breakdown (`data.top_k`), but `prediction.py` currently returns only the single top prediction (`top1`). Updating `prediction.py` to return Top-5 results activates the probability breakdown bar chart in the UI.

```python
import time
from ultralytics import YOLO

class YOLOClassifier:
    def __init__(self, model_path):
        self.model = YOLO(model_path)

    def predict(self, image_path, topk=5):
        start_time = time.time()
        
        results = self.model(image_path)
        result = results[0]

        # Extract Top-1
        top1_id = int(result.probs.top1)
        top1_class = result.names[top1_id]
        top1_conf = float(result.probs.top1conf)

        # Extract Top-K
        topk_indices = result.probs.top5[:topk]
        topk_confs = result.probs.top5conf[:topk]

        top_k_results = []
        for idx, conf in zip(topk_indices, topk_confs):
            top_k_results.append({
                "class": result.names[int(idx)],
                "confidence": round(float(conf) * 100, 2)
            })

        inference_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "class_name": top1_class,
            "confidence": round(top1_conf * 100, 2),
            "top_k": top_k_results,
            "inference_time": inference_time_ms
        }

```

### 2. Update `app.py` Payload

Update the API response payload in `app.py` to pass through these extra fields:

```python
class Upload(Resource):
    def post(self):
        image = request.files.get("image")
        if image is None:
            return {"status": "error", "message": "No image selected."}, 400

        filename = image.filename
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        image.save(save_path)

        prediction = classifier.predict(save_path)

        return {
            "status": "success",
            "filename": filename,
            "prediction": prediction["class_name"],
            "confidence": prediction["confidence"],
            "top_k": prediction["top_k"],
            "inference_time": prediction["inference_time"]
        }, 200

```

---

## 🚀 Future Roadmap & Extensions for Students

Students can build on top of this capstone framework with the following features:

* **Object Detection & Segmentation**: Swap the `yolo11n-cls.pt` model with `yolo11n.pt` or `yolo11n-seg.pt` to render bounding boxes or masks directly on the visual preview.
* **Webcam Inference**: Integrate HTML5 MediaDevices API (`navigator.mediaDevices.getUserMedia`) for real-time video stream classification.
* **Model Benchmarking UI**: Add UI dropdowns allowing users to switch between YOLO11 Nano, Small, Medium, and Large models to evaluate accuracy vs. latency trade-offs.

---

## 👨‍💻 Author & Contact

* **Author**: Ajaypal Singh
* **GitHub**: [@ajaypalsinghtuli](https://www.google.com/search?q=https://github.com/ajaypalsinghtuli)
