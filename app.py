import os
import time

from flask import Flask, render_template, request, url_for
from flask_restful import Api, Resource

from PIL import Image
import pillow_heif

# Register AVIF / HEIF decoders with Pillow
pillow_heif.register_heif_opener()
pillow_heif.register_avif_opener()

from config import Config
from prediction import YOLOClassifier

app = Flask(__name__)
app.config.from_object(Config)
classifier = YOLOClassifier(app.config["MODEL_PATH"])

api = Api(app)


# Home Page
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


# Upload API
class Upload(Resource):

    def post(self):
        image_file = request.files.get("image")

        if image_file is None or image_file.filename == "":
            return {
                "status": "error",
                "message": "No image selected."
            }, 400

        try:
            filename = image_file.filename
            
            # Save the raw uploaded file
            save_path = os.path.join(
                app.config.get("UPLOAD_FOLDER", "uploads"),
                filename
            )
            image_file.save(save_path)

            # Record start time for inference latency
            start_time = time.time()

            # Open image via Pillow and convert to RGB
            with Image.open(save_path) as img:
                img_rgb = img.convert("RGB")
                
                # Call predict method on YOLOClassifier
                results = classifier.predict(img_rgb)

            inference_time = round((time.time() - start_time) * 1000, 1)

            # Case A: If classifier.predict() returns raw Ultralytics results list
            if isinstance(results, list) and len(results) > 0:
                res = results[0]
                top1_index = res.probs.top1
                top1_name = res.names[top1_index]
                top1_conf = round(float(res.probs.top1conf) * 100, 2)

                top_k = []
                for idx, conf in zip(res.probs.top5, res.probs.top5conf):
                    top_k.append({
                        "class": res.names[idx],
                        "confidence": round(float(conf) * 100, 2)
                    })
            # Case B: If classifier.predict() returns a dict (e.g. {"class_name": ..., "confidence": ...})
            elif isinstance(results, dict):
                top1_name = results.get("prediction") or results.get("class_name") or "Unknown"
                top1_conf = results.get("confidence", 0)
                top_k = results.get("top_k", [{"class": top1_name, "confidence": top1_conf}])

            return {
                "status": "success",
                "filename": filename,
                "prediction": top1_name,
                "confidence": top1_conf,
                "inference_time": inference_time,
                "top_k": top_k
            }, 200

        except Exception as e:
            print(str(e))
            return {
                "status": "error",
                "message": f"Failed to process image: {str(e)}"
            }, 500


api.add_resource(Upload, "/api/upload")


if __name__ == "__main__":
    app.run(debug=True)