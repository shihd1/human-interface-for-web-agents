// ControlButtons.js
import React from "react";

function ControlButtons({ onFeedback }) {
  return (
    <div>
      <button onClick={() => onFeedback("I can’t do that")}>
        I can’t do that
      </button>
      <button onClick={() => onFeedback("I don’t understand")}>
        I don’t understand
      </button>
    </div>
  );
}

export default ControlButtons;
