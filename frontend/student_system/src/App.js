import "./App.css";
import Knugget from "./Knugget.jpg";
import React, { useState, useEffect } from "react";
import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import axios from "axios";

function App(props) {
  const [articleId, setArticleId] = useState(null);
  const [userData, setUserData] = useState(null);
  // const [department, setDepartment] = useState(null);

  function dummy(value) {
    // console.log(value);
    setUserData(value);

    return "Let me see what I can do to help with " + value;
  }
  let nextResponse = "Understandable, have a nice day!";

  // UseEffect Hook to make a POST request
  // console.log(userData);
  useEffect(() => {
    if (userData != null) {
      // POST request using axios inside useEffect React hook
      const article = { name: userData };
      // console.log(userData);
      axios
        .post("http://127.0.0.1:5000/api/user-response", article)
        .then((response) => setArticleId(response.data));
    }
    // console.log(userData);
  }, [userData]);

  // data returned from the AI system is stored in articleId.
  console.log(articleId);
  let department;
  if (articleId != null) {
    department = JSON.stringify(articleId["dept"]);
  }
  console.log(department);

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
        { value: 1, label: "Yes", trigger: "3" },
        { value: 2, label: "No", trigger: "4" },
      ],
    },
    {
      id: "3",
      message: "How can I help?",
      trigger: "5",
    },
    {
      id: "4",
      message: nextResponse,
      end: true,
    },

    {
      id: "5",
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
      message: "department: " + department + " category: ",
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
