import React, { useState } from "react";
import ReaderPage from "./pages/ReaderPage";

/**
 * Main App Component
 * 
 * Reads the Wikipedia article URL from the `src` query parameter
 * and renders the ReaderPage component to display the article.
 * 
 * @example
 * // URL: chrome-extension://[id]/reader.html?src=https://en.wikipedia.org/wiki/React
 */

const App: React.FC = () => {
  const [src] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("src");
  });

  if (!src) return <div>Loading...</div>;

  return <ReaderPage src={src} />;
};

export default App;
