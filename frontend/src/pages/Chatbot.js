import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import "../styles/chatbot.css";
import BottomNav from "../components/BottomNav";
import botAvatar from "../assets/Bot avatar.jpeg";
import chatBg from "../assets/Chat bg.jpeg";
function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi, I’m MindCare Assistant. I’m here to listen and support you. How are you feeling today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const suggestions = [
    "I feel stressed",
    "I feel sad",
    "I need calming tips",
    "I feel anxious",
  ];

  const requestRef = useRef(null);
  const messageIdRef = useRef(1);
  const chatBoxRef = useRef(null);
  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState("checking");
  const [replyMode, setReplyMode] = useState("local");
  const [retryRequest, setRetryRequest] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    API.get("/chat/model", { signal: controller.signal, timeout: 8000 })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setModelStatus("ready");
          setReplyMode(data.generation?.engine === "llm" ? "configured" : "local");
        }
      })
      .catch(() => { if (!controller.signal.aborted) setModelStatus("offline"); });
    return () => {
      controller.abort();
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, []);

  const submitRequest = async (payload) => {
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setTyping(true);
    setError(null);
    setRetryRequest(null);
    try {
      const { data } = await API.post("/chat", payload, {
        signal: controller.signal,
        timeout: 32000,
      });
      if (requestRef.current !== controller || controller.signal.aborted) return;
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Invalid reply");
      // Only allow known in-app destinations from the API response.
      const allowedPaths = new Set(["/dashboard", "/mood", "/journal", "/counselor", "/appointments", "/assessment", "/calm-videos", "/music", "/meditation", "/breathing", "/mind-relax-games", "/emergency"]);
      const actions = Array.isArray(data.actions)
        ? data.actions.filter((action) => action && allowedPaths.has(action.path) && typeof action.label === "string").slice(0, 3)
        : [];
      const replyId = ++messageIdRef.current;
      setMessages((previous) => [...previous, {
        id: replyId,
        sender: "bot",
        text: data.reply,
        actions,
        urgent: data.urgent === true,
        notice: typeof data.notice === "string" ? data.notice : null,
      }]);
      setModelStatus("ready");
      if (data.engine === "llm") setReplyMode("llm");
      else if (data.engine === "local") setReplyMode("local");
    } catch (requestError) {
      if (controller.signal.aborted || requestRef.current !== controller) return;
      const status = requestError.response?.status;
      setError({
        status,
        text: status === 401
          ? "Your session has expired. Please sign in again."
          : status === 429
            ? "Please pause for a moment, then retry your message."
            : "I could not connect to the support assistant. Check that the backend is running, then retry. For urgent help, open Emergency support.",
      });
      if (status !== 401) setRetryRequest(payload);
      setModelStatus("offline");
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setTyping(false);
      }
    }
  };

  const sendMessage = (messageText = input) => {
    const text = messageText.trim();
    if (!text || text.length > 1000 || requestRef.current || retryRequest) return;
    const history = messages.slice(-6).map(({ sender, text }) => ({ sender, text }));
    const userId = ++messageIdRef.current;
    setMessages((previous) => [...previous, {
      id: userId,
      sender: "user",
      text,
    }]);
    setInput("");
    submitRequest({ message: text, history });
  };

  const clearChat = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setTyping(false);
    setError(null);
    setRetryRequest(null);
    setInput("");
    setMessages([{ id: ++messageIdRef.current, sender: "bot", text: "Hi, I'm MindCare Assistant. How are you feeling today?" }]);
  };

  useEffect(() => {
    const box = chatBoxRef.current;
    box?.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, typing, error]);

  return (
    <div
      className="mobile-container chatbot-page"
      style={{
        backgroundImage: `url(${chatBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="chatbot-header">
        <div className="bot-avatar">
          <img src={botAvatar} alt="MindCare AI" style={styles.headerAvatarImg} />
        </div>
        <div>
          <h2>MindCare Assistant</h2>
          <p>English support assistant</p>
        </div>
      </div>

      <div className="chatbot-tools">
        <span role="status" className={`chat-model-status ${modelStatus}`}>
          {modelStatus === "ready" ? replyMode === "llm" ? "AI assistant connected" : replyMode === "configured" ? "AI mode configured" : "Support assistant connected" : modelStatus === "checking" ? "Connecting..." : "Assistant unavailable"}
        </span>
        <button type="button" onClick={clearChat}>New chat</button>
      </div>

      <div className="chatbot-warning">
        Basic emotional support only, not medical diagnosis or emergency care.
        Conversations reset when you leave this page. In AI mode, messages and recent
        conversation context are sent to your configured AI provider (Groq or OpenAI). Avoid sharing identifying details.
        <Link to="/emergency">Emergency support</Link>
      </div>

      <div className="chat-suggestions">
        {suggestions.map((item) => (
          <button type="button" key={item} disabled={typing || Boolean(retryRequest)} onClick={() => sendMessage(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="premium-chat-box" ref={chatBoxRef} role="log" aria-label="Support conversation" aria-live="polite" aria-relevant="additions" aria-busy={typing}>
        {messages.map((message, index) => (
          <div
            key={message.id || `initial-${index}`}
            className={
              message.sender === "user"
                ? "message-row user-row"
                : "message-row bot-row"
            }
          >
            {message.sender === "bot" && (
              <div className="mini-avatar">
                <img src={botAvatar} alt="Bot" style={styles.miniAvatarImg} />
              </div>
            )}

            <div
              className={
                message.sender === "user"
                  ? "premium-message user-bubble"
                  : "premium-message bot-bubble"
              }
              data-urgent={message.urgent || undefined}
            >
              <div className="chat-reply-text">{message.text}</div>
              {message.notice && <p className="chat-reply-notice">{message.notice}</p>}
              {message.actions?.length > 0 && (
                <div className="chat-action-links">
                  {message.actions.map((action) => (
                    <Link key={action.path} to={action.path}>{action.label}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="message-row bot-row">
            <div className="mini-avatar">
              <img src={botAvatar} alt="Bot" style={styles.miniAvatarImg} />
            </div>
            <div className="typing-bubble" role="status" aria-label="Assistant is replying">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

      </div>

      {error && (
        <div className="chat-error" role="alert">
          <p>{error.text}</p>
          {retryRequest && <button type="button" disabled={typing} onClick={() => submitRequest(retryRequest)}>Retry message</button>}
          {error.status === 401 && <Link to="/login">Sign in</Link>}
          <Link to="/emergency">Emergency support</Link>
        </div>
      )}

      <form className="premium-input-area" onSubmit={(event) => {
        event.preventDefault();
        sendMessage();
      }}>
        <input
          type="text"
          aria-label="Your message"
          placeholder="Type how you feel..."
          value={input}
          maxLength={1000}
          disabled={Boolean(retryRequest)}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault();
          }}
        />
        <button type="submit" aria-label="Send message" disabled={typing || Boolean(retryRequest) || !input.trim()}>➤</button>
      </form>

      <BottomNav />
    </div>
  );
}

const styles = {
  headerAvatarImg: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
  },
  miniAvatarImg: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
  },
};

export default Chatbot;
