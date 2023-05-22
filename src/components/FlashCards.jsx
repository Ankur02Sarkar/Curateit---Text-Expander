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
  const [isYoutube, setIsYoutube] = useState(true);

  const createQuestionAnswers = async () => {
    setLoading(true);
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const siteUrl = tabs[0].url;
      console.log("url : ", siteUrl);
      if (!siteUrl.includes("youtube.com")) {
        console.log("website is not youtube");
        setIsYoutube(false); // Set isYoutube to false
        setLoading(false);
        return;
      }
      setIsYoutube(true);

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

        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Create short questions and answers based on the following context. Remember that the 
            answers must be within the context. The Context is :-

            ${transcript}
            
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
        console.log("res is : ", result);
        const parsedResult = JSON.parse(result);
        console.log("parsed res is : ", parsedResult);
        setQuizData(parsedResult);
        setLoading(false);
      } catch (error) {
        console.error(error);
        // Handle error appropriately. Maybe set some state and show the error message in the UI.
      }
    });
  };

  return (
    <div className="flashCardsWrapper">
      <button onClick={createQuestionAnswers}>Generate Flashcards</button>
      {loading && <h3>Generating Questions...</h3>}
      {!isYoutube && <h3>Website is not YouTube</h3>}
      {quizData && (
        <div className="flashCards">
          <label>
            <input type="checkbox" />
            <div className="flip-card">
              <div className="front">
                <h1>Question</h1>
                <hr />
                <p>gfgfgfgffggffdgfgfdgddfgdfgdfgdfgddgdggdfgfg</p>
                <hr />
                <p className="click">Show Answer</p>
              </div>
              <div className="back">
                <h1>Answer</h1>
                <hr />
                <p>sssssssssssssssssssddsssssssssssssssssssssss</p>
                <hr />
                <p className="click">Show Question</p>
              </div>
            </div>
          </label>
          <label>
            <input type="checkbox" />
            <div className="flip-card">
              <div className="front">
                <h1>Question</h1>
                <hr />
                <p>gfgfgfgffggffdgfgfdgddfgdfgdfgdfgddgdggdfgfg</p>
                <hr />
                <p className="click">Show Answer</p>
              </div>
              <div className="back">
                <h1>Answer</h1>
                <hr />
                <p>sssssssssssssssssssddsssssssssssssssssssssss</p>
                <hr />
                <p className="click">Show Question</p>
              </div>
            </div>
          </label>
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
