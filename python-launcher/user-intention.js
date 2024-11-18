(function createUnifiedInterface() {
  let isMinimized = true;
  const messages = [];

  // Create the main container
  const container = document.createElement("div");
  container.id = "unified-interface";
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
    width: "300px",
    transition: "all 0.3s ease",
    maxHeight: "80vh", // Prevent from becoming too tall
  });

  // Create header
  const header = document.createElement("div");
  Object.assign(header.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
    width: "100%",
  });

  const headerText = document.createElement("span");
  headerText.textContent = "Need Help?";
  Object.assign(headerText.style, {
    fontWeight: "bold",
    textAlign: "center",
  });

  const minimizeButton = document.createElement("button");
  minimizeButton.textContent = "+";
  Object.assign(minimizeButton.style, {
    border: "none",
    backgroundColor: "transparent",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    padding: "0 5px",
  });
  minimizeButton.addEventListener("click", toggleMinimize);

  header.appendChild(headerText);
  header.appendChild(minimizeButton);

  // Create main content container
  const contentContainer = document.createElement("div");
  Object.assign(contentContainer.style, {
    display: "none",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
  });

  // Create message history container
  const historyContainer = document.createElement("div");
  Object.assign(historyContainer.style, {
    maxHeight: "200px",
    overflowY: "auto",
    border: "1px solid #eee",
    borderRadius: "4px",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#f9f9f9",
    fontSize: "14px",
  });

  // Custom scrollbar styles for WebKit browsers
  historyContainer.style.cssText += `
      scrollbar-width: thin;
      scrollbar-color: #888 #f1f1f1;
      &::-webkit-scrollbar {
        width: 8px;
      }
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      &::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `;

  // Create input box
  const inputBox = document.createElement("input");
  inputBox.type = "text";
  inputBox.placeholder = "Type your message here...";
  Object.assign(inputBox.style, {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "calc(100% - 16px)",
    fontSize: "14px",
  });

  // Add enter key support
  inputBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const message = inputBox.value.trim();
      if (message) {
        storeAndDisplayMessage(message);
        inputBox.value = "";
      }
    }
  });

  // Create button container
  const buttonContainer = document.createElement("div");
  Object.assign(buttonContainer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  });

  // Create enter button
  const enterButton = document.createElement("button");
  enterButton.textContent = "Send Message";
  styleButton(enterButton);

  enterButton.addEventListener("click", () => {
    const message = inputBox.value.trim();
    if (message) {
      storeAndDisplayMessage(message);
      inputBox.value = "";
    }
  });

  // Create divider
  const divider = document.createElement("div");
  Object.assign(divider.style, {
    borderTop: "1px solid #ccc",
    margin: "5px 0",
  });

  // Create intention buttons
  const cantDoButton = document.createElement("button");
  cantDoButton.textContent = "I can't do that";
  styleButton(cantDoButton);
  cantDoButton.addEventListener("click", () => {
    storeAndDisplayMessage("I can't do that", "intention");
    dispatchIntentionEvent("cant_do");
    highlightButton(cantDoButton);
  });

  const dontUnderstandButton = document.createElement("button");
  dontUnderstandButton.textContent = "I don't understand";
  styleButton(dontUnderstandButton);
  dontUnderstandButton.addEventListener("click", () => {
    storeAndDisplayMessage("I don't understand", "intention");
    dispatchIntentionEvent("dont_understand");
    highlightButton(dontUnderstandButton);
  });

  // Assemble the interface
  buttonContainer.appendChild(enterButton);
  buttonContainer.appendChild(divider);
  buttonContainer.appendChild(cantDoButton);
  buttonContainer.appendChild(dontUnderstandButton);

  contentContainer.appendChild(historyContainer);
  contentContainer.appendChild(inputBox);
  contentContainer.appendChild(buttonContainer);

  container.appendChild(header);
  container.appendChild(contentContainer);

  if (!document.getElementById("unified-interface")) {
    document.body.appendChild(container);
  }

  // Helper Functions
  function toggleMinimize() {
    isMinimized = !isMinimized;
    if (isMinimized) {
      contentContainer.style.display = "none";
      minimizeButton.textContent = "+";
      container.style.width = "auto";
    } else {
      contentContainer.style.display = "flex";
      minimizeButton.textContent = "−";
      container.style.width = "300px";
      scrollToBottom();
    }
  }

  function styleButton(button) {
    Object.assign(button.style, {
      padding: "8px 15px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      backgroundColor: "#f0f0f0",
      cursor: "pointer",
      fontSize: "14px",
      transition: "all 0.2s ease",
      width: "100%",
      textAlign: "center",
    });

    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#e0e0e0";
    });
    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#f0f0f0";
    });
  }

  function highlightButton(button) {
    const originalColor = button.style.backgroundColor;
    button.style.backgroundColor = "#90EE90";
    setTimeout(() => {
      button.style.backgroundColor = originalColor;
    }, 5000);
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function storeAndDisplayMessage(message, type = "message") {
    const timestamp = new Date().toISOString();
    const messageObj = { message, timestamp, type };
    messages.push(messageObj);

    // Create message element
    const messageElement = document.createElement("div");
    Object.assign(messageElement.style, {
      marginBottom: "8px",
      padding: "4px 8px",
      borderRadius: "4px",
      backgroundColor: type === "intention" ? "#f0f0f0" : "white",
      borderLeft: `3px solid ${type === "intention" ? "#888" : "#007bff"}`,
    });

    const timeElement = document.createElement("span");
    timeElement.textContent = formatTimestamp(timestamp);
    Object.assign(timeElement.style, {
      color: "#666",
      fontSize: "12px",
      marginRight: "8px",
    });

    const textElement = document.createElement("span");
    textElement.textContent = message;

    messageElement.appendChild(timeElement);
    messageElement.appendChild(textElement);
    historyContainer.appendChild(messageElement);

    // Scroll to bottom
    scrollToBottom();

    // Dispatch event
    dispatchIntentionEvent(type, message);

    console.log("Stored Message:", messageObj);
  }

  function scrollToBottom() {
    historyContainer.scrollTop = historyContainer.scrollHeight;
  }

  function dispatchIntentionEvent(type, content = null) {
    const event = new CustomEvent("userIntention", {
      detail: {
        type: type,
        content: content,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      },
    });
    document.dispatchEvent(event);
  }
})();
