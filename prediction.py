from ultralytics import YOLO


class YOLOClassifier:

    def __init__(self, model_path):
        self.model = YOLO(model_path)

    def predict(self, image_path):

        results = self.model(image_path)

        result = results[0]

        class_id = int(result.probs.top1)

        class_name = result.names[class_id]

        confidence = float(result.probs.top1conf)

        return {
            "class_name": class_name,
            "confidence": round(confidence * 100, 2)
        }