import os


class Config:

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    MODEL_PATH = os.path.join(
        BASE_DIR,
        "models",
        "yolo11n-cls.pt"
    )

    UPLOAD_FOLDER = os.path.join(
        BASE_DIR,
        "static",
        "uploads"
    )

    RESULT_FOLDER = os.path.join(
        BASE_DIR,
        "static",
        "results"
    )

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024