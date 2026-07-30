document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const uploadForm = document.getElementById("uploadForm");
    const fileInput = document.getElementById("imageInput");
    const dropArea = document.getElementById("dropArea");
    const dropContent = document.getElementById("dropContent");
    const fileInfoOverlay = document.getElementById("fileInfoOverlay");
    const fileNameEl = document.getElementById("fileName");
    const fileSizeEl = document.getElementById("fileSize");
    const clearFileBtn = document.getElementById("clearFileBtn");
    
    const submitBtn = document.getElementById("submitBtn");
    const resetBtn = document.getElementById("resetBtn");
    const loadingOverlay = document.getElementById("loading");
    
    const previewImage = document.getElementById("previewImage");
    const imgPlaceholder = document.getElementById("imgPlaceholder");
    
    const topClassEl = document.getElementById("topClass");
    const topConfidenceEl = document.getElementById("topConfidence");
    const topConfidenceBar = document.getElementById("topConfidenceBar");
    const probabilityList = document.getElementById("probabilityList");
    
    const speedBadge = document.getElementById("speedBadge");
    const inferenceTimeEl = document.getElementById("inferenceTime");

    let selectedFile = null;

    // Toast Utility
    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        const icon = type === "error" ? "fa-circle-exclamation" : "fa-circle-check";
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // Format File Sizes
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Set File in UI State
    function handleFileSelect(file) {
        if (!file || !file.type.startsWith("image/")) {
            showToast("Please select a valid image file.", "error");
            return;
        }

        selectedFile = file;
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatBytes(file.size);

        // Toggle UI
        dropContent.classList.add("hidden");
        fileInfoOverlay.classList.remove("hidden");
        submitBtn.disabled = false;

        // Render Instant Local Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.classList.remove("hidden");
            imgPlaceholder.classList.add("hidden");
        };
        reader.readAsDataURL(file);
    }

    // Event Listeners for Upload Area
    dropArea.addEventListener("click", (e) => {
        if (e.target.closest("#clearFileBtn")) return;
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Drag and Drop Effects
    ["dragenter", "dragover"].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropArea.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropArea.classList.remove("dragover");
        }, false);
    });

    dropArea.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        if (dt.files.length > 0) {
            handleFileSelect(dt.files[0]);
        }
    });

    // Clear Selected File
    clearFileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        resetFormState();
    });

    resetBtn.addEventListener("click", resetFormState);

    function resetFormState() {
        selectedFile = null;
        fileInput.value = "";
        
        dropContent.classList.remove("hidden");
        fileInfoOverlay.classList.add("hidden");
        submitBtn.disabled = true;

        previewImage.src = "";
        previewImage.classList.add("hidden");
        imgPlaceholder.classList.remove("hidden");

        topClassEl.textContent = "--";
        topConfidenceEl.textContent = "0%";
        topConfidenceBar.style.width = "0%";
        probabilityList.innerHTML = `<div class="empty-list-msg">Run classification to view probability distribution.</div>`;
        speedBadge.classList.add("hidden");
    }

    // Submit Form / API Request
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        loadingOverlay.classList.remove("hidden");
        const startTime = performance.now();

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to process image.");
            }

            const endTime = performance.now();
            const clientInferenceTime = Math.round(endTime - startTime);

            // Render Primary Prediction
            const primaryClass = data.prediction || data.class_name || "Unknown";
            const confidenceVal = data.confidence !== undefined ? data.confidence : 0;

            topClassEl.textContent = primaryClass;
            topConfidenceEl.textContent = `${confidenceVal}%`;
            topConfidenceBar.style.width = `${confidenceVal}%`;

            // Display speed
            inferenceTimeEl.textContent = data.inference_time || clientInferenceTime;
            speedBadge.classList.remove("hidden");

            // Render Top-K Breakdown List (if backend delivers top_k list)
            if (data.top_k && Array.isArray(data.top_k)) {
                renderProbabilityList(data.top_k);
            } else {
                // Fallback breakdown if backend gives single prediction
                renderProbabilityList([
                    { class: primaryClass, confidence: confidenceVal }
                ]);
            }

            showToast("Inference completed successfully!", "success");

        } catch (err) {
            showToast(err.message, "error");
        } finally {
            loadingOverlay.classList.add("hidden");
        }
    });

    // Render Top Probabilities Bars
    function renderProbabilityList(items) {
        probabilityList.innerHTML = "";

        items.forEach(item => {
            const className = item.class || item.label || "Class";
            const score = item.confidence || item.score || 0;

            const row = document.createElement("div");
            row.className = "prob-item";
            row.innerHTML = `
                <span class="prob-name" title="${className}">${className}</span>
                <div class="prob-bar-bg">
                    <div class="prob-bar-fill" style="width: ${score}%"></div>
                </div>
                <span class="prob-val">${score}%</span>
            `;
            probabilityList.appendChild(row);
        });
    }
});