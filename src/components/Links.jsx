/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

const STORAGE_LINKS_PREFIX = "curateit_links_";

const Links = () => {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [shortcuts, setShortcuts] = useState([]);

  const saveShortcut = (event) => {
    event.preventDefault();
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
        <button onClick={(e) => saveShortcut(e)}>Save</button>
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
  );
};

export default Links;
