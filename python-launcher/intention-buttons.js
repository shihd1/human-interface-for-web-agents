// Create and inject the floating interface
(function createIntentionInterface() {
  // Create the main container
  const container = document.createElement("div");
  container.id = "intention-interface";
  Object.assign(container.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    zIndex: "10000",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  });

  // Create the header
  const header = document.createElement("div");
  header.textContent = "Having trouble?";
  Object.assign(header.style, {
    fontWeight: "bold",
    marginBottom: "5px",
    textAlign: "center",
  });

  // Create "I can't do that" button
  const cantDoButton = document.createElement("button");
  cantDoButton.textContent = "I can't do that";
  styleButton(cantDoButton);
  cantDoButton.addEventListener("click", () => {
    dispatchIntentionEvent("cant_do");
    highlightButton(cantDoButton);
  });

  // Create "I don't understand" button
  const dontUnderstandButton = document.createElement("button");
  dontUnderstandButton.textContent = "I don't understand";
  styleButton(dontUnderstandButton);
  dontUnderstandButton.addEventListener("click", () => {
    dispatchIntentionEvent("dont_understand");
    highlightButton(dontUnderstandButton);
  });

  // Append elements to container
  container.appendChild(header);
  container.appendChild(cantDoButton);
  container.appendChild(dontUnderstandButton);

  // Only inject if not already present
  if (!document.getElementById("intention-interface")) {
    document.body.appendChild(container);
  }

  // Helper function to style buttons
  function styleButton(button) {
    Object.assign(button.style, {
      padding: "8px 15px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      backgroundColor: "#f0f0f0",
      cursor: "pointer",
      transition: "all 0.2s ease",
      width: "150px",
    });

    // Hover effect
    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#e0e0e0";
    });
    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#f0f0f0";
    });
  }

  // Helper function to highlight button when clicked
  function highlightButton(button) {
    const originalColor = button.style.backgroundColor;
    button.style.backgroundColor = "#90EE90"; // Light green
    setTimeout(() => {
      button.style.backgroundColor = originalColor;
    }, 5000);
  }

  // Helper function to dispatch custom event
  function dispatchIntentionEvent(type) {
    const event = new CustomEvent("userIntention", {
      detail: {
        type: type,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      },
    });
    document.dispatchEvent(event);
  }
})();
