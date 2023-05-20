/* global chrome */

import React, { useState } from "react";
import { TbUnlink, TbTextRecognition, TbForms } from "react-icons/tb";
import { CiTextAlignCenter } from "react-icons/ci";
import { MdOutlineQuiz } from "react-icons/md";

import Citations from "./components/Citations";
import Forms from "./components/Forms";
import Links from "./components/Links";
import Text from "./components/Text";
import FlashCards from "./components/FlashCards";
import "./App.css";

const COMPONENT_MAP = {
  saveLinks: Links,
  saveText: Text,
  saveForms: Forms,
  saveCitations: Citations,
  saveFlashCards: FlashCards,
};

function App() {
  const [displayDiv, setDisplayDiv] = useState(null);

  const handleClick = (component) => () => {
    setDisplayDiv(component);
  };

  const DisplayedComponent = COMPONENT_MAP[displayDiv];

  return (
    <main id="todolist">
      <h1>
        Curateit
        <span>Build your personal corner on the web</span>
      </h1>
      <div className="btn-wrapper">
        <TbUnlink
          className="btnLink"
          aria-label="Link"
          onClick={handleClick("saveLinks")}
          size={37}
        />

        <TbTextRecognition
          className="btnText"
          onClick={handleClick("saveText")}
          size={37}
          data-tooltip="Text Recognition"
        />

        <TbForms
          className="btnForm"
          onClick={handleClick("saveForms")}
          size={37}
        />

        <CiTextAlignCenter
          className="btnCitation"
          onClick={handleClick("saveCitations")}
          size={37}
        />
        <MdOutlineQuiz
          className="btnCitation"
          onClick={handleClick("saveFlashCards")}
          size={37}
        />
      </div>
      {DisplayedComponent && <DisplayedComponent />}
    </main>
  );
}

export default App;
