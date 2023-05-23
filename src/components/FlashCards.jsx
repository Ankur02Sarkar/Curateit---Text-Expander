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
  const [isYoutube, setIsYoutube] = useState();
  const [siteUrl, setSiteUrl] = useState("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setSiteUrl(tabs[0].url);
      console.log("url from useeffect : ", siteUrl);
      setIsYoutube(siteUrl.includes("youtube.com"));
    });
  }, []);

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

        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Please create 10 set of short questions and answers based on the following context. 
The answers must be within the context.

Context:  ${transcript}

JSON response format:
[
  {
      "question": "What is an epiphany in Chekhov's short stories?",
      "answer": "A sudden realization or moment of enlightenment experienced by the protagonist."
  },
  {
      "question": "What is the plot of 'The Student'?",
      "answer": "A young seminary student meets two widowed women on Good Friday and tells them the story of Peter's denial of Jesus, which reawakens painful memories in the women."
  },
  {
      "question": "What is the emphasis in 'The Student'?",
      "answer": "More on character and emotion than plot and incident."
  }
]  `,
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
    // const siteUrl = "https://applitools.com/front-endtestfest-june-2023/";
    console.log("url from handleTextExtraction : ", siteUrl);
    var encodedUrl = encodeURIComponent(siteUrl);
    console.log(encodedUrl);
    try {
      const response = await fetch(
        `http://localhost:8000/extract_article/${encodedUrl}`
      )
        .then((response) => response.json())
        .then((data) => console.log("data from api : ", data.text))
        .catch((error) => {
          console.error("Error:", error);
        });

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flashCardsWrapper">
      {isYoutube ? (
        <button onClick={createQuestionAnswers}>Generate Flashcards</button>
      ) : (
        <button onClick={handleTextExtraction}>Extract Text</button>
      )}
      {loading && <h3>Creating Flashcards...</h3>}
      {/* {!isYoutube && <h3>Website is not YouTube</h3>} */}
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
