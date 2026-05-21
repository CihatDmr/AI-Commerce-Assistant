import { useState } from "react";
import "./App.css";
import BusinessPanel from "./BusinessPanel";

function ChatPage() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Merhaba 👋 Ben yapay zekâ destekli müşteri temsilcisiyim. Size nasıl yardımcı olabilirim?"
    }
  ]);

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);

    const current = input;
    setInput("");

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: current
        })
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Backend bağlantısı yok."
        }
      ]);
    }
  };

  return (
    <div className="page">
      <div className="phone">
        <div className="header">
          <div className="avatar">AI</div>

          <div>
            <h3>WhatsAI</h3>
            <p>Çevrimiçi</p>
          </div>
        </div>

        <div className="chat">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.sender === "user" ? "message user" : "message bot"}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="bottom">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mesaj yaz..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button onClick={sendMessage}>Gönder</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  if (window.location.pathname === "/business") {
    return <BusinessPanel />;
  }

  return <ChatPage />;
}

export default App;