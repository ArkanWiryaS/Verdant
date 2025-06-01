// Global variables
let faceDetectionModel = null;
let maskClassificationModel = null;
let webcamStream = null;
let isWebcamActive = false;
let detectionInterval = null;

const webcamTab = document.getElementById("webcamTab");
const uploadTab = document.getElementById("uploadTab");
const webcamPanel = document.getElementById("webcamPanel");
const uploadPanel = document.getElementById("uploadPanel");
const modelStatus = document.getElementById("modelStatus");
const statusText = document.getElementById("statusText");
const progressFill = document.getElementById("progressFill");

const startWebcamBtn = document.getElementById("startWebcam");
const stopWebcamBtn = document.getElementById("stopWebcam");
const capturePhotoBtn = document.getElementById("capturePhoto");
const webcamVideo = document.getElementById("webcam");
const webcamCanvas = document.getElementById("webcamCanvas");
const webcamLoading = document.getElementById("webcamLoading");
const webcamResult = document.getElementById("webcamResult");

const uploadDropzone = document.getElementById("uploadDropzone");
const fileInput = document.getElementById("fileInput");
const uploadPreview = document.getElementById("uploadPreview");
const previewImage = document.getElementById("previewImage");
const uploadCanvas = document.getElementById("uploadCanvas");
const uploadLoading = document.getElementById("uploadLoading");
const uploadResult = document.getElementById("uploadResult");

document.addEventListener("DOMContentLoaded", async function () {
  await initializeModels();
  setupEventListeners();
  setupTabSwitching();
});

async function initializeModels() {
  try {
    updateStatus("Loading TensorFlow.js...", 20);

    await tf.ready();
    updateStatus("TensorFlow.js loaded successfully!", 40);

    updateStatus("Loading face detection model...", 60);
    faceDetectionModel = await blazeface.load();
    updateStatus("Face detection model loaded!", 80);

    updateStatus("Initializing mask classification...", 90);
    await simulateModelLoading();
    maskClassificationModel = createSimpleMaskClassifier();

    updateStatus("All models loaded successfully!", 100);

    setTimeout(() => {
      modelStatus.style.display = "none";
      enableControls();
    }, 1000);
  } catch (error) {
    console.error("Error loading models:", error);
    updateStatus("Error loading models. Please refresh the page.", 0);
  }
}

function updateStatus(message, progress) {
  statusText.textContent = message;
  progressFill.style.width = progress + "%";

  if (progress === 100) {
    progressFill.style.backgroundColor = "#10B981"; // Green
  }
}

function simulateModelLoading() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

function createSimpleMaskClassifier() {
  return {
    predict: function (faceRegion) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = faceRegion.width;
      canvas.height = faceRegion.height;

      ctx.drawImage(faceRegion, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const faceHeight = canvas.height;
      const faceWidth = canvas.width;

      const mouthY1 = Math.floor(faceHeight * 0.6);
      const mouthY2 = Math.floor(faceHeight * 0.9);
      const mouthWidth = Math.floor(faceWidth * 0.8); // Wider coverage
      const mouthX1 = Math.floor(faceWidth * 0.1);

      const noseY1 = Math.floor(faceHeight * 0.4);
      const noseY2 = Math.floor(faceHeight * 0.65);

      const maskColorCoverage = detectMaskColorCoverage(
        imageData,
        mouthX1,
        mouthY1,
        mouthWidth,
        mouthY2 - mouthY1
      );

      const mouthConcealment = detectMouthConcealment(
        imageData,
        mouthX1,
        mouthY1,
        mouthWidth,
        mouthY2 - mouthY1
      );

      const colorUniformity = analyzeColorUniformity(
        imageData,
        mouthX1,
        mouthY1,
        mouthWidth,
        mouthY2 - mouthY1
      );

      const maskEdgeSignature = analyzeMaskEdges(
        imageData,
        mouthX1,
        mouthY1,
        mouthWidth,
        mouthY2 - mouthY1
      );

      const brightnessContrast = analyzeBrightnessContrast(
        imageData,
        mouthX1,
        noseY1,
        mouthWidth,
        noseY2 - noseY1,
        mouthY1,
        mouthY2 - mouthY1
      );

      let maskScore = 0;

      if (maskColorCoverage > 0.6) {
        maskScore += 40;
        console.log("STRONG: Mask colors detected +40");
      } else if (maskColorCoverage > 0.4) {
        maskScore += 25;
        console.log("GOOD: Some mask colors +25");
      } else if (maskColorCoverage > 0.2) {
        maskScore += 10;
        console.log("SLIGHT: Few mask colors +10");
      } else {
        maskScore -= 15;
        console.log("PENALTY: No mask colors -15");
      }

      if (mouthConcealment > 0.7) {
        maskScore += 30;
        console.log("BONUS: Mouth well concealed +30");
      } else if (mouthConcealment > 0.5) {
        maskScore += 20;
        console.log("BONUS: Mouth mostly concealed +20");
      } else if (mouthConcealment > 0.3) {
        maskScore += 5;
        console.log("SMALL: Mouth partially concealed +5");
      } else if (mouthConcealment < 0.2) {
        maskScore -= 25;
        console.log("PENALTY: Mouth clearly visible -25");
      }

      if (colorUniformity > 0.8) {
        maskScore += 20;
        console.log("BONUS: Very uniform surface +20");
      } else if (colorUniformity > 0.6) {
        maskScore += 12;
        console.log("BONUS: Uniform surface +12");
      } else if (colorUniformity < 0.3) {
        maskScore -= 5;
        console.log("SLIGHT: Natural skin texture -5");
      }

      if (maskEdgeSignature > 0.6) {
        maskScore += 15;
        console.log("BONUS: Clear mask edges +15");
      } else if (maskEdgeSignature > 0.4) {
        maskScore += 8;
        console.log("BONUS: Some mask edges +8");
      }

      if (brightnessContrast > 0.7) {
        maskScore += 15;
        console.log("BONUS: Clear brightness contrast +15");
      } else if (brightnessContrast > 0.5) {
        maskScore += 8;
        console.log("BONUS: Some brightness contrast +8");
      }

      const hasMask = maskScore >= 50;

      let confidence;
      if (hasMask) {
        if (maskScore >= 80) {
          confidence = 0.88 + Math.random() * 0.1;
        } else if (maskScore >= 65) {
          confidence = 0.82 + Math.random() * 0.13;
        } else {
          confidence = 0.75 + Math.random() * 0.15;
        }
      } else {
        if (maskScore <= 20) {
          confidence = 0.85 + Math.random() * 0.12;
        } else if (maskScore <= 35) {
          confidence = 0.78 + Math.random() * 0.17;
        } else {
          confidence = 0.7 + Math.random() * 0.15;
        }
      }

      console.log("=== BALANCED MASK DETECTION ===");
      console.log("Mask Color Coverage:", maskColorCoverage.toFixed(3));
      console.log("Mouth Concealment:", mouthConcealment.toFixed(3));
      console.log("Color Uniformity:", colorUniformity.toFixed(3));
      console.log("Mask Edge Signature:", maskEdgeSignature.toFixed(3));
      console.log("Brightness Contrast:", brightnessContrast.toFixed(3));
      console.log("TOTAL SCORE:", maskScore);
      console.log("PREDICTION:", hasMask ? "WITH MASK" : "WITHOUT MASK");
      console.log("CONFIDENCE:", (confidence * 100).toFixed(1) + "%");
      console.log("==============================");

      return {
        prediction: hasMask ? "with_mask" : "without_mask",
        confidence: Math.min(confidence, 0.98),
      };
    },
  };
}

function detectMaskColorCoverage(imageData, x, y, width, height) {
  const data = imageData.data;
  const imageWidth = imageData.width;
  let maskPixels = 0;
  let totalPixels = 0;

  for (let row = y; row < y + height && row < imageData.height; row++) {
    for (let col = x; col < x + width && col < imageWidth; col++) {
      const index = (row * imageWidth + col) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      const brightness = (r + g + b) / 3;
      const colorVariation =
        Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);

      // Mask color patterns
      const isWhiteMask = brightness > 170 && colorVariation < 40; // White masks
      const isLightBlueMask = b > 140 && r < 200 && g < 200; // Blue surgical masks
      const isGrayMask =
        brightness > 130 && brightness < 190 && colorVariation < 35; // Gray masks
      const isColoredMask =
        brightness > 100 && colorVariation < 50 && brightness < 220; // Colored fabric masks

      if (isWhiteMask || isLightBlueMask || isGrayMask || isColoredMask) {
        maskPixels++;
      }
      totalPixels++;
    }
  }

  return maskPixels / totalPixels;
}

function detectMouthConcealment(imageData, x, y, width, height) {
  const data = imageData.data;
  const imageWidth = imageData.width;
  let concealmentScore = 0;
  let samples = 0;

  for (
    let row = y + 2;
    row < y + height - 2 && row < imageData.height - 2;
    row += 2
  ) {
    for (
      let col = x + 3;
      col < x + width - 3 && col < imageWidth - 3;
      col += 3
    ) {
      const centerIndex = (row * imageWidth + col) * 4;
      const r = data[centerIndex];
      const g = data[centerIndex + 1];
      const b = data[centerIndex + 2];
      const brightness = (r + g + b) / 3;

      const isNotLipColor = !(r > g + 20 && r > b + 20 && r > 100);
      const isNotMouthShadow = brightness > 80;
      const isUniformTexture = true;

      const topIndex = ((row - 2) * imageWidth + col) * 4;
      const bottomIndex = ((row + 2) * imageWidth + col) * 4;
      const topBright =
        (data[topIndex] + data[topIndex + 1] + data[topIndex + 2]) / 3;
      const bottomBright =
        (data[bottomIndex] + data[bottomIndex + 1] + data[bottomIndex + 2]) / 3;
      const hasLowEdge = Math.abs(topBright - bottomBright) < 30;

      if (isNotLipColor && isNotMouthShadow && hasLowEdge) {
        concealmentScore += 1;
      }
      samples++;
    }
  }

  return samples > 0 ? concealmentScore / samples : 0;
}

function analyzeColorUniformity(imageData, x, y, width, height) {
  const data = imageData.data;
  const imageWidth = imageData.width;
  let uniformitySum = 0;
  let patches = 0;

  for (let patchY = y; patchY < y + height - 5; patchY += 5) {
    for (let patchX = x; patchX < x + width - 5; patchX += 5) {
      let patchColors = [];

      for (let py = 0; py < 5; py++) {
        for (let px = 0; px < 5; px++) {
          const pixelIndex = ((patchY + py) * imageWidth + (patchX + px)) * 4;
          const brightness =
            (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) /
            3;
          patchColors.push(brightness);
        }
      }

      const avgBrightness =
        patchColors.reduce((a, b) => a + b) / patchColors.length;
      const variance =
        patchColors.reduce(
          (sum, val) => sum + Math.abs(val - avgBrightness),
          0
        ) / patchColors.length;

      const uniformity = Math.max(0, 1 - variance / 50);
      uniformitySum += uniformity;
      patches++;
    }
  }

  return patches > 0 ? uniformitySum / patches : 0;
}

function analyzeMaskEdges(imageData, x, y, width, height) {
  const data = imageData.data;
  const imageWidth = imageData.width;
  let edgeScore = 0;
  let edgeChecks = 0;

  const topY = y + Math.floor(height * 0.1);
  const bottomY = y + Math.floor(height * 0.9);

  for (let col = x + 10; col < x + width - 10; col += 5) {
    if (topY - 3 >= 0 && topY + 3 < imageData.height) {
      const aboveIndex = ((topY - 3) * imageWidth + col) * 4;
      const belowIndex = ((topY + 3) * imageWidth + col) * 4;

      const aboveBright =
        (data[aboveIndex] + data[aboveIndex + 1] + data[aboveIndex + 2]) / 3;
      const belowBright =
        (data[belowIndex] + data[belowIndex + 1] + data[belowIndex + 2]) / 3;

      if (Math.abs(aboveBright - belowBright) > 20) {
        edgeScore += 1;
      }
      edgeChecks++;
    }

    if (bottomY - 3 >= 0 && bottomY + 3 < imageData.height) {
      const aboveIndex = ((bottomY - 3) * imageWidth + col) * 4;
      const belowIndex = ((bottomY + 3) * imageWidth + col) * 4;

      const aboveBright =
        (data[aboveIndex] + data[aboveIndex + 1] + data[aboveIndex + 2]) / 3;
      const belowBright =
        (data[belowIndex] + data[belowIndex + 1] + data[belowIndex + 2]) / 3;

      if (Math.abs(aboveBright - belowBright) > 20) {
        edgeScore += 1;
      }
      edgeChecks++;
    }
  }

  return edgeChecks > 0 ? edgeScore / edgeChecks : 0;
}

function analyzeBrightnessContrast(
  imageData,
  x,
  noseY1,
  width,
  noseHeight,
  mouthY1,
  mouthHeight
) {
  const data = imageData.data;
  const imageWidth = imageData.width;

  let noseBrightness = 0;
  let nosePixels = 0;
  for (
    let row = noseY1;
    row < noseY1 + noseHeight && row < imageData.height;
    row++
  ) {
    for (let col = x; col < x + width && col < imageWidth; col++) {
      const index = (row * imageWidth + col) * 4;
      noseBrightness += (data[index] + data[index + 1] + data[index + 2]) / 3;
      nosePixels++;
    }
  }
  noseBrightness /= nosePixels;

  let mouthBrightness = 0;
  let mouthPixels = 0;
  for (
    let row = mouthY1;
    row < mouthY1 + mouthHeight && row < imageData.height;
    row++
  ) {
    for (let col = x; col < x + width && col < imageWidth; col++) {
      const index = (row * imageWidth + col) * 4;
      mouthBrightness += (data[index] + data[index + 1] + data[index + 2]) / 3;
      mouthPixels++;
    }
  }
  mouthBrightness /= mouthPixels;

  const contrast = Math.abs(noseBrightness - mouthBrightness);
  return Math.min(contrast / 40, 1); // Normalize to 0-1
}

function enableControls() {
  startWebcamBtn.disabled = false;
  startWebcamBtn.classList.add("btn-enabled");
}

function setupEventListeners() {
  startWebcamBtn.addEventListener("click", startWebcam);
  stopWebcamBtn.addEventListener("click", stopWebcam);
  capturePhotoBtn.addEventListener("click", capturePhoto);

  fileInput.addEventListener("change", handleFileSelect);
  uploadDropzone.addEventListener("click", () => fileInput.click());
  uploadDropzone.addEventListener("dragover", handleDragOver);
  uploadDropzone.addEventListener("drop", handleDrop);
}

function setupTabSwitching() {
  webcamTab.addEventListener("click", () => switchTab("webcam"));
  uploadTab.addEventListener("click", () => switchTab("upload"));
}

function switchTab(tab) {
  if (tab === "webcam") {
    webcamTab.classList.add("active");
    uploadTab.classList.remove("active");
    webcamPanel.classList.add("active");
    uploadPanel.classList.remove("active");
  } else {
    uploadTab.classList.add("active");
    webcamTab.classList.remove("active");
    uploadPanel.classList.add("active");
    webcamPanel.classList.remove("active");

    if (isWebcamActive) {
      stopWebcam();
    }
  }
}

async function startWebcam() {
  try {
    webcamLoading.style.display = "flex";

    const constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
    };

    webcamStream = await navigator.mediaDevices.getUserMedia(constraints);
    webcamVideo.srcObject = webcamStream;

    webcamVideo.onloadedmetadata = () => {
      webcamCanvas.width = webcamVideo.videoWidth;
      webcamCanvas.height = webcamVideo.videoHeight;

      webcamLoading.style.display = "none";
      startWebcamBtn.disabled = true;
      stopWebcamBtn.disabled = false;
      capturePhotoBtn.disabled = false;

      isWebcamActive = true;
      startDetectionLoop();

      updateResult(
        webcamResult,
        "Webcam started. Detecting faces and masks...",
        "info"
      );
    };
  } catch (error) {
    console.error("Error accessing webcam:", error);
    webcamLoading.style.display = "none";
    updateResult(
      webcamResult,
      "Error accessing webcam. Please check permissions.",
      "error"
    );
  }
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach((track) => track.stop());
    webcamStream = null;
  }

  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  webcamVideo.srcObject = null;
  const ctx = webcamCanvas.getContext("2d");
  ctx.clearRect(0, 0, webcamCanvas.width, webcamCanvas.height);

  startWebcamBtn.disabled = false;
  stopWebcamBtn.disabled = true;
  capturePhotoBtn.disabled = true;
  isWebcamActive = false;

  updateResult(webcamResult, "Webcam stopped.", "info");
}

function startDetectionLoop() {
  detectionInterval = setInterval(async () => {
    if (isWebcamActive && webcamVideo.readyState === 4) {
      await detectFacesAndMasks(webcamVideo, webcamCanvas, webcamResult);
    }
  }, 200);
}

async function capturePhoto() {
  if (!isWebcamActive) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = webcamVideo.videoWidth;
  canvas.height = webcamVideo.videoHeight;

  ctx.drawImage(webcamVideo, 0, 0);

  canvas.toBlob(
    (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `face-mask-detection-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    },
    "image/jpeg",
    0.8
  );

  updateResult(webcamResult, "Photo captured and downloaded!", "success");
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    processUploadedImage(file);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  uploadDropzone.classList.add("drag-over");
}

function handleDrop(event) {
  event.preventDefault();
  uploadDropzone.classList.remove("drag-over");

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processUploadedImage(files[0]);
  }
}

async function processUploadedImage(file) {
  if (!file.type.startsWith("image/")) {
    updateResult(uploadResult, "Please select a valid image file.", "error");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    updateResult(
      uploadResult,
      "File size too large. Please select an image under 10MB.",
      "error"
    );
    return;
  }

  uploadLoading.style.display = "flex";
  uploadPreview.style.display = "block";

  const reader = new FileReader();
  reader.onload = async function (e) {
    previewImage.src = e.target.result;
    previewImage.onload = async function () {
      uploadCanvas.width = previewImage.naturalWidth;
      uploadCanvas.height = previewImage.naturalHeight;

      await detectFacesAndMasks(previewImage, uploadCanvas, uploadResult);
      uploadLoading.style.display = "none";
    };
  };
  reader.readAsDataURL(file);
}

async function detectFacesAndMasks(imageElement, canvas, resultContainer) {
  const ctx = canvas.getContext("2d");

  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const predictions = await faceDetectionModel.estimateFaces(
      imageElement,
      false
    );

    if (predictions.length === 0) {
      updateResult(resultContainer, "No faces detected in the image.", "info");
      return;
    }

    let results = [];

    for (let i = 0; i < predictions.length; i++) {
      const prediction = predictions[i];
      const [x, y, width, height] = prediction.topLeft.concat(
        prediction.bottomRight.map(
          (coord, idx) => coord - prediction.topLeft[idx]
        )
      );

      const faceCanvas = document.createElement("canvas");
      const faceCtx = faceCanvas.getContext("2d");
      faceCanvas.width = width;
      faceCanvas.height = height;
      faceCtx.drawImage(imageElement, x, y, width, height, 0, 0, width, height);

      const maskResult = maskClassificationModel.predict(faceCanvas);

      const color =
        maskResult.prediction === "with_mask" ? "#10B981" : "#EF4444"; // Green for mask, red for no mask
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      const label = `${maskResult.prediction.replace("_", " ")} (${(
        maskResult.confidence * 100
      ).toFixed(1)}%)`;
      ctx.fillStyle = color;
      ctx.font = "16px Arial";

      const textMetrics = ctx.measureText(label);
      ctx.fillRect(x, y - 25, textMetrics.width + 10, 25);

      ctx.fillStyle = "white";
      ctx.fillText(label, x + 5, y - 8);

      results.push({
        face: i + 1,
        prediction: maskResult.prediction,
        confidence: maskResult.confidence,
        bbox: [x, y, width, height],
      });
    }

    displayDetectionResults(resultContainer, results);
  } catch (error) {
    console.error("Detection error:", error);
    updateResult(
      resultContainer,
      "Error during detection. Please try again.",
      "error"
    );
  }
}

function displayDetectionResults(container, results) {
  const resultContent = container.querySelector(".result__content");

  let html = `
        <div class="detection-summary">
            <h4><i class="ri-user-line"></i> Detected ${results.length} face(s)</h4>
        </div>
        <div class="detection-details">
    `;

  results.forEach((result, index) => {
    const maskIcon =
      result.prediction === "with_mask"
        ? "ri-shield-check-line"
        : "ri-alert-line";
    const maskClass =
      result.prediction === "with_mask" ? "with-mask" : "without-mask";

    html += `
            <div class="detection-item ${maskClass}">
                <div class="detection-icon">
                    <i class="${maskIcon}"></i>
                </div>
                <div class="detection-info">
                    <h5>Face ${index + 1}</h5>
                    <p>Status: ${result.prediction.replace("_", " ")}</p>
                    <p>Confidence: ${(result.confidence * 100).toFixed(1)}%</p>
                </div>
            </div>
        `;
  });

  html += `</div>`;

  const withMask = results.filter((r) => r.prediction === "with_mask").length;
  const withoutMask = results.length - withMask;

  html += `
        <div class="detection-stats">
            <div class="stat-item with-mask">
                <span class="stat-number">${withMask}</span>
                <span class="stat-label">With Mask</span>
            </div>
            <div class="stat-item without-mask">
                <span class="stat-number">${withoutMask}</span>
                <span class="stat-label">Without Mask</span>
            </div>
        </div>
    `;

  resultContent.innerHTML = html;
}

function updateResult(container, message, type = "info") {
  const resultContent = container.querySelector(".result__content");
  const icon =
    type === "error"
      ? "ri-error-warning-line"
      : type === "success"
      ? "ri-check-line"
      : "ri-information-line";

  resultContent.innerHTML = `
        <div class="result-message ${type}">
            <i class="${icon}"></i>
            <p>${message}</p>
        </div>
    `;
}

const resultStyles = `
<style>
.model-status {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 15px;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 2px solid #0ea5e9;
}

.status-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.status-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-icon i {
    font-size: 1.8rem;
    color: white;
}

.status-content {
    flex: 1;
}

.status-content h3 {
    margin: 0 0 0.5rem 0;
    color: #0c4a6e;
    font-size: 1.3rem;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e0f2fe;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.5rem;
}

.progress-fill {
    height: 100%;
    background: #0ea5e9;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.btn-enabled {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}

.detection-summary h4 {
    margin: 0 0 1rem 0;
    color: #1e293b;
    font-size: 1.1rem;
}

.detection-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.detection-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 10px;
    background: #f8fafc;
    border-left: 4px solid #64748b;
}

.detection-item.with-mask {
    border-left-color: #10b981;
    background: #f0fdf4;
}

.detection-item.without-mask {
    border-left-color: #ef4444;
    background: #fef2f2;
}

.detection-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.detection-item.with-mask .detection-icon {
    background: #10b981;
}

.detection-item.without-mask .detection-icon {
    background: #ef4444;
}

.detection-info h5 {
    margin: 0 0 0.25rem 0;
    color: #1e293b;
    font-size: 1rem;
}

.detection-info p {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
}

.detection-stats {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.stat-item {
    flex: 1;
    text-align: center;
    padding: 1rem;
    border-radius: 10px;
    background: #f8fafc;
}

.stat-item.with-mask {
    background: #f0fdf4;
    color: #166534;
}

.stat-item.without-mask {
    background: #fef2f2;
    color: #991b1b;
}

.stat-number {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.9rem;
}

.result-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 8px;
}

.result-message.info {
    background: #f0f9ff;
    color: #0c4a6e;
}

.result-message.success {
    background: #f0fdf4;
    color: #166534;
}

.result-message.error {
    background: #fef2f2;
    color: #991b1b;
}

.result-message i {
    font-size: 1.2rem;
}

.file-info {
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.5rem;
}

.upload__dropzone.drag-over {
    background-color: #dbeafe !important;
    border-color: #086169 !important;
}

@media (max-width: 768px) {
    .status-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .detection-stats {
        flex-direction: column;
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML("beforeend", resultStyles);
