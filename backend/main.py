from fastapi import FastAPI, WebSocket
from faster_whisper import WhisperModel
import asyncio
import os
import numpy as np

app = FastAPI()

# Use the snapshot directory containing model files
MODEL_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "shared_models",
    "models--Systran--faster-whisper-tiny",
    "snapshots",
    "d90ca5fe260221311c53c58e660288d3deb8d356",
)
model = WhisperModel(MODEL_DIR, device="cpu")

@app.get("/")
async def root():
    return {"status": "alive"}

@app.websocket("/ws")
async def socket_endpoint(ws: WebSocket):
    await ws.accept()
    buffer = b""
    while True:
        message = await ws.receive()
        if message["type"] == "websocket.receive":
            if "bytes" in message and message["bytes"] is not None:
                buffer += message["bytes"]
            elif "text" in message and message["text"] is not None:
                if message["text"] == "speech":
                    continue
                if message["text"] == "pcm":
                    print("Received 'pcm' (no bytes attached)")
                    continue
        if len(buffer) > 16000 * 2 * 1:  # 1 s @16 kHz 16-bit
            # Convert buffer to float32 PCM using numpy
            audio = np.frombuffer(buffer, dtype=np.int16).astype(np.float32) / 32768.0
            segments, _ = model.transcribe(audio, language="en", beam_size=1)
            for seg in segments:
                await ws.send_json({"type": "stt", "text": seg.text})
            buffer = b""
