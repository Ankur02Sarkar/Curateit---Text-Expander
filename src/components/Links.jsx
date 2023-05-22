/* global chrome */
import React, { useEffect, useReducer } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

const STORAGE_LINKS_PREFIX = "curateit_links_";

const initialState = {
  text: "",
  url: "",
  shortcuts: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_TEXT":
      return { ...state, text: action.payload };
    case "SET_URL":
      return { ...state, url: action.payload };
    case "SET_SHORTCUTS":
      return { ...state, shortcuts: action.payload };
    default:
      return state;
  }
};

const Links = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const saveShortcut = (event) => {
    event.preventDefault();
    if (state.text && state.url) {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        window.chrome.storage.local.set(
          { [STORAGE_LINKS_PREFIX + state.text]: state.url },
          () => {
            dispatch({ type: "SET_TEXT", payload: "" });
            dispatch({ type: "SET_URL", payload: "" });
            fetchShortcuts();
          }
        );
      }
    }
  };

  const editShortcut = (shortcut) => {
    dispatch({ type: "SET_TEXT", payload: shortcut.text });
    dispatch({ type: "SET_URL", payload: shortcut.url });
  };

  const deleteShortcut = (shortcut) => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      window.chrome.storage.local.remove(
        STORAGE_LINKS_PREFIX + shortcut.text,
        fetchShortcuts
      );
    }
  };

  const fetchShortcuts = () => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      window.chrome.storage.local.get(null, (items) => {
        const savedShortcuts = Object.entries(items)
          .filter(([key]) => key.startsWith(STORAGE_LINKS_PREFIX))
          .map(([key, value]) => ({
            text: key.replace(STORAGE_LINKS_PREFIX, ""),
            url: value,
          }));
        dispatch({ type: "SET_SHORTCUTS", payload: savedShortcuts });
      });
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
          value={state.url}
          onChange={(e) =>
            dispatch({ type: "SET_URL", payload: e.target.value })
          }
        />
        <input
          placeholder="Text"
          value={state.text}
          onChange={(e) =>
            dispatch({ type: "SET_TEXT", payload: e.target.value })
          }
        />
        <button onClick={(e) => saveShortcut(e)}>Save</button>
      </form>
      <ul>
        {state.shortcuts.map((shortcut, index) => (
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
