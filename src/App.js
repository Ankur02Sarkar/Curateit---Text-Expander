import React, { useState } from "react";

const STORAGE_PREFIX = "custom_search_shortcut_";

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const saveShortcut = () => {
    if (text && url) {
      // localStorage.setItem(STORAGE_PREFIX + text, url);
      // setText("");
      // setUrl("");
      window.chrome.storage.local.set({ [STORAGE_PREFIX + text]: url }, () => {
        setText("");
        setUrl("");
      });
    }
  };

  return (
    <div>
      <h1>Custom Search Bar Shortcut</h1>
      <p>Type "c:" in the search bar and hit space and enter shortcut</p>
      <div>
        <input
          placeholder="Text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={saveShortcut}>Save</button>
      </div>
    </div>
  );
}

export default App;
