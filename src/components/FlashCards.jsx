/* global chrome */
import React, { useEffect, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./FlashCards.css";
import Quiz from "./Quiz";

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const FlashCards = () => {
  const [transcript, setTranscript] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isYoutube, setIsYoutube] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [text, setText] = useState("");
  const [inputNumber, setInputNumber] = useState("");
  const [currentIndexFlashCards, setCurrentIndexFlashCards] = useState(0);
  const [currentIndexTextExtraction, setCurrentIndexTextExtraction] =
    useState(0);
  const [hasGeneratedFlashCards, setHasGeneratedFlashCards] = useState(false);
  const [hasExtractedText, setHasExtractedText] = useState(false);
  const [endOfResult, setEndOfResult] = useState(false);
  const [radioSelection, setRadioSelection] = useState("flashCardsWrapper");

  const checkYoutube = async () => {
    setIsYoutube("");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let currentUrl = tabs[0].url;
      setSiteUrl(currentUrl);
      console.log("url from useeffect : ", currentUrl);
      if (currentUrl.includes("youtube.com")) {
        setIsYoutube("Yes");
      } else {
        setIsYoutube("No");
      }
    });
  };

  function extractJSON(str) {
    // Check if the string starts with "(" and ends with ")"
    if (str.startsWith("(") && str.endsWith(")")) {
      str = str.substring(1, str.length - 1); // Remove the parentheses
    }

    let startIndex = str.indexOf("[");
    let endIndex = str.lastIndexOf("]") + 1;
    let jsonStr = str.substring(startIndex, endIndex);

    return jsonStr;
  }

  const savePdf = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight() - 20; // consider some margin
    const pageWidth = doc.internal.pageSize.getWidth() - 20; // consider some margin
    let yCoordinate = 10;

    quizData.forEach((item, index) => {
      const questionLines = doc.splitTextToSize(
        `Question ${index + 1}: ${item.question}`,
        pageWidth
      );
      const answerLines = doc.splitTextToSize(
        `Answer ${index + 1}: ${item.answer}`,
        pageWidth
      );

      // Check if adding the question lines would exceed page height
      if (yCoordinate + questionLines.length * 7 > pageHeight) {
        doc.addPage();
        yCoordinate = 10; // Reset y coordinate to top of new page
      }

      doc.text(questionLines, 10, yCoordinate);
      yCoordinate = yCoordinate + questionLines.length * 7; // consider line spacing for question text

      // Check if adding the answer lines would exceed page height
      if (yCoordinate + answerLines.length * 7 > pageHeight) {
        doc.addPage();
        yCoordinate = 10; // Reset y coordinate to top of new page
      }

      doc.text(answerLines, 10, yCoordinate);
      yCoordinate = yCoordinate + answerLines.length * 7; // consider line spacing for answer text

      // Add space between different QA pairs, and check if it would exceed page height
      if (yCoordinate + 10 > pageHeight) {
        doc.addPage();
        yCoordinate = 10; // Reset y coordinate to top of new page
      } else {
        yCoordinate = yCoordinate + 10;
      }
    });
    doc.save("quiz.pdf");
  };

  const createQuestionAnswers = async () => {
    setLoading(true);
    setEndOfResult(false);
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const siteUrl = tabs[0].url;
      console.log("url from createQuestionAnswers : ", siteUrl);

      const url = new URL(siteUrl);
      const videoId = new URLSearchParams(url.search).get("v");
      console.log("YouTube video ID: ", videoId);

      const response = await fetch(
        `http://localhost:8000/transcript/${videoId}/${currentIndexFlashCards}/${
          currentIndexFlashCards + 8000
        }`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (currentIndexFlashCards + 8000 >= data.transcription.length) {
        setCurrentIndexFlashCards(0); // Reset index to 0 if we've reached the end
      } else {
        setCurrentIndexFlashCards(currentIndexFlashCards + 8000);
      }
      setTranscript(data.transcription);
      console.log("Transcript : ", data.transcription);
      if (data.transcription == "") {
        console.log("Empty transcription:", data.transcription);
        setLoading(false);
        setEndOfResult(true);
        return;
      }
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Create ${inputNumber} short questions and answers based on the following context. Remember that the 
            answers must be within the context. The Context is :-

            ${data.transcription}
            
            Your response should strictly be JSON data of the following 
            format :-
            (
              [
                {
                  "question": "What is the capital of India?",
                  "answer": "Delhi is the Capital of India",
                  "answerOptions": [
                    { "answerText": "Delhi", "isCorrect": true },
                    { "answerText": "Pune", "isCorrect": false },
                    { "answerText": "Ranchi", "isCorrect": false },
                    { "answerText": "Patna", "isCorrect": false }
                  ]
                },
                {
                  "question": "Who is the Prime Minister of China?",
                  "answer": "Beijing is the Prime Minister of China",
                  "answerOptions": [
                    { "answerText": "Fumio Kishida", "isCorrect": true },
                    { "answerText": "Modi", "isCorrect": false },
                    { "answerText": "Trump", "isCorrect": false },
                    { "answerText": "Obama", "isCorrect": false }
                  ]
                },
                {
                  "question": "What is 1 + 1?",
                  "answer": "1 + 1 is 2",
                  "answerOptions": [
                    { "answerText": "2", "isCorrect": true },
                    { "answerText": "3", "isCorrect": false },
                    { "answerText": "7", "isCorrect": false },
                    { "answerText": "12", "isCorrect": false }
                  ]
                }
              ]
            )

            Remember that the JSON Format should be STRICTLY like the one given above and not some different format. 
            `,
          },
        ],
      });

      let result = completion.data.choices[0].message.content.trim();
      console.log("openai res : \n", result);
      // result = `(
      //   [
      //         {
      //           "question": "What is the capital of India?",
      //           "answer": "Delhi is the Capital of India",
      //           "answerOptions": [
      //             { "answerText": "Delhi", "isCorrect": true },
      //             { "answerText": "Pune", "isCorrect": false },
      //             { "answerText": "Ranchi", "isCorrect": false },
      //             { "answerText": "Patna", "isCorrect": false },
      //           ],
      //         },
      //         {
      //           "question": "Who is the Prime Minister of China?",
      //           "answer": "Beijing is the Prime Minister of China",
      //           "answerOptions": [
      //             { "answerText": "Fumio Kishida", "isCorrect": true },
      //             { "answerText": "Modi", "isCorrect": false },
      //             { "answerText": "Trump", "isCorrect": false },
      //             { "answerText": "Obama", "isCorrect": false },
      //           ],
      //         },
      //         {
      //           "question": "What is 1 + 1?",
      //           "answer": "1 + 1 is 2",
      //           "answerOptions": [
      //             { "answerText": "2", "isCorrect": true },
      //             { "answerText": "3", "isCorrect": false },
      //             { "answerText": "7", "isCorrect": false },
      //             { "answerText": "12", "isCorrect": false },
      //           ],
      //         },
      //   ]
      //   )`;
      // console.log("openai res MODIFIED : \n", result);

      const jsonResult = extractJSON(result);
      console.log("res is : ", jsonResult);
      const parsedResult = JSON.parse(jsonResult);
      console.log("parsed res is : ", parsedResult);

      // need to remove duplicates in quiz data

      setQuizData((oldQuizData) => [...oldQuizData, ...parsedResult]);
      setCurrentIndexFlashCards(currentIndexFlashCards + 8000);
      setLoading(false);
    });
    setHasGeneratedFlashCards(true);
  };

  const handleTextExtraction = async () => {
    setLoading(true);
    setEndOfResult(false);
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const siteUrl = tabs[0].url;
      console.log("url from handleTextExtraction : ", siteUrl);

      const encodedUrl = encodeURIComponent(siteUrl);
      console.log("Encoded URL : ", encodedUrl);

      const response = await fetch(
        `http://localhost:8000/extract_article/${encodedUrl}/${currentIndexTextExtraction}/${
          currentIndexTextExtraction + 8000
        }`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (currentIndexTextExtraction + 8000 >= data.text.length) {
        setCurrentIndexTextExtraction(0); // Reset index to 0 if we've reached the end
      } else {
        setCurrentIndexTextExtraction(currentIndexTextExtraction + 8000);
      }
      setText(data.text);
      console.log("Text : ", data.text);
      if (data.text == "") {
        console.log("Empty Text:", data.text);
        setLoading(false);
        setEndOfResult(true);
        return;
      }
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Create ${inputNumber} short questions and answers based on the following context. Remember that the 
            answers must be within the context. The Context is :-

            ${data.text}
            
            Your response should strictly be JSON data of the following 
            format :-
            (
              [
                {
                  "question": "What is the capital of India?",
                  "answer": "Delhi is the Capital of India",
                  "answerOptions": [
                    { "answerText": "Delhi", "isCorrect": true },
                    { "answerText": "Pune", "isCorrect": false },
                    { "answerText": "Ranchi", "isCorrect": false },
                    { "answerText": "Patna", "isCorrect": false }
                  ]
                },
                {
                  "question": "Who is the Prime Minister of China?",
                  "answer": "Beijing is the Prime Minister of China",
                  "answerOptions": [
                    { "answerText": "Fumio Kishida", "isCorrect": true },
                    { "answerText": "Modi", "isCorrect": false },
                    { "answerText": "Trump", "isCorrect": false },
                    { "answerText": "Obama", "isCorrect": false }
                  ]
                },
                {
                  "question": "What is 1 + 1?",
                  "answer": "1 + 1 is 2",
                  "answerOptions": [
                    { "answerText": "2", "isCorrect": true },
                    { "answerText": "3", "isCorrect": false },
                    { "answerText": "7", "isCorrect": false },
                    { "answerText": "12", "isCorrect": false }
                  ]
                }
              ]
            )

            Remember that the JSON Format should be STRICTLY like the one given above and not some different format. 
            `,
          },
        ],
      });

      let result = completion.data.choices[0].message.content.trim();
      console.log("openai res : \n", result);
      // result = `
      //   [
      //       {
      //         "question": "What is the capital of India?",
      //         "answer": "Delhi is the Capital of India",
      //         "answerOptions": [
      //           { "answerText": "Delhi", "isCorrect": true },
      //           { "answerText": "Pune", "isCorrect": false },
      //           { "answerText": "Ranchi", "isCorrect": false },
      //           { "answerText": "Patna", "isCorrect": false }
      //         ]
      //       },
      //       {
      //         "question": "Who is the Prime Minister of China?",
      //         "answer": "Beijing is the Prime Minister of China",
      //         "answerOptions": [
      //           { "answerText": "Fumio Kishida", "isCorrect": true },
      //           { "answerText": "Modi", "isCorrect": false },
      //           { "answerText": "Trump", "isCorrect": false },
      //           { "answerText": "Obama", "isCorrect": false }
      //         ]
      //       },
      //       {
      //         "question": "What is 1 + 1?",
      //         "answer": "1 + 1 is 2",
      //         "answerOptions": [
      //           { "answerText": "2", "isCorrect": true },
      //           { "answerText": "3", "isCorrect": false },
      //           { "answerText": "7", "isCorrect": false },
      //           { "answerText": "12", "isCorrect": false }
      //         ]
      //       }
      //   ]
      //   `;

      // console.log("openai res MODIFIED : \n", result);

      const jsonResult = extractJSON(result);

      const parsedResult = JSON.parse(jsonResult);
      console.log("parsed result : ", parsedResult);
      setQuizData((oldQuizData) => [...oldQuizData, ...parsedResult]);
      setCurrentIndexTextExtraction(currentIndexTextExtraction + 8000);
      setLoading(false);
    });
    setHasExtractedText(true);
  };

  return (
    <>
      <div>
        <label>
          <input
            type="radio"
            value="flashCardsWrapper"
            checked={radioSelection === "flashCardsWrapper"}
            onChange={(e) => {
              setQuizData([]);
              setRadioSelection(e.target.value);
            }}
          />
          Flash Cards
        </label>

        <label>
          <input
            type="radio"
            value="hello"
            checked={radioSelection === "hello"}
            onChange={(e) => {
              setQuizData([]);
              setRadioSelection(e.target.value);
            }}
          />
          Quiz
        </label>
      </div>
      {radioSelection === "flashCardsWrapper" && (
        <div className="flashCardsWrapper">
          {isYoutube === "" ? (
            <button onClick={checkYoutube}>Start</button>
          ) : null}

          <button onClick={savePdf}>Save as PDF</button>

          {isYoutube === "Yes" && (
            <>
              <input
                type="number"
                id="textExtractionInput"
                onChange={(e) => setInputNumber(e.target.value)}
                placeholder="Number of Flashcards"
              />
              <button onClick={createQuestionAnswers} disabled={loading}>
                {loading && hasGeneratedFlashCards
                  ? "Generating More Flashcards..."
                  : hasGeneratedFlashCards
                  ? "Generate More Flashcards"
                  : "Generate Flashcards"}
              </button>
            </>
          )}
          {isYoutube === "No" && (
            <>
              <input
                type="number"
                id="textExtractionInput"
                onChange={(e) => setInputNumber(e.target.value)}
                placeholder="Number of Flashcards"
              />
              <button onClick={handleTextExtraction} disabled={loading}>
                {loading && hasExtractedText
                  ? "Extracting More Text..."
                  : hasExtractedText
                  ? "Extract More Text"
                  : "Extract Text"}
              </button>
            </>
          )}
          {loading && <h3>Creating Flashcards...</h3>}
          {endOfResult && <h3>No more Content</h3>}
          {quizData && (
            <div id="quiz-data" className="flashCards">
              {quizData.map((item, index) => (
                <label key={index}>
                  <input type="checkbox" />
                  <div className="flip-card">
                    <div className="front">
                      <h1>Question</h1>
                      <hr />
                      <p>{item.question}</p>
                      <hr />
                      <p className="click">Show Answer</p>
                    </div>
                    <div className="back">
                      <h1>Answer</h1>
                      <hr />
                      <p>{item.answer}</p>
                      <hr />
                      <p className="click">Show Question</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {radioSelection === "hello" && (
        <div className="flashCardsWrapper">
          {isYoutube === "" ? (
            <button onClick={checkYoutube}>Start</button>
          ) : null}

          <button onClick={savePdf}>Save as PDF</button>

          {isYoutube === "Yes" && (
            <>
              <input
                type="number"
                id="textExtractionInput"
                onChange={(e) => setInputNumber(e.target.value)}
                placeholder="Number of Questions"
              />
              <button onClick={createQuestionAnswers} disabled={loading}>
                {loading && hasGeneratedFlashCards
                  ? "Generating More Questions..."
                  : hasGeneratedFlashCards
                  ? "Generate More Questions"
                  : "Generate Questions"}
              </button>
            </>
          )}
          {isYoutube === "No" && (
            <>
              <input
                type="number"
                id="textExtractionInput"
                onChange={(e) => setInputNumber(e.target.value)}
                placeholder="Number of Questions"
              />
              <button onClick={handleTextExtraction} disabled={loading}>
                {loading && hasExtractedText
                  ? "Extracting More Text..."
                  : hasExtractedText
                  ? "Extract More Text"
                  : "Extract Text"}
              </button>
            </>
          )}
          {loading && <h3>Creating Questions...</h3>}
          {endOfResult && <h3>No more Content</h3>}
          {/* {quizData && <Quiz questions={quizData} />} */}
          {console.log("before passing quizdata to comp : ", quizData)}

          {quizData.length > 0 && (
            <>
              {console.log("passing quizdata to comp : ", quizData)}
              <Quiz questions={quizData} />
            </>
          )}
        </div>
        // <h1>Hello</h1>
      )}
    </>
  );
};

export default FlashCards;
