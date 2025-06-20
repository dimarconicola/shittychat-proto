import { useEffect, useRef, useState } from "react";

// Helper to get the correct WebSocket URL for Codespaces or local
function getWebSocketUrl() {
  // If running in Codespaces, use the public URL
  const host = window.location.host;
  if (host.includes("github.dev") || host.includes("app.github.dev")) {
    // Replace frontend port (5173) with backend port (8000)
    return `wss://${host.replace(/-5173/, "-8000")}/ws`;
  }
  // Fallback to localhost
  return "wss://localhost:8000/ws";
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
            wsRef.current.send("speech");
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
