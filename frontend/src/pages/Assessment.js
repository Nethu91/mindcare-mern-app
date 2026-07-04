import React, { useState } from "react";

function Assessment() {
  const questions = [
    {
      id: 1,
      question: "How often do you feel stressed or overwhelmed?",
      options: [
        { text: "Never", score: 0 },
        { text: "Sometimes", score: 1 },
        { text: "Often", score: 2 },
        { text: "Almost always", score: 3 },
      ],
    },
    {
      id: 2,
      question: "How well did you sleep recently?",
      options: [
        { text: "Very well", score: 0 },
        { text: "Okay", score: 1 },
        { text: "Not good", score: 2 },
        { text: "Very poor", score: 3 },
      ],
    },
    {
      id: 3,
      question: "How often do you feel anxious?",
      options: [
        { text: "Never", score: 0 },
        { text: "Rarely", score: 1 },
        { text: "Frequently", score: 2 },
        { text: "Most of the time", score: 3 },
      ],
    },
    {
      id: 4,
      question: "How is your energy level these days?",
      options: [
        { text: "High", score: 0 },
        { text: "Normal", score: 1 },
        { text: "Low", score: 2 },
        { text: "Very low", score: 3 },
      ],
    },
    {
      id: 5,
      question: "How often do you lose interest in daily activities?",
      options: [
        { text: "Never", score: 0 },
        { text: "Sometimes", score: 1 },
        { text: "Often", score: 2 },
        { text: "Almost always", score: 3 },
      ],
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (option) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: option,
    });
  };

  const nextQuestion = () => {
    if (!answers[questions[currentQuestion].id]) {
      alert("Please select an answer before continuing");
      return;
    }

    if (currentQuestion === questions.length - 1) {
      setShowResult(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const restartAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const totalScore = Object.values(answers).reduce(
    (sum, answer) => sum + answer.score,
    0
  );

  const getResult = () => {
    if (totalScore <= 4) {
      return {
        level: "Low Stress Level 🌿",
        color: "#70D6A4",
        message:
          "Your mental wellness looks healthy. Keep maintaining good habits.",
        advice:
          "Continue sleep routine, exercise, and relaxation practices.",
      };
    } else if (totalScore <= 9) {
      return {
        level: "Moderate Stress Level 🌤️",
        color: "#FFD166",
        message:
          "You may be experiencing some stress. Take care of yourself.",
        advice:
          "Try meditation, breathing exercises, and talk to someone you trust.",
      };
    } else {
      return {
        level: "High Stress Level 🧡",
        color: "#FF8FAB",
        message:
          "You may be under high stress. Please take care of your mental health.",
        advice:
          "Consider talking to a counselor or mental health professional.",
      };
    }
  };

  const result = getResult();
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const selectedAnswer = answers[questions[currentQuestion]?.id];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Mental Health Assessment</h1>
        <p style={styles.subtitle}>
          Take a quick self-check for your wellbeing
        </p>

        {!showResult ? (
          <div style={styles.card}>
            <div style={styles.progress}>
              Question {currentQuestion + 1} / {questions.length}
            </div>

            <div style={styles.bar}>
              <div style={{ ...styles.fill, width: `${progress}%` }} />
            </div>

            <h2 style={styles.question}>
              {questions[currentQuestion].question}
            </h2>

            <div style={styles.options}>
              {questions[currentQuestion].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  style={{
                    ...styles.option,
                    background:
                      selectedAnswer?.text === opt.text
                        ? "#E9D8FD"
                        : "white",
                    border:
                      selectedAnswer?.text === opt.text
                        ? "2px solid #9B5DE5"
                        : "1px solid #ddd",
                  }}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            <div style={styles.buttons}>
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                style={styles.secondaryBtn}
              >
                Back
              </button>

              <button onClick={nextQuestion} style={styles.primaryBtn}>
                {currentQuestion === questions.length - 1
                  ? "Finish"
                  : "Next"}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.resultCard}>
            <h2>{result.level}</h2>
            <p style={{ fontSize: "18px" }}>{result.message}</p>
            <p><b>Advice:</b> {result.advice}</p>

            <button onClick={restartAssessment} style={styles.primaryBtn}>
              Retake Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#F7FBFF",
    fontFamily: "Arial",
  },
  container: {
    maxWidth: "700px",
    margin: "0 auto",
  },
  title: {
    fontSize: "28px",
    marginBottom: "5px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "20px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  progress: {
    marginBottom: "10px",
    fontWeight: "bold",
  },
  bar: {
    height: "10px",
    background: "#eee",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  fill: {
    height: "100%",
    background: "#9B5DE5",
    borderRadius: "10px",
  },
  question: {
    marginBottom: "20px",
  },
  options: {
    display: "grid",
    gap: "10px",
    marginBottom: "20px",
  },
  option: {
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
  },
  primaryBtn: {
    padding: "12px 20px",
    background: "#9B5DE5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 20px",
    background: "#ddd",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  resultCard: {
    background: "white",
    padding: "25px",
    borderRadius: "20px",
    textAlign: "center",
  },
};

export default Assessment;