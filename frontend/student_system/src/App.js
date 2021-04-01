import "./App.css";
import Knugget from "./Knugget.jpg";
import React, { useState, useEffect, Component } from "react";
import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import Result from "./Components/Result";

function App(props) {
  // const [count, setCount] = useState(0);

  // Dummy Function to return some data to the chatbot
  const dummy = (value) => {
    return "Let me see what I can do to help with " + value;
  };

  let nextResponse = "Understandable, have a nice day!";
  // setCount(34);
  const config = {
    width: "300px",
    height: "400px",
    floating: true,
    headerTitle: "KnugBot",
    placeholder: "Type response here",
    botAvatar: Knugget,
    hideUserAvatar: true,
  };

  const steps = [
    {
      id: "Greeting",
      message: "It me, Knugget! Need some knugvising?",
      trigger: "2",
    },

    {
      id: "2",
      options: [
        { value: 1, label: "Yes", trigger: "More Help" },
        { value: 2, label: "No", trigger: "4" },
      ],
    },
    {
      id: "More Help",
      message: "How can I help?",
      trigger: "userInput",
    },
    {
      id: "4",
      message: nextResponse,
      end: true,
    },

    {
      id: "userInput",
      user: true,
      trigger: "6",
    },
    {
      id: "6",
      // this will send a string to the dummy function instead of an object.
      // message: ,
      message: ({ previousValue }) => dummy(previousValue),
      trigger: "7",
    },
    {
      id: "7",
      component: <Result />,
      waitAction: true,
      trigger: "More Help",
    },

    {
      id: "Even More Help",
      message: "Is there something else I can assist you with?",
      trigger: "help options",
    },

    {
      id: "help options",
      // message: "Heloooo",
      options: [
        { value: 1, label: "Yes", trigger: "More Help" },
        { value: 2, label: "No", trigger: "Thank you" },
      ],
    },
    {
      id: "Thank you",
      message: "Perfect! Glad I could help!",
      // trigger: "Feedback",
      end: true,
    },
  ];

  const theme = {
    background: "#fff",
    fontFamily: "Arial",
    headerBgColor: "#ffd700",
    headerFontColor: "#fff",
    headerFontSize: "15px",
    botBubbleColor: "#eee",
    botFontColor: "#000000",
    userBubbleColor: "#fff",
    userFontColor: "#000000",
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <ChatBot recognitionEnable={true} steps={steps} {...config} />
      </div>
    </ThemeProvider>
  );
}

export default App;
