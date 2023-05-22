/* global chrome */
import React, { useState, useEffect, useReducer } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

const STORAGE_FORM_PREFIX = "curateit_form_";

const chromeStorageAvailable = () =>
  window.chrome && window.chrome.storage && window.chrome.storage.local;

const initialState = {
  forms: [],
  newFormTitle: "",
  newFormData: "",
  editingFormKey: null,
  filteredForms: [],
  formQuery: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_FORMS":
      return { ...state, forms: action.payload };
    case "SET_NEW_FORM_TITLE":
      return { ...state, newFormTitle: action.payload };
    case "SET_NEW_FORM_DATA":
      return { ...state, newFormData: action.payload };
    case "SET_EDITING_FORM_KEY":
      return { ...state, editingFormKey: action.payload };
    case "SET_FILTERED_FORMS":
      return { ...state, filteredForms: action.payload };
    case "SET_FORM_QUERY":
      return { ...state, formQuery: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const Forms = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    forms,
    newFormTitle,
    newFormData,
    editingFormKey,
    filteredForms,
    formQuery,
  } = state;

  const fetchForms = () => {
    if (chromeStorageAvailable()) {
      window.chrome.storage.local.get(null, (items) => {
        const fetchedForms = Object.entries(items).filter(([key]) =>
          key.startsWith(STORAGE_FORM_PREFIX)
        );
        dispatch({ type: "SET_FORMS", payload: fetchedForms });
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const addForm = () => {
    if (chromeStorageAvailable()) {
      if (newFormTitle && newFormData) {
        const formattedFormTitle = newFormTitle.startsWith(":")
          ? newFormTitle
          : `:${newFormTitle}`;

        if (editingFormKey) {
          window.chrome.storage.local.remove(editingFormKey, () => {
            window.chrome.storage.local.set(
              { [STORAGE_FORM_PREFIX + formattedFormTitle]: newFormData },
              () => {
                dispatch({ type: "SET_NEW_FORM_TITLE", payload: "" });
                dispatch({ type: "SET_NEW_FORM_DATA", payload: "" });
                dispatch({ type: "SET_EDITING_FORM_KEY", payload: null });
                fetchForms();
              }
            );
          });
        } else {
          window.chrome.storage.local.set(
            { [STORAGE_FORM_PREFIX + formattedFormTitle]: newFormData },
            () => {
              dispatch({ type: "SET_NEW_FORM_TITLE", payload: "" });
              dispatch({ type: "SET_NEW_FORM_DATA", payload: "" });
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
    if (chromeStorageAvailable()) {
      window.chrome.storage.local.remove(key, () => {
        fetchForms();
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const editForm = (key) => {
    if (chromeStorageAvailable()) {
      const formToEdit = forms.find(([k]) => k === key);
      if (formToEdit) {
        dispatch({
          type: "SET_NEW_FORM_TITLE",
          payload: formToEdit[0].replace(STORAGE_FORM_PREFIX, ""),
        });
        dispatch({ type: "SET_NEW_FORM_DATA", payload: formToEdit[1] });
        dispatch({ type: "SET_EDITING_FORM_KEY", payload: key });
      }
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
    dispatch({ type: "SET_FILTERED_FORMS", payload: filtered });
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
        onChange={(e) =>
          dispatch({ type: "SET_FORM_QUERY", payload: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Form Title"
        value={newFormTitle}
        onChange={(e) =>
          dispatch({ type: "SET_NEW_FORM_TITLE", payload: e.target.value })
        }
      />
      <textarea
        placeholder="Form Data"
        value={newFormData}
        onChange={(e) =>
          dispatch({ type: "SET_NEW_FORM_DATA", payload: e.target.value })
        }
        rows={7}
        style={{
          // background: "#f7f1f1",
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
