import React, { useReducer, useEffect } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

const STORAGE_TEXT_PREFIX = "curateit_text_";

const initialState = {
  query: "",
  expansions: [],
  filteredExpansions: [],
  newShortcut: "",
  newExpansion: "",
  editingKey: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload };
    case "SET_EXPANSIONS":
      return {
        ...state,
        expansions: action.payload,
        filteredExpansions: action.payload,
      };
    case "SET_FILTERED_EXPANSIONS":
      return { ...state, filteredExpansions: action.payload };
    case "SET_NEW_SHORTCUT":
      return { ...state, newShortcut: action.payload };
    case "SET_NEW_EXPANSION":
      return { ...state, newExpansion: action.payload };
    case "SET_EDITING_KEY":
      return { ...state, editingKey: action.payload };
    case "CLEAR_NEW_FIELDS":
      return { ...state, newShortcut: "", newExpansion: "", editingKey: null };
    default:
      return state;
  }
}

const useChromeStorage = () => {
  const isAvailable =
    window.chrome && window.chrome.storage && window.chrome.storage.local;

  if (!isAvailable) {
    console.warn("Chrome storage API not available.");
  }

  return isAvailable;
};

const Text = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const chromeStorageAvailable = useChromeStorage();

  useEffect(() => {
    if (chromeStorageAvailable) {
      window.chrome.storage.local.get(null, (items) => {
        const exps = Object.entries(items).filter(([key]) =>
          key.startsWith(STORAGE_TEXT_PREFIX)
        );
        dispatch({ type: "SET_EXPANSIONS", payload: exps });
      });
    }
  }, [chromeStorageAvailable]);

  useEffect(() => {
    const filtered = state.expansions.filter(([key, value]) => {
      const formattedKey = key.replace(STORAGE_TEXT_PREFIX, "");
      return (
        formattedKey.toLowerCase().includes(state.query.toLowerCase()) ||
        value.toLowerCase().includes(state.query.toLowerCase())
      );
    });
    dispatch({ type: "SET_FILTERED_EXPANSIONS", payload: filtered });
  }, [state.query, state.expansions]);

  const addExpansion = () => {
    if (chromeStorageAvailable) {
      if (state.newShortcut && state.newExpansion) {
        const formattedShortcut = state.newShortcut.startsWith(":")
          ? state.newShortcut
          : `:${state.newShortcut}`;

        if (state.editingKey) {
          window.chrome.storage.local.remove(state.editingKey, () => {
            window.chrome.storage.local.set(
              { [STORAGE_TEXT_PREFIX + formattedShortcut]: state.newExpansion },
              () => {
                dispatch({ type: "CLEAR_NEW_FIELDS" });
              }
            );
          });
        } else {
          window.chrome.storage.local.set(
            { [STORAGE_TEXT_PREFIX + formattedShortcut]: state.newExpansion },
            () => {
              dispatch({ type: "CLEAR_NEW_FIELDS" });
            }
          );
        }
      }
    }
  };

  const deleteExpansion = (key) => {
    if (chromeStorageAvailable) {
      window.chrome.storage.local.remove(key, () => {});
    }
  };

  const editExpansion = (key) => {
    if (chromeStorageAvailable) {
      dispatch({
        type: "SET_NEW_SHORTCUT",
        payload: key.replace(STORAGE_TEXT_PREFIX, ""),
      });
      dispatch({
        type: "SET_NEW_EXPANSION",
        payload: state.expansions.find(([k]) => k === key)[1],
      });
      dispatch({ type: "SET_EDITING_KEY", payload: key });
    }
  };

  return (
    <div className="saveText">
      <label htmlFor="">Save Your Text</label>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <input
          type="text"
          placeholder="Search..."
          value={state.query}
          onChange={(e) =>
            dispatch({ type: "SET_QUERY", payload: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Shortcut"
          value={state.newShortcut}
          onChange={(e) =>
            dispatch({ type: "SET_NEW_SHORTCUT", payload: e.target.value })
          }
        />
        <div className="richtextWrapper">
          <textarea
            placeholder="Expansion"
            value={state.newExpansion}
            onChange={(e) =>
              dispatch({ type: "SET_NEW_EXPANSION", payload: e.target.value })
            }
            rows={7}
            style={{
              background: "#f7f1f1",
              border: "none",
              width: "100%",
              fontSize: "17px",
              padding: "12px",
            }}
          />
        </div>
        <button
          type="button"
          onClick={addExpansion}
          style={{ marginLeft: "0px" }}
        >
          {state.editingKey ? "Update" : "Add"}
        </button>
      </div>
      <ul>
        {state.filteredExpansions.map(([key, value]) => (
          <li key={key} style={{ flexDirection: "column" }}>
            <div
              className="labelWrapper"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span
                className="label shortcutText"
                style={{ fontSize: "27px", fontWeight: "900" }}
              >
                {key.replace(STORAGE_TEXT_PREFIX, "")}
              </span>
              <span className="label shortcutUrl">{value}</span>
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
  );
};

export default Text;
