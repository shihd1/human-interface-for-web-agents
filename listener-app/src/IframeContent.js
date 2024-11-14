// IframeContent.js
import React, { useEffect, useRef } from "react";

function IframeContent({ onLogInteraction }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    const injectScript = () => {
      const script = iframe.contentDocument.createElement("script");
      script.src = "/iframe-tracking.js"; // Path to the hosted script
      script.async = true;
      iframe.contentDocument.head.appendChild(script);
    };

    if (iframe) {
      iframe.addEventListener("load", injectScript);

      // Handle incoming messages from the iframe
      const handleIframeMessage = (event) => {
        if (event.data && event.data.type === "interaction") {
          onLogInteraction(event.data.payload);
        }
      };
      window.addEventListener("message", handleIframeMessage);

      // Clean up event listeners on unmount
      return () => {
        window.removeEventListener("message", handleIframeMessage);
        iframe.removeEventListener("load", injectScript);
      };
    }
  }, [onLogInteraction]);

  return (
    <iframe
      ref={iframeRef}
      src="https://example.com" // Replace with the actual URL
      title="Embedded Website"
      style={{ width: "100%", height: "80vh" }}
    />
  );
}

export default IframeContent;
