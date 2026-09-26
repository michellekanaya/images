// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const controlPanel = document.getElementById('controlPanel');
const fileName = document.getElementById('fileName');
const originalSize = document.getElementById('originalSize');
const compressBtn = document.getElementById('compressBtn');
const enhanceBtn = document.getElementById('enhanceBtn');
const statusMessage = document.getElementById('statusMessage');
const previewArea = document.getElementById('previewArea');
const originalImg = document.getElementById('originalImg');
const resultImg = document.getElementById('resultImg');
const resultSize = document.getElementById('resultSize');
const downloadBtn = document.getElementById('downloadBtn');
const resultLabel = document.getElementById('resultLabel');

let currentFile = null;

// Event Listener Klik Drop Zone
dropZone.addEventListener('click', () => {
  fileInput.click();
});

// Event Listener Input File
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0]);
  }
});

// Event Listeners Drag and Drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('border-indigo-400', 'bg-slate-700/50');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('border-indigo-400', 'bg-slate-700/50');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('border-indigo-400', 'bg-slate-700/50');
  
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleFileSelect(e.dataTransfer.files[0]);
  }
});

// Helper Preset Tombol Ukuran
window.setTarget = function(sizeMB) {
  document.getElementById('targetSizeInput').value = sizeMB;
};

// Fungsi Memilih File
function handleFileSelect(file) {
  if (!file || !file.type.startsWith('image/')) {
    alert("Harap pilih berkas foto yang valid (JPG, PNG, WebP)!");
    return;
  }

  currentFile = file;
  fileName.textContent = file.name;
  originalSize.textContent = (file.size / 1024 / 1024).toFixed(2) + " MB";

  originalImg.src = URL.createObjectURL(file);
  controlPanel.classList.remove('hidden');
  previewArea.classList.add('hidden');
  statusMessage.classList.add('hidden');
}

// 1. Fitur Kompresi & Format (Client-Side)
compressBtn.addEventListener('click', async () => {
  if (!currentFile) return;

  const targetMB = parseFloat(document.getElementById('targetSizeInput').value) || 2.0;
  const targetFormat = document.getElementById('formatSelect').value;

  showStatus("Sedang mengompresi gambar di browser...", "bg-blue-900/50", "text-blue-200");

  const options = {
    maxSizeMB: targetMB,
    fileType: targetFormat,
    useWebWorker: true
  };

  try {
    // Menggunakan library global (window.imageCompression)
    const compressedFile = await imageCompression(currentFile, options);
    const resultUrl = URL.createObjectURL(compressedFile);

    resultImg.src = resultUrl;
    downloadBtn.href = resultUrl;
    downloadBtn.download = `compressed_${currentFile.name.split('.')[0]}.${targetFormat.split('/')[1]}`;
    
    resultLabel.textContent = "Hasil Kompresi & Konversi";
    resultSize.textContent = `Ukuran Akhir: ${(compressedFile.size / 1024).toFixed(0)} KB (${(compressedFile.size / 1024 / 1024).toFixed(2)} MB)`;

    previewArea.classList.remove('hidden');
    showStatus("Kompresi & Konversi Berhasil!", "bg-emerald-900/50", "text-emerald-200");
  } catch (error) {
    console.error(error);
    showStatus("Gagal mengompresi gambar.", "bg-rose-900/50", "text-rose-200");
  }
});

// 2. Fitur AI Enhancement (Server-Side / Python API)
enhanceBtn.addEventListener('click', async () => {
  if (!currentFile) return;

  showStatus("Sedang memproses penajaman AI di server Python...", "bg-indigo-900/50", "text-indigo-200");

  const formData = new FormData();
  formData.append('file', currentFile);

  try {
    const response = await fetch('http://127.0.0.1:8000/api/enhance', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error("Gagal memproses gambar dari server");

    const blob = await response.blob();
    const resultUrl = URL.createObjectURL(blob);

    resultImg.src = resultUrl;
    downloadBtn.href = resultUrl;
    downloadBtn.download = `hd_enhanced_${currentFile.name}`;

    resultLabel.textContent = "Hasil Peningkatan Resolusi (HD)";
    resultSize.textContent = `Ukuran Akhir: ${(blob.size / 1024 / 1024).toFixed(2)} MB`;

    previewArea.classList.remove('hidden');
    showStatus("Peningkatan Resolusi Berhasil!", "bg-emerald-900/50", "text-emerald-200");
  } catch (error) {
    console.error(error);
    showStatus("Pastikan Backend Python (FastAPI) sudah berjalan di http://127.0.0.1:8000", "bg-rose-900/50", "text-rose-200");
  }
});

function showStatus(msg, bgColor, textColor) {
  statusMessage.className = `p-4 rounded-lg text-center font-medium ${bgColor} ${textColor}`;
  statusMessage.textContent = msg;
  statusMessage.classList.remove('hidden');
}