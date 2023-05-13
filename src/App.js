/* global chrome */

import React, { useState } from "react";
import { TbUnlink, TbTextRecognition, TbForms } from "react-icons/tb";
import { CiTextAlignCenter } from "react-icons/ci";

import Citations from "./components/Citations";
import Forms from "./components/Forms";
import Links from "./components/Links";
import Text from "./components/Text";
import "./App.css";

function App() {
  const [displayDiv, setDisplayDiv] = useState(null);

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
            aria-label="Link"
            onClick={handleLinkBtnClick}
            size={37}
          />

          <TbTextRecognition
            className="btnText"
            onClick={handleTextBtnClick}
            size={37}
            data-tooltip="Text Recognition"
          />

          <TbForms className="btnForm" onClick={handleFormBtnClick} size={37} />
          <CiTextAlignCenter
            className="btnCitation"
            onClick={handleCitationBtnClick}
            size={37}
          />
        </div>
        {displayDiv === "saveLinks" && <Links />}
        {displayDiv === "saveText" && <Text />}
        {displayDiv === "saveForms" && <Forms />}
        {displayDiv === "saveCitations" && <Citations />}
      </main>
    </>
  );
}

export default App;
