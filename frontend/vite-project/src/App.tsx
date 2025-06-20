import { useEffect, useRef, useState } from "react";

// Helper to get the correct WebSocket URL for Codespaces or local
function getWebSocketUrl() {
  // Always use the Codespaces public URL if available
  const host = window.location.host;
  if (host.includes("github.dev") || host.includes("app.github.dev")) {
    // Use the full Codespaces backend URL
    return "wss://supreme-engine-pjrwjr9gwj637vp6-8000.app.github.dev/ws";
  }
  // Fallback to localhost
  return "wss://localhost:8000/ws";
}

// Helper: Convert Float32Array [-1,1] to Int16Array (little-endian)
function floatTo16BitPCM(float32: Float32Array): ArrayBuffer {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    let s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16.buffer;
}

export default function App() {
  const wsRef = useRef<WebSocket | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket(getWebSocketUrl());
    wsRef.current = ws;
    ws.onmessage = (ev) => setMessages((msgs) => [...msgs, ev.data]);
    ws.onerror = () => setMessages((msgs) => [...msgs, "WebSocket error"]);
    ws.onclose = () => setMessages((msgs) => [...msgs, "WebSocket closed"]);

    // Voice Activity Detection
    const initVAD = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new AudioContext({ sampleRate: 16000 });
        await ctx.audioWorklet.addModule("/src/audio/worklet-processor.ts");
        const src = ctx.createMediaStreamSource(stream);
        const node = new AudioWorkletNode(ctx, "vad-processor");
        node.port.onmessage = (ev) => {
          if (ev.data && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // If ev.data.samples is a Float32Array, serialize and send
            if (ev.data.samples && ev.data.samples instanceof Float32Array) {
              const buf = floatTo16BitPCM(ev.data.samples);
              wsRef.current.send(buf);
            } else {
              wsRef.current.send("speech"); // fallback
            }
          }
        };
        src.connect(node);
      } catch (err) {
        setMessages((msgs) => [...msgs, "Mic error: " + err]);
      }
    };
    initVAD();

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && input) {
      wsRef.current.send(input);
      setInput("");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl mb-4">WebSocket Echo & VAD Test</h1>
      <div className="mb-2">
        <input
          className="border p-2 mr-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={sendMessage}>
          Send
        </button>
      </div>
      <div className="bg-gray-100 p-2 rounded h-40 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <div className="mt-2 text-gray-500 text-sm">Speak into your mic to send "speech" via VAD.</div>
    </div>
  );
}
