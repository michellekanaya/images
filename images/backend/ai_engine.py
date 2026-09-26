import cv2
import numpy as np
import os

# Inisialisasi model Super Resolution
sr = cv2.dnn_superres.DnnSuperResImpl_create()

# Load model AI FSRCNN / EDSR (pilih salah satu file yang diunduh)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "FSRCNN_x2.pb")

if os.path.exists(MODEL_PATH):
    sr.readModel(MODEL_PATH)
    sr.setModel("fsrcnn", 2)  # Perbesar 2x lipat dengan AI
else:
    sr = None

def process_hd_enhancement(image_bytes: bytes) -> bytes:
    """
    Menajamkan gambar menggunakan Model Deep Learning Super-Resolution Lokal (100% Gratis & Offline).
    """
    try:
        # 1. Convert bytes ke NumPy Array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 2. Jika model AI tersedia, gunakan AI Super-Resolution
        if sr is not None:
            enhanced_img = sr.upsample(img)
        else:
            # Fallback jika file model belum diunduh
            enhanced_img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

        # 3. Convert kembali ke byte JPEG
        _, encoded_img = cv2.imencode(".jpg", enhanced_img, [cv2.IMWRITE_JPEG_QUALITY, 95])
        return encoded_img.tobytes()

    except Exception as e:
        print(f"Error AI Enhancement: {e}")
        raise e