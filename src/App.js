import { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";

function App() {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState({});
  const [inputTagValue, setInputTagValue] = useState("");
  const [originalKey, setOriginalKey] = useState(null);

  useEffect(() => {
    const storedContent =
      JSON.parse(localStorage.getItem("savedContent")) || {};
    setSavedContent(storedContent);
  }, []);

  const saveContent = () => {
    let updatedContent = { ...savedContent };

    if (originalKey !== null && originalKey !== inputTagValue) {
      delete updatedContent[originalKey];
    }

    updatedContent[inputTagValue] = content;

    setSavedContent(updatedContent);
    localStorage.setItem("savedContent", JSON.stringify(updatedContent));
    setContent("");
    setInputTagValue("");
    setOriginalKey(null);
  };

  const editContent = (key) => {
    setContent(savedContent[key]);
    setInputTagValue(key);
    setOriginalKey(key);
  };

  const deleteContent = (key) => {
    const updatedContent = { ...savedContent };
    delete updatedContent[key];
    setSavedContent(updatedContent);
    localStorage.setItem("savedContent", JSON.stringify(updatedContent));
  };

  const renderSavedContent = () => {
    return Object.entries(savedContent).map(([key, item]) => (
      <div key={key}>
        <h3>{key}</h3>
        <div dangerouslySetInnerHTML={{ __html: item }}></div>
        <button onClick={() => editContent(key)}>Edit</button>
        <button onClick={() => deleteContent(key)}>Delete</button>
      </div>
    ));
  };

  return (
    <div className="joditContainer">
      <JoditEditor
        ref={editor}
        value={content}
        onChange={(newContent) => setContent(newContent)}
      />

      <label htmlFor="inputTag">Input Tag:</label>
      <input
        type="text"
        id="inputTag"
        value={inputTagValue}
        onChange={(e) => setInputTagValue(e.target.value)}
      />

      <button onClick={saveContent}>
        {originalKey !== null ? "Update" : "Save"}
      </button>

      <div>{renderSavedContent()}</div>
    </div>
  );
}

export default App;
