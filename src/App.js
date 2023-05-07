import React, { useState, useEffect, useRef } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { TbUnlink, TbTextRecognition, TbForms } from "react-icons/tb";
import { CiTextAlignCenter } from "react-icons/ci";
import { Configuration, OpenAIApi } from "openai";
import "./App.css";
const STORAGE_LINKS_PREFIX = "curateit_links_";
const STORAGE_TEXT_PREFIX = "curateit_text_";
const STORAGE_FORM_PREFIX = "curateit_form_";

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

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
  const [forms, setForms] = useState([]);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormData, setNewFormData] = useState("");
  const [editingFormKey, setEditingFormKey] = useState(null);
  const [filteredForms, setFilteredForms] = useState([]);
  const [formQuery, setFormQuery] = useState("");
  const [citationResult, setCitationResult] = useState("");
  const [citeUrl, setCiteUrl] = useState("");

  const citationStyleRef = useRef();
  const handleCiteButtonClick = async () => {
    const selectedStyle = citationStyleRef.current.value;

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Today is 7th May 2023. Write me a ${selectedStyle} style citation for ${citeUrl}. Your answer should strictly follow a JSON format having the fields :- title, url, description, author, accessed date, credibility(high/low/medium), citation, citation format`,
          },
        ],
      });

      const result = completion.data.choices[0].message.content.trim();
      setCitationResult(result);
    } catch (error) {
      console.error(error);
      setCitationResult("Error: Failed to get a response");
    }
  };

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

  const handleFormBtnClick = () => {
    setDisplayDiv("saveForms");
  };
  const handleCitationBtnClick = () => {
    setDisplayDiv("saveCitations");
  };
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

  useEffect(() => {
    fetchShortcuts();
  }, []);

  const openPopup = () => {
    const popupUrl =
      "chrome-extension://pmkaanjncdpcijofnpfpabfkjfnpnmnb/shortcutPopup.html";
    window.open(popupUrl, "shortcutPopup", "width=400,height=300");
  };
  return (
    <>
      <main id="todolist">
        <h1>
          Curateit
          <span>Build your personal corner on the web</span>
        </h1>
        <div className="btn-wrapper">
          <TbUnlink
            className="btnLink"
            onClick={handleLinkBtnClick}
            size={72}
          />

          <TbTextRecognition
            className="btnText"
            onClick={handleTextBtnClick}
            size={72}
            data-tooltip="Text Recognition"
          />

          <TbForms className="btnForm" onClick={handleFormBtnClick} size={72} />
          <CiTextAlignCenter
            className="btnCitation"
            onClick={handleCitationBtnClick}
            size={72}
          />
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
        )}
        {displayDiv === "saveText" && (
          <div className="saveText">
            <label htmlFor="">Save Your Text</label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "7px" }}
            >
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
        )}
        {displayDiv === "saveForms" && (
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
            <button
              type="button"
              onClick={addForm}
              style={{ marginLeft: "0px" }}
            >
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
        )}
        {displayDiv === "saveCitations" && (
          <div className="saveCitations">
            <label htmlFor="">Cite an URL</label>
            <div>
              <input
                type="url"
                placeholder="Enter URL"
                onChange={(e) => setCiteUrl(e.target.value)}
              />
              <select ref={citationStyleRef}>
                <option value="Harvard">Harvard</option>
                <option value="IEEE">IEEE</option>
                <option value="APA">APA</option>
              </select>
              <button
                type="button"
                onClick={handleCiteButtonClick}
                style={{ marginLeft: "0px" }}
              >
                Cite
              </button>
            </div>
            <div className="citation-result">{citationResult}</div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
