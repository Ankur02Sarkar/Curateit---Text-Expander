/* global chrome */
import React, { useEffect, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import "./FlashCards.css";

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
    let startIndex = str.indexOf("[");
    let endIndex = str.lastIndexOf("]") + 1;
    let jsonStr = str.substring(startIndex, endIndex);
    return jsonStr;
  }

  const createQuestionAnswers = async () => {
    setLoading(true);
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const siteUrl = tabs[0].url;
      console.log("url from createQuestionAnswers : ", siteUrl);

      // Extract YouTube video ID
      const url = new URL(siteUrl);
      const videoId = new URLSearchParams(url.search).get("v");
      console.log("YouTube video ID: ", videoId);

      try {
        const response = await fetch(
          `http://localhost:8000/transcript/${videoId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTranscript(data.transcription);
        console.log("Transcript : ", transcript);

        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Create ${inputNumber} short questions and answers based on the following context. Remember that the 
            answers must be within the context. The Context is :-

            ${data.transcription}
            
            Your response should strictly be JSON data of the following 
            format :-
            [
              {
                  "question": "Question 1",
                  "answer": "Answer 1"
              },
              {
                  "question": "Question 2",
                  "answer": "Answer 2"
              },
              {
                  "question": "Question 3",
                  "answer": "Answer 3"
              }
            ]

            Remember that the JSON Format should be STRICTLY like the one given above and not some different format. 
            `,
            },
          ],
        });

        const result = completion.data.choices[0].message.content.trim();
        const jsonResult = extractJSON(result);
        console.log("res is : ", jsonResult);
        const parsedResult = JSON.parse(jsonResult);
        console.log("parsed res is : ", parsedResult);
        setQuizData(parsedResult);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleTextExtraction = async () => {
    setLoading(true);
    console.log("url from handleTextExtraction : ", siteUrl);
    var encodedUrl = encodeURIComponent(siteUrl);
    console.log(encodedUrl);
    try {
      const response = await fetch(
        `http://localhost:8000/extract_article/${encodedUrl}`
      );
      const data = await response.json();

      // Log the text directly after extraction
      console.log("Text extracted is ", data.text);

      setText(data.text);

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Create ${inputNumber} short questions and answers based on the following context. Remember that the 
            answers must be within the context. The Context is :-

            ${data.text}
            
            Your response should strictly be JSON data of the following 
            format :-
            [
              {
                  "question": "Question 1",
                  "answer": "Answer 1"
              },
              {
                  "question": "Question 2",
                  "answer": "Answer 2"
              },
              {
                  "question": "Question 3",
                  "answer": "Answer 3"
              }
            ]

            Remember that the JSON Format should be STRICTLY like the one given above and not some different format. 
            `,
          },
        ],
      });

      const result = completion.data.choices[0].message.content.trim();
      const jsonResult = extractJSON(result);
      console.log("res is : ", jsonResult);
      const parsedResult = JSON.parse(jsonResult);
      console.log("parsed res is : ", parsedResult);
      setQuizData(parsedResult);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flashCardsWrapper">
      {isYoutube === "" ? <button onClick={checkYoutube}>Start</button> : null}
      {isYoutube === "Yes" ? (
        <>
          <input
            type="number"
            id="youtubeInput"
            onChange={(e) => setInputNumber(e.target.value)}
            placeholder="How many Flashcards do you want?"
          />
          <button onClick={createQuestionAnswers}>Generate Flashcards</button>
        </>
      ) : isYoutube === "No" ? (
        <>
          <input
            type="number"
            id="textExtractionInput"
            onChange={(e) => setInputNumber(e.target.value)}
            placeholder="How many Flashcards do you want?"
          />
          <button onClick={handleTextExtraction}>Extract Text</button>
        </>
      ) : null}
      {loading && <h3>Creating Flashcards...</h3>}
      {quizData && (
        <div className="flashCards">
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
  );
};

export default FlashCards;
