import React from "react";

const QuizResult = (props) => {
  return (
    <div className="score-section">
      <h2>Completed!</h2>
      <h4>
        Total Score {props.score}/{5 * props.totalQues}
      </h4>
      <h4>
        Correct Questions {props.CorrectAns} out of {props.totalQues}
      </h4>
      <button onClick={props.handlePlayAgain}>Play Again</button>
    </div>
  );
};

export default QuizResult;
