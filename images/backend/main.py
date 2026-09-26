import os
import urllib.request
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Download otomatis file model AI jika belum ada di server
MODEL_FILE = "FSRCNN_x2.pb"
MODEL_URL = "https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/FSRCNN_x2.pb"

if not os.path.exists(MODEL_FILE):
    urllib.request.urlretrieve(MODEL_URL, MODEL_FILE)

sr = cv2.dnn_superres.DnnSuperResImpl_create()
sr.readModel(MODEL_FILE)
sr.setModel("fsrcnn", 2)

@app.get("/")
def root():
    return {"status": "Online"}

@app.post("/upscale")
async def upscale_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar.")

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    enhanced_img = sr.upsample(img)
    _, encoded_img = cv2.imencode(".jpg", enhanced_img, [cv2.IMWRITE_JPEG_QUALITY, 95])

    return Response(content=encoded_img.tobytes(), media_type="image/jpeg")