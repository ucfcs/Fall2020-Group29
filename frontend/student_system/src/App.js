import "./App.css";
import Knugget from "./Knugget.jpg";
import React from "react";
import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import Result from "./Components/Result";
import ThankYou from "./Components/ThankYou";

function App(props) {
  sessionStorage.setItem("counter", 0);

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
      message: "Understandable, have a nice day!",
      end: true,
    },

    {
      id: "userInput",
      user: true,
      trigger: "6",
    },
    {
      id: "6",
      message: "Let me find that out for you!",
      trigger: "7",
    },

    {
      id: "7",
      component: <Result />,
      waitAction: true,
      trigger: "More Help",
    },
    {
      id: "ask again differently",
      message:
        "Sorry, I do not understand your question. Could you try asking it slightly differently?",
      trigger: "userInput",
    },
    {
      id: "Even More Help",
      message: "Is there something else I can assist you with?",
      trigger: "help options",
    },
    {
      id: "help options",
      options: [
        { value: 1, label: "Yes", trigger: "More Help" },
        { value: 2, label: "No", trigger: "Thank you" },
      ],
    },
    {
      id: "Thank you",
      message: "Perfect! Glad I could help!",
      trigger: "feedback",
    },
    {
      id: "Sorry Thank you",
      message:
        "I am sorry, I wish I could be of more help. Would you mind answering the next few questions so I can improve my knugskills to serve you better?",
      trigger: "feedback",
    },
    {
      id: "feedback",
      message: "Was your question answered to your satisfaction?",
      trigger: "answer",
    },
    {
      id: "answer",
      options: [
        { value: "yes", label: "Yes", trigger: "chat-feedback" },
        { value: "no", label: "No", trigger: "chat-feedback" },
      ],
    },
    {
      id: "chat-feedback",
      message: "How much did you enjoy chatting with me?",
      trigger: "enjoyment",
    },
    {
      id: "enjoyment",
      options: [
        { value: "1", label: "1", trigger: "ease-feedback" },
        { value: "2", label: "2", trigger: "ease-feedback" },
        { value: "3", label: "3", trigger: "ease-feedback" },
        { value: "4", label: "4", trigger: "ease-feedback" },
        { value: "5", label: "5", trigger: "ease-feedback" },
      ],
    },
    {
      id: "ease-feedback",
      message: "How easy was it to chat with me?",
      trigger: "ease",
    },
    {
      id: "ease",
      options: [
        { value: "1", label: "1", trigger: "thanks-feedback" },
        { value: "2", label: "2", trigger: "thanks-feedback" },
        { value: "3", label: "3", trigger: "thanks-feedback" },
        { value: "4", label: "4", trigger: "thanks-feedback" },
        { value: "5", label: "5", trigger: "thanks-feedback" },
      ],
    },
    {
      id: "thanks-feedback",
      component: <ThankYou />,
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
