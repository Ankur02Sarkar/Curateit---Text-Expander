import React, { useState, useEffect } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { AiOutlineDelete } from "react-icons/ai";
import "./App.css";
const STORAGE_PREFIX = "custom_search_shortcut_";

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [shortcuts, setShortcuts] = useState([]);

  const saveShortcut = () => {
    if (text && url) {
      window.chrome.storage.local.set({ [STORAGE_PREFIX + text]: url }, () => {
        setText("");
        setUrl("");
      });
    }
  };

  // const fetchShortcuts = () => {
  //   window.chrome.storage.local.get(null, (items) => {
  //     const savedShortcuts = Object.entries(items)
  //       .filter(([key]) => key.startsWith(STORAGE_PREFIX))
  //       .map(([key, value]) => ({
  //         text: key.replace(STORAGE_PREFIX, ""),
  //         url: value,
  //       }));
  //     setShortcuts(savedShortcuts);
  //   });
  // };

  const fetchShortcuts = () => {
    if (window.chrome && window.chrome.storage) {
      window.chrome.storage.local.get(null, (items) => {
        const savedShortcuts = Object.entries(items)
          .filter(([key]) => key.startsWith(STORAGE_PREFIX))
          .map(([key, value]) => ({
            text: key.replace(STORAGE_PREFIX, ""),
            url: value,
          }));
        setShortcuts(savedShortcuts);
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  useEffect(() => {
    fetchShortcuts();
  }, []);

  return (
    <>
      <main id="todolist">
        <h1>
          Todo List
          <span>Get things done, one item at a time.</span>
        </h1>
        <ul>
          {shortcuts.map((shortcut, index) => (
            <li className="">
              <div className="labelWrapper">
                <span className="label"> {shortcut.text} </span>
                <span className="label"> {shortcut.url} </span>
              </div>
              <div className="actions">
                <button
                  type="button"
                  aria-label="Done"
                  title="Done"
                  className="btn-picto"
                >
                  <AiOutlineEdit size={27} />
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  title="Delete"
                  className="btn-picto"
                >
                  <AiOutlineDelete size={27} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <form name="newform">
          {/* <label for="newitem">Add to the list</label> */}
          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            placeholder="Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={saveShortcut}>Save</button>
        </form>
      </main>
    </>
  );
}

export default App;
