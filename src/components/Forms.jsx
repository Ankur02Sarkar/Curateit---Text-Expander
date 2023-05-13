/* global chrome */
import React, { useState, useEffect } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

const STORAGE_FORM_PREFIX = "curateit_form_";

const Forms = () => {
  const [forms, setForms] = useState([]);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormData, setNewFormData] = useState("");
  const [editingFormKey, setEditingFormKey] = useState(null);
  const [filteredForms, setFilteredForms] = useState([]);
  const [formQuery, setFormQuery] = useState("");

  const fetchForms = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get(null, (items) => {
        const fetchedForms = Object.entries(items).filter(([key]) =>
          key.startsWith(STORAGE_FORM_PREFIX)
        );
        setForms(fetchedForms);
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const addForm = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      if (newFormTitle && newFormData) {
        const formattedFormTitle = newFormTitle.startsWith(":")
          ? newFormTitle
          : `:${newFormTitle}`;

        if (editingFormKey) {
          window.chrome.storage.local.remove(editingFormKey, () => {
            window.chrome.storage.local.set(
              { [STORAGE_FORM_PREFIX + formattedFormTitle]: newFormData },
              () => {
                setNewFormTitle("");
                setNewFormData("");
                setEditingFormKey(null);
                fetchForms();
              }
            );
          });
        } else {
          window.chrome.storage.local.set(
            { [STORAGE_FORM_PREFIX + formattedFormTitle]: newFormData },
            () => {
              setNewFormTitle("");
              setNewFormData("");
              fetchForms();
            }
          );
        }
      }
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const deleteForm = (key) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.remove(key, () => {
        fetchForms();
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const editForm = (key) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      setNewFormTitle(key.replace(STORAGE_FORM_PREFIX, ""));
      setNewFormData(forms.find(([k]) => k === key)[1]);
      setEditingFormKey(key);
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const filterForms = () => {
    const filtered = forms.filter(([key, value]) => {
      const formattedKey = key.replace(STORAGE_FORM_PREFIX, "");
      return (
        formattedKey.toLowerCase().includes(formQuery.toLowerCase()) ||
        value.toLowerCase().includes(formQuery.toLowerCase())
      );
    });
    setFilteredForms(filtered);
  };

  useEffect(() => {
    filterForms();
  }, [formQuery, forms]);

  return (
    <div className="saveForms">
      <label htmlFor="">Save Your Forms</label>
      <input
        type="text"
        placeholder="Search forms..."
        value={formQuery}
        onChange={(e) => setFormQuery(e.target.value)}
      />
      <input
        type="text"
        placeholder="Form Title"
        value={newFormTitle}
        onChange={(e) => setNewFormTitle(e.target.value)}
      />
      <textarea
        placeholder="Form Data"
        value={newFormData}
        onChange={(e) => setNewFormData(e.target.value)}
        rows={7}
        style={{
          background: "#f7f1f1",
          border: "none",
          width: "100%",
          fontSize: "17px",
          padding: "12px",
        }}
      />
      <button type="button" onClick={addForm} style={{ marginLeft: "0px" }}>
        {editingFormKey ? "Update" : "Add"}
      </button>
      <ul>
        {filteredForms.map(([key, value]) => (
          <li key={key} style={{ flexDirection: "column" }}>
            <div
              className="labelWrapper"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span
                className="label formTitle"
                style={{ fontSize: "27px", fontWeight: "900" }}
              >
                {key.replace(STORAGE_FORM_PREFIX, "")}
              </span>
              <span className="label formData">{value}</span>
            </div>
            <div className="actions">
              <button
                type="button"
                aria-label="Edit"
                title="Edit"
                className="btn-picto"
                onClick={() => editForm(key)}
              >
                <AiOutlineEdit className="edit-btn" size={32} />
              </button>
              <button
                type="button"
                aria-label="Delete"
                title="Delete"
                className="btn-picto"
                onClick={() => deleteForm(key)}
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

export default Forms;
