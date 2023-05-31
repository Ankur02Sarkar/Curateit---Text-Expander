import React from "react";
import { useState } from "react";
import "./quizstyle.css";
// import questions from "./quizData";
import QuizResult from "./QuizResult";
const Quiz = (props) => {
  const questions = props.questions;
  //useState Hook
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAns, setCorrectAns] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleNextOption = () => {
    setClicked(false);
    setSelectedAnswer(null);
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowResult(true);
    }
  };

  const handleAnswerOption = (isCorrect, index) => {
    if (isCorrect) {
      setScore(score + 5);
      setCorrectAns(correctAns + 1);
    }
    setSelectedAnswer(index);
    setClicked(true);
  };

  const handlePlayAgain = () => {
    setSelectedAnswer(null);
    setCurrentQuestion(0);
    setScore(0);
    setCorrectAns(0);
    setShowResult(false);
  };

  return (
    <>
      <div className="app">
        {showResult ? (
          <QuizResult
            score={score}
            CorrectAns={correctAns}
            totalQues={questions.length}
            handlePlayAgain={handlePlayAgain}
          />
        ) : (
          <>
            {console.log("quizData in quiz comp : ", questions)}
            <div className="question-section">
              <h5>Score : {score}</h5>
              <div className="question-count">
                <span>
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <div className="question-text">
                {questions[currentQuestion].question}
              </div>
            </div>
            <div className="answer-section">
              {questions[currentQuestion].answerOptions.map((ans, i) => {
                return (
                  <button
                    className={`button ${
                      clicked && i === selectedAnswer
                        ? ans.isCorrect
                          ? "correct"
                          : "wrong"
                        : "button"
                    }`}
                    disabled={clicked}
                    key={i}
                    onClick={() => handleAnswerOption(ans.isCorrect, i)}
                  >
                    {ans.answerText}
                  </button>
                );
              })}
              <div className="actions">
                <button onClick={handlePlayAgain}>Quit</button>
                <button disabled={!clicked} onClick={handleNextOption}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Quiz;
