
(function createIntentionInterface() {
  let isMinimized = false;
  const messages = [];
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
    transition: "all 0.3s ease",
  });

  const header = document.createElement("div");
  Object.assign(header.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  });

  const headerText = document.createElement("span");
  headerText.textContent = "Having trouble?";
  Object.assign(headerText.style, {
    fontWeight: "bold",
    textAlign: "center",
  });

  const minimizeButton = document.createElement("button");
  minimizeButton.textContent = "−";
  Object.assign(minimizeButton.style, {
    border: "none",
    backgroundColor: "transparent",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  });
  minimizeButton.addEventListener("click", toggleMinimize);

  header.appendChild(headerText);
  header.appendChild(minimizeButton);
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

  const enterButton = document.createElement("button");
  enterButton.textContent = "Enter";
  Object.assign(enterButton.style, {
    padding: "8px 15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    fontSize: "14px",
    alignSelf: "flex-end",
    marginTop: "5px",
    transition: "all 0.2s ease",
  });

  enterButton.addEventListener("click", () => {
    const message = inputBox.value.trim();
    if (message) {
      storeMessage(message);
      dispatchIntentionEvent(message);
      inputBox.value = "";
    }
  });

  enterButton.addEventListener("mouseover", () => {
    enterButton.style.backgroundColor = "#e0e0e0";
  });
  enterButton.addEventListener("mouseout", () => {
    enterButton.style.backgroundColor = "#f0f0f0";
  });

  container.appendChild(header);
  container.appendChild(inputBox);
  container.appendChild(enterButton);
  if (!document.getElementById("intention-interface")) {
    document.body.appendChild(container);
  }

  function toggleMinimize() {
    isMinimized = !isMinimized;
    if (isMinimized) {
      inputBox.style.display = "none";
      enterButton.style.display = "none";
      minimizeButton.textContent = "+";
    } else {
      inputBox.style.display = "block";
      enterButton.style.display = "block";
      minimizeButton.textContent = "−";
    }
  }

  function storeMessage(message) {
    const timestamp = new Date().toISOString();
    messages.push({ message, timestamp });
    console.log("Stored Message:", { message, timestamp });
  }

  //unsure hown to use
  function dispatchIntentionEvent(message) {
    const event = new CustomEvent("userIntention", {
      detail: {
        type: "message",
        content: message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      },
    });
    document.dispatchEvent(event);
  }
})();
