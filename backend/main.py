from fastapi import FastAPI, WebSocket
from faster_whisper import WhisperModel
import asyncio, struct

app = FastAPI()

model = WhisperModel("../shared_models/ggml-tiny.bin", device="cpu")

@app.get("/")
async def root():
    return {"status": "alive"}

@app.websocket("/ws")
async def socket_endpoint(ws: WebSocket):
    await ws.accept()
    buffer = b""
    while True:
        data = await ws.receive_text()
        if data == "speech":
            # In real build you receive PCM bytes; here we use dummy place-holder
            continue
        if data == "pcm":  # TODO: wire actual bytes
            # For now, just log and continue to avoid crashing
            print("Received 'pcm' (no bytes attached)")
            continue
        if len(buffer) > 16000 * 2 * 1:  # 1 s @16 kHz 16-bit
            segments, _ = model.transcribe(buffer, language="en", beam_size=1)
            for seg in segments:
                await ws.send_json({"type": "stt", "text": seg.text})
            buffer = b""
