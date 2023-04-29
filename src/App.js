import React, { useState, useEffect } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { AiOutlineDelete } from "react-icons/ai";
import "./App.css";
const STORAGE_LINKS_PREFIX = "curateit_links_";
const STORAGE_TEXT_PREFIX = "curateit_text_";

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [shortcuts, setShortcuts] = useState([]);
  const [displayDiv, setDisplayDiv] = useState(null);
  const [query, setQuery] = useState("");
  const [expansions, setExpansions] = useState([]);
  const [filteredExpansions, setFilteredExpansions] = useState([]);
  const [newShortcut, setNewShortcut] = useState("");
  const [newExpansion, setNewExpansion] = useState("");
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    fetchExpansions();
  }, []);

  useEffect(() => {
    filterExpansions();
  }, [query, expansions]);

  const fetchExpansions = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get(null, (items) => {
        const exps = Object.entries(items).filter(([key]) =>
          key.startsWith(STORAGE_TEXT_PREFIX)
        );
        setExpansions(exps);
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const filterExpansions = () => {
    const filtered = expansions.filter(([key, value]) => {
      const formattedKey = key.replace(STORAGE_TEXT_PREFIX, "");
      return (
        formattedKey.toLowerCase().includes(query.toLowerCase()) ||
        value.toLowerCase().includes(query.toLowerCase())
      );
    });
    setFilteredExpansions(filtered);
  };

  const addExpansion = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      if (newShortcut && newExpansion) {
        const formattedShortcut = newShortcut.startsWith(":")
          ? newShortcut
          : `:${newShortcut}`;

        if (editingKey) {
          window.chrome.storage.local.remove(editingKey, () => {
            window.chrome.storage.local.set(
              { [STORAGE_TEXT_PREFIX + formattedShortcut]: newExpansion },
              () => {
                setNewShortcut("");
                setNewExpansion("");
                setEditingKey(null);
                fetchExpansions();
              }
            );
          });
        } else {
          window.chrome.storage.local.set(
            { [STORAGE_TEXT_PREFIX + formattedShortcut]: newExpansion },
            () => {
              setNewShortcut("");
              setNewExpansion("");
              fetchExpansions();
            }
          );
        }
      }
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const deleteExpansion = (key) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.remove(key, () => {
        fetchExpansions();
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const editExpansion = (key) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      setNewShortcut(key.replace(STORAGE_TEXT_PREFIX, ""));
      setNewExpansion(expansions.find(([k]) => k === key)[1]);
      setEditingKey(key);
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const handleLinkBtnClick = () => {
    setDisplayDiv("saveLinks");
  };

  const handleTextBtnClick = () => {
    setDisplayDiv("saveText");
  };

  const saveShortcut = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      if (text && url) {
        window.chrome.storage.local.set(
          { [STORAGE_LINKS_PREFIX + text]: url },
          () => {
            setText("");
            setUrl("");
            fetchShortcuts();
          }
        );
      }
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const editShortcut = (shortcut) => {
    setText(shortcut.text);
    setUrl(shortcut.url);
  };

  const deleteShortcut = (shortcut) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.remove(
        STORAGE_LINKS_PREFIX + shortcut.text,
        fetchShortcuts
      );
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const fetchShortcuts = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get(null, (items) => {
        const savedShortcuts = Object.entries(items)
          .filter(([key]) => key.startsWith(STORAGE_LINKS_PREFIX))
          .map(([key, value]) => ({
            text: key.replace(STORAGE_LINKS_PREFIX, ""),
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
          Curateit
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
              <label htmlFor="newitem">Save your Links</label>
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
              {shortcuts.map((shortcut, index) => (
                <li className="" key={index}>
                  <div className="labelWrapper">
                    <span className="label shortcutText">{shortcut.text}</span>
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
            <div style={{ display: "grid", gap: "7px" }}>
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <input
                type="text"
                placeholder="Shortcut"
                value={newShortcut}
                onChange={(e) => setNewShortcut(e.target.value)}
              />
              <div className="richtextWrapper">
                <textarea
                  placeholder="Expansion"
                  value={newExpansion}
                  onChange={(e) => setNewExpansion(e.target.value)}
                  rows={7}
                  style={{
                    background: "#f7f1f1",
                    border: "none",
                    width: "100%",
                    fontSize: "medium",
                  }}
                />
                {/* <div>
                  <button className="bold">B</button>
                  <button className="italic">I</button>
                  <button className="textColor">A</button>
                  <button className="highlight">H</button>
                </div> */}
              </div>
              <button
                type="button"
                onClick={addExpansion}
                style={{ marginLeft: "0px" }}
              >
                {editingKey ? "Update" : "Add"}
              </button>
            </div>
            <ul>
              {filteredExpansions.map(([key, value]) => (
                <li key={key}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="shortcut">
                      {key.replace(STORAGE_TEXT_PREFIX, "")}
                    </span>
                    <span className="expansion">{value}</span>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      className="btn-picto"
                      onClick={() => editExpansion(key)}
                    >
                      <AiOutlineEdit className="edit-btn" size={32} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      title="Delete"
                      className="btn-picto"
                      onClick={() => deleteExpansion(key)}
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
