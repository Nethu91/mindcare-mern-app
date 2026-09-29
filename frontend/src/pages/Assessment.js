import React, { useState } from "react";
import API from "../api/axios";
import { PHQ9, GAD7, OPTIONS } from "../data/assessmentData";
import bgImage from "../assets/assessment-bg.jpeg";
import "../styles/assessment.css";

// Same wallpaper approach as the Mood Tracker
function Background() {
  return (
    <>
      <div
        className="assessment-bg-blur"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="assessment-bg-phone">
        <div
          className="assessment-bg-phone-image"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.15)), url(${bgImage})`,
          }}
        />
      </div>
    </>
  );
}

// Risk colours softened to sit with the pastel palette
const riskColor = (level) =>
  level === "Minimal"
    ? "#3fae86"
    : level === "Mild"
    ? "#e0a92f"
    : level === "Moderate"
    ? "#ee8442"
    : "#dd4a6c";

function Assessment() {
  const [assessmentType, setAssessmentType] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [started, setStarted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Start Assessment
  const startAssessment = (type) => {
    setAssessmentType(type);

    if (type === "PHQ-9") {
      setQuestions(PHQ9);
      setAnswers(new Array(PHQ9.length).fill(null));
    } else {
      setQuestions(GAD7);
      setAnswers(new Array(GAD7.length).fill(null));
    }

    setStarted(true);
    setCurrentQuestion(0);
    setResult(null);
    setError("");
  };

  // Select Answer
  const selectAnswer = (value) => {
    const temp = [...answers];
    temp[currentQuestion] = value;
    setAnswers(temp);
  };

  // Next Question
  const nextQuestion = () => {
    if (answers[currentQuestion] === null) {
      alert("Please select an answer.");
      return;
    }
    setCurrentQuestion((prev) => prev + 1);
  };

  // Previous Question
  const previousQuestion = () => {
    setCurrentQuestion((prev) => prev - 1);
  };

  // Submit Assessment
  const submitAssessment = async () => {
    if (answers[currentQuestion] === null) {
      alert("Please select an answer.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // backend route is mounted as "/api/assessments" (plural)
      const response = await API.post("/assessments", {
        assessmentType,
        answers,
      });

      setResult(response.data.assessment);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  // Restart Assessment
  const restartAssessment = () => {
    setAssessmentType("");
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setStarted(false);
    setResult(null);
    setError("");
  };

  // Progress
  const progress =
    questions.length > 0
      ? ((currentQuestion + 1) / questions.length) * 100
      : 0;

  // Assessment Selection Screen
  if (!started) {
    return (
      <div className="assessment-page">
        <Background />
        <div className="assessment-card">
          <h1>Mental Health Assessment</h1>

          <p>Choose the assessment you want to complete.</p>

          <div className="assessment-types">
            <div
              className="type-card"
              onClick={() => startAssessment("PHQ-9")}
            >
              <div className="type-icon">🧠</div>
              <h2>PHQ-9</h2>
              <p>Depression Screening</p>
              <span>9 Questions</span>
            </div>

            <div
              className="type-card"
              onClick={() => startAssessment("GAD-7")}
            >
              <div className="type-icon">💗</div>
              <h2>GAD-7</h2>
              <p>Anxiety Screening</p>
              <span>7 Questions</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (result) {
    return (
      <div className="assessment-page">
        <Background />
        <div className="assessment-card">
          <h1>Assessment Completed</h1>

          <h2>{assessmentType}</h2>

          <h3 className="result-score">Score : {result.score}</h3>

          <h2 style={{ color: riskColor(result.riskLevel) }}>
            {result.riskLevel}
          </h2>

          <p>{result.recommendation}</p>

          <button onClick={restartAssessment}>
            Take Another Assessment
          </button>
        </div>
      </div>
    );
  }

  // Question Screen
  return (
    <div className="assessment-page">
      <Background />

      <div className="assessment-card">
        <h2>{assessmentType}</h2>

        {loading && (
          <p className="assessment-status">Saving Assessment...</p>
        )}

        {error && <p className="assessment-error">{error}</p>}

        <p>
          Question {currentQuestion + 1} of {questions.length}
        </p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h3 className="question">
          {questions[currentQuestion].question}
        </h3>

        <div className="options">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              className={
                answers[currentQuestion] === option.value
                  ? "option selected"
                  : "option"
              }
              onClick={() => selectAnswer(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="buttons">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            Back
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button onClick={nextQuestion}>Next</button>
          ) : (
            <button onClick={submitAssessment}>Finish Assessment</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assessment;