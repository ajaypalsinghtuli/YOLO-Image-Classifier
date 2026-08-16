import os
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename
import config
from prediction import predict_top5, get_model_classes

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = config.UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH

# Disables browser caching for static files during development
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs("models", exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS

@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "The image is greater than 20 MB. Please upload a smaller file."}), 413

@app.route("/", methods=["GET"])
def index():
    return render_template(
        "index.html",
        models=config.MODELS,
        dataset_info=config.DATASET_INFO
    )

@app.route("/api/classes", methods=["GET"])
def get_classes():
    try:
        model_key = request.args.get("model", "yolo11n-cls")
        classes = get_model_classes(model_key)
        return jsonify({
            "model": model_key,
            "total_classes": len(classes),
            "classes": classes
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        model_key = request.form.get("model", "yolo11n-cls")

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(filepath)

            predictions = predict_top5(filepath, model_key)
            image_url = url_for("static", filename=f"uploads/{filename}")

            return jsonify({
                "success": True,
                "image_url": image_url,
                "model_used": config.MODELS.get(model_key, {}).get("name", model_key),
                "predictions": predictions
            })

        return jsonify({"error": "File format not supported. Allowed formats: PNG, JPG, JPEG, WEBP"}), 400

    except Exception as e:
        return jsonify({"error": f"Inference error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)