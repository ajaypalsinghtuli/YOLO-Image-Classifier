import os
import shutil
import urllib.request
from ultralytics import YOLO
import config

_model_cache = {}

def get_model(model_key: str = "yolo11n-cls") -> YOLO:
    if model_key not in config.MODELS:
        model_key = "yolo11n-cls"
    
    if model_key not in _model_cache:
        # Base folder paths
        base_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(base_dir, "models")
        os.makedirs(models_dir, exist_ok=True)
        
        model_filename = config.MODELS[model_key]["file"]
        model_path = os.path.join(models_dir, model_filename)
        root_path = os.path.join(base_dir, model_filename)

        # 1. If file is in the root directory, move it to models/
        if os.path.exists(root_path) and not os.path.exists(model_path):
            shutil.move(root_path, model_path)

        # 2. If file does not exist in models/, download directly to models/
        if not os.path.exists(model_path):
            print(f"Downloading {model_filename} directly to {models_dir}...")
            url = f"https://github.com/ultralytics/assets/releases/download/v8.3.0/{model_filename}"
            try:
                urllib.request.urlretrieve(url, model_path)
            except Exception:
                # Fallback: let Ultralytics download and relocate to models/
                temp_model = YOLO(model_filename)
                if os.path.exists(root_path):
                    shutil.move(root_path, model_path)

        # 3. Load model strictly from models/ folder
        _model_cache[model_key] = YOLO(model_path)
        
    return _model_cache[model_key]

def get_model_classes(model_key: str = "yolo11n-cls") -> dict:
    model = get_model(model_key)
    return model.names

def predict_top5(image_path: str, model_key: str = "yolo11n-cls") -> list:
    model = get_model(model_key)
    results = model(image_path)
    
    top5_results = []
    for r in results:
        top5_indices = r.probs.top5
        top5_confs = r.probs.top5conf.tolist()
        
        for rank, (idx, conf) in enumerate(zip(top5_indices, top5_confs), start=1):
            top5_results.append({
                "rank": rank,
                "class_id": int(idx),
                "class_name": r.names[int(idx)],
                "confidence": round(float(conf) * 100, 2),
                "is_top": rank == 1
            })
    return top5_results