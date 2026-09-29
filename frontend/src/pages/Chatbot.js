import { useEffect, useRef, useState } from "react";
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
  const chatEndRef = useRef(null);

  const suggestions = [
    "I feel stressed",
    "I feel sad",
    "I need calming tips",
    "I feel anxious",
  ];

  const getBotReply = (userMessage) => {
    const msg = userMessage.toLowerCase();

    if (
      msg.includes("suicide") ||
      msg.includes("kill myself") ||
      msg.includes("unsafe") ||
      msg.includes("harm")
    ) {
      return "I’m really sorry you’re feeling this way. Please contact someone you trust immediately. If you are in immediate danger, use the Emergency section or contact local emergency support.";
    }

    if (msg.includes("sad") || msg.includes("depressed") || msg.includes("lonely")) {
      return "I’m sorry you’re feeling this way. Your feelings are valid. Try taking a slow breath, drink some water, and write down what made you feel this way. You can also track this mood or speak with a counselor.";
    }

    if (msg.includes("stress") || msg.includes("stressed")) {
      return "Stress can feel heavy. Try this: inhale for 4 seconds, hold for 4 seconds, exhale for 6 seconds. Repeat it 3 times. Would you like to open the calm music or mood tracker?";
    }

    if (msg.includes("anxious") || msg.includes("anxiety") || msg.includes("panic")) {
      return "Anxiety can be uncomfortable, but you are not alone. Try grounding yourself: name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.";
    }

    if (msg.includes("happy") || msg.includes("good") || msg.includes("better")) {
      return "That’s lovely to hear. Try saving this positive moment in your mood tracker so you can look back at your progress.";
    }

    if (msg.includes("calm") || msg.includes("relax")) {
      return "Let’s try a calming activity. Sit comfortably, relax your shoulders, and take 3 slow breaths. You can also open Calm Videos or Music from your dashboard.";
    }

    return "Thank you for sharing that with me. I’m here to support you. You can track your mood, take a self-assessment, try calming music, or book a counselor appointment.";
  };

  const sendMessage = (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = {
      sender: "user",
      text: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const botMessage = {
        sender: "bot",
        text: getBotReply(messageText),
      };

      setMessages((prev) => [...prev, botMessage]);
      setTyping(false);
    }, 900);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

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
          <h2>MindCare AI</h2>
          <p>Calm support assistant</p>
        </div>
      </div>

      <div className="chatbot-warning">
        This chatbot is for basic emotional support only. It is not a medical diagnosis tool.
      </div>

      <div className="chat-suggestions">
        {suggestions.map((item) => (
          <button key={item} onClick={() => sendMessage(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="premium-chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
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
            >
              {message.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="message-row bot-row">
            <div className="mini-avatar">
              <img src={botAvatar} alt="Bot" style={styles.miniAvatarImg} />
            </div>
            <div className="typing-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      <div className="premium-input-area">
        <input
          type="text"
          placeholder="Type how you feel..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button onClick={() => sendMessage()}>➤</button>
      </div>

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
