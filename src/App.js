import React, { useState, useEffect } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { AiOutlineDelete } from "react-icons/ai";
import "./App.css";
const STORAGE_PREFIX = "curateit_";

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [shortcuts, setShortcuts] = useState([]);
  const [displayDiv, setDisplayDiv] = useState(null);

  const handleLinkBtnClick = () => {
    setDisplayDiv("saveLinks");
  };

  const handleTextBtnClick = () => {
    setDisplayDiv("saveText");
  };

  const saveShortcut = () => {
    if (text && url) {
      window.chrome.storage.local.set({ [STORAGE_PREFIX + text]: url }, () => {
        setText("");
        setUrl("");
        fetchShortcuts();
      });
    }
  };

  const editShortcut = (shortcut) => {
    setText(shortcut.text);
    setUrl(shortcut.url);
  };

  const deleteShortcut = (shortcut) => {
    window.chrome.storage.local.remove(
      STORAGE_PREFIX + shortcut.text,
      fetchShortcuts
    );
  };

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
          Curateit Search
          <span>Build your personal corner on the web</span>
        </h1>
        <div className="btn-wrapper">
          <button className="linkBtn" onClick={handleLinkBtnClick}>
            Save Links
          </button>
          <button className="textBtn" onClick={handleTextBtnClick}>
            Save Texts
          </button>
        </div>
        {displayDiv === "saveLinks" && (
          <div className="saveLinks">
            <form name="newform">
              <label for="newitem">Save your Links</label>
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
            <ul>
              <li className="">
                <div className="labelWrapper">
                  <span className="label shortcutText"> "shortcut.text" </span>
                  <span className="label shortcutUrl"> "shortcut.url" </span>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    aria-label="Edit"
                    title="Edit"
                    className="btn-picto"
                    onClick={() => editShortcut()}
                  >
                    <AiOutlineEdit className="edit-btn" size={32} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    title="Delete"
                    className="btn-picto"
                    onClick={() => deleteShortcut()}
                  >
                    <AiOutlineDelete className="delete-btn" size={32} />
                  </button>
                </div>
              </li>

              <li className="">
                <div className="labelWrapper">
                  <span className="label shortcutText"> "shortcut.text" </span>
                  <span className="label shortcutUrl"> "shortcut.url" </span>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    aria-label="Edit"
                    title="Edit"
                    className="btn-picto"
                    onClick={() => editShortcut()}
                  >
                    <AiOutlineEdit className="edit-btn" size={32} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    title="Delete"
                    className="btn-picto"
                    onClick={() => deleteShortcut()}
                  >
                    <AiOutlineDelete className="delete-btn" size={32} />
                  </button>
                </div>
              </li>

              {shortcuts.map((shortcut, index) => (
                <li className="">
                  <div className="labelWrapper">
                    <span className="label shortcutText">
                      {" "}
                      {shortcut.text}{" "}
                    </span>
                    <span className="label shortcutUrl"> {shortcut.url} </span>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      className="btn-picto"
                      onClick={() => editShortcut(shortcut)}
                    >
                      <AiOutlineEdit className="edit-btn" size={32} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      title="Delete"
                      className="btn-picto"
                      onClick={() => deleteShortcut(shortcut)}
                    >
                      <AiOutlineDelete className="delete-btn" size={32} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {displayDiv === "saveText" && (
          <div className="saveText">
            <form name="newform">
              <label for="newitem">Save your Texts</label>
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
            <ul>
              <li className="">
                <div className="labelWrapper">
                  <span className="label shortcutText"> "shortcut.text" </span>
                  <span className="label shortcutUrl"> "shortcut.url" </span>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    aria-label="Edit"
                    title="Edit"
                    className="btn-picto"
                    onClick={() => editShortcut()}
                  >
                    <AiOutlineEdit className="edit-btn" size={32} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    title="Delete"
                    className="btn-picto"
                    onClick={() => deleteShortcut()}
                  >
                    <AiOutlineDelete className="delete-btn" size={32} />
                  </button>
                </div>
              </li>

              <li className="">
                <div className="labelWrapper">
                  <span className="label shortcutText"> "shortcut.text" </span>
                  <span className="label shortcutUrl"> "shortcut.url" </span>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    aria-label="Edit"
                    title="Edit"
                    className="btn-picto"
                    onClick={() => editShortcut()}
                  >
                    <AiOutlineEdit className="edit-btn" size={32} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    title="Delete"
                    className="btn-picto"
                    onClick={() => deleteShortcut()}
                  >
                    <AiOutlineDelete className="delete-btn" size={32} />
                  </button>
                </div>
              </li>

              {shortcuts.map((shortcut, index) => (
                <li className="">
                  <div className="labelWrapper">
                    <span className="label shortcutText">
                      {" "}
                      {shortcut.text}{" "}
                    </span>
                    <span className="label shortcutUrl"> {shortcut.url} </span>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      className="btn-picto"
                      onClick={() => editShortcut(shortcut)}
                    >
                      <AiOutlineEdit className="edit-btn" size={32} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      title="Delete"
                      className="btn-picto"
                      onClick={() => deleteShortcut(shortcut)}
                    >
                      <AiOutlineDelete className="delete-btn" size={32} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
