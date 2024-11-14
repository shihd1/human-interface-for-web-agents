// App.js
import React, { useState } from "react";
import IframeContent from "./IframeContent";
import ControlButtons from "./ControlButtons";

function App() {
  const [feedback, setFeedback] = useState("");

  // Update the feedback message
  const handleFeedback = (message) => {
    setFeedback(message);
  };

  // Log the interactions from the iframe
  const logInteraction = (interaction) => {
    console.log("Interaction Logged:", interaction);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "200px", marginRight: "10px" }}>
        <ControlButtons onFeedback={handleFeedback} />
        <div>
          <h4>Feedback:</h4>
          <p>{feedback}</p>
        </div>
      </div>
      <div style={{ flexGrow: 1 }}>
        <IframeContent onLogInteraction={logInteraction} />
      </div>
    </div>
  );
}

export default App;
