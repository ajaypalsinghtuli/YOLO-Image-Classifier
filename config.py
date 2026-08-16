import os

UPLOAD_FOLDER = os.path.join("static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_CONTENT_LENGTH = 20 * 1024 * 1024  # 20 MB max file size limit

MODELS = {
    "yolo11n-cls": {
        "name": "YOLO11 Nano (n)",
        "file": "yolo11n-cls.pt",
        "description": "Fastest, built for low-power edge chips.",
    },
    "yolo11s-cls": {
        "name": "YOLO11 Small (s)",
        "file": "yolo11s-cls.pt",
        "description": "Better accuracy, still light.",
    },
    "yolo11m-cls": {
        "name": "YOLO11 Medium (m)",
        "file": "yolo11m-cls.pt",
        "description": "Balanced for general use.",
    },
    "yolo11l-cls": {
        "name": "YOLO11 Large (l)",
        "file": "yolo11l-cls.pt",
        "description": "Higher precision, needs more power.",
    },
    "yolo11x-cls": {
        "name": "YOLO11 Extra-Large (x)",
        "file": "yolo11x-cls.pt",
        "description": "Maximum accuracy.",
    },
}

DATASET_INFO = {
    "name": "ImageNet (1,000 Classes)",
    "dataset_url": "https://www.image-net.org/",
    "docs_url": "https://docs.ultralytics.com/models/yolo11/",
}