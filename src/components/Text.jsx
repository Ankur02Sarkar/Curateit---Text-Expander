/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

const STORAGE_TEXT_PREFIX = "curateit_text_";

const Text = () => {
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

  return (
    <div className="saveText">
      <label htmlFor="">Save Your Text</label>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
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
          {editingKey ? "Update" : "Add"}
        </button>
      </div>
      <ul>
        {filteredExpansions.map(([key, value]) => (
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
