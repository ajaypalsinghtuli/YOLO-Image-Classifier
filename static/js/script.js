document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("upload-form");
    const fileInput = document.getElementById("file-input");
    const dropZone = document.getElementById("drop-zone");
    const modelSelect = document.getElementById("model-select");
    const fileNameDisplay = document.getElementById("file-name-display");
    const errorBox = document.getElementById("error-box");
    
    const placeholderState = document.getElementById("placeholder-state");
    const loadingState = document.getElementById("loading-state");
    const resultsContent = document.getElementById("results-content");
    const imagePreview = document.getElementById("image-preview");
    const modelBadge = document.getElementById("model-badge");
    const top5List = document.getElementById("top5-list");

    const viewClassesBtn = document.getElementById("view-classes-btn");
    const classesModal = document.getElementById("classes-modal");
    const closeModal = document.getElementById("close-modal");
    const modalBody = document.getElementById("modal-body");
    const classSearch = document.getElementById("class-search");

    const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    let loadedClasses = [];

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.style.display = "block";
    }

    function hideError() {
        errorBox.textContent = "";
        errorBox.style.display = "none";
    }

    // Drag-and-drop animations
    ["dragenter", "dragover"].forEach(event => {
        dropZone.addEventListener(event, (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach(event => {
        dropZone.addEventListener(event, (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
        });
    });

    dropZone.addEventListener("drop", (e) => {
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelection();
        }
    });

    fileInput.addEventListener("change", handleFileSelection);

    function handleFileSelection() {
        hideError();
        const file = fileInput.files[0];
        if (file) {
            if (file.size > MAX_SIZE_BYTES) {
                showError("The image is greater than 20 MB. Please upload a smaller file.");
                fileInput.value = "";
                fileNameDisplay.innerHTML = `Drag & drop or <span class="highlight">browse</span>`;
                return;
            }
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            fileNameDisplay.innerHTML = `<strong>${file.name}</strong> (${sizeMB} MB)`;
        }
    }

    // Inference Submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const file = fileInput.files[0];
        if (!file) {
            showError("Please choose an image to classify.");
            return;
        }

        if (file.size > MAX_SIZE_BYTES) {
            showError("The image is greater than 20 MB. Please upload a smaller file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("model", modelSelect.value);

        placeholderState.style.display = "none";
        resultsContent.style.display = "none";
        loadingState.style.display = "flex";

        try {
            const response = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            loadingState.style.display = "none";

            if (!response.ok) {
                showError(data.error || "Failed to classify image.");
                placeholderState.style.display = "flex";
                return;
            }

            // Populate Results
            imagePreview.src = data.image_url;
            modelBadge.textContent = data.model_used;
            top5List.innerHTML = "";

            data.predictions.forEach((item) => {
                const li = document.createElement("li");
                li.className = `rank-row ${item.is_top ? 'top-highlight' : ''}`;
                li.innerHTML = `
                    <div class="progress-bar-bg" style="width: ${item.confidence}%"></div>
                    <div class="rank-row-content">
                        <span><span class="rank-badge">#${item.rank}</span> ${item.class_name}</span>
                        <span class="confidence-val">${item.confidence}%</span>
                    </div>
                `;
                top5List.appendChild(li);
            });

            resultsContent.style.display = "block";
        } catch (err) {
            loadingState.style.display = "none";
            placeholderState.style.display = "flex";
            showError("Network or server connection error occurred.");
        }
    });

    // Model Classes Modal & Realtime Search
    viewClassesBtn.addEventListener("click", async () => {
        const modelKey = modelSelect.value;
        modalBody.innerHTML = "<p style='color:var(--text-secondary)'>Loading classes...</p>";
        classSearch.value = "";
        classesModal.style.display = "flex";

        try {
            const res = await fetch(`/api/classes?model=${modelKey}`);
            const data = await res.json();

            if (data.error) {
                modalBody.innerHTML = `<p style="color:var(--error-border)">${data.error}</p>`;
                return;
            }

            loadedClasses = Object.entries(data.classes).map(([id, name]) => ({ id, name }));
            renderClasses(loadedClasses);
        } catch {
            modalBody.innerHTML = "<p style='color:var(--error-border)'>Failed to load classes from server.</p>";
        }
    });

    classSearch.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = loadedClasses.filter(c => c.name.toLowerCase().includes(term) || c.id.toString().includes(term));
        renderClasses(filtered);
    });

    function renderClasses(list) {
        if (!list.length) {
            modalBody.innerHTML = "<p style='color:var(--text-secondary); padding: 10px;'>No matching classes found.</p>";
            return;
        }
        modalBody.innerHTML = `
            <div class="class-grid-layout">
                ${list.map(c => `<div class="class-item-pill"><code>#${c.id}</code> <span>${c.name}</span></div>`).join("")}
            </div>
        `;
    }

    closeModal.addEventListener("click", () => classesModal.style.display = "none");
    window.addEventListener("click", (e) => {
        if (e.target === classesModal) classesModal.style.display = "none";
    });
});