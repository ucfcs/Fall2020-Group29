import "./App.css";
import React, { useEffect, useState } from "react";
import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import axios from "axios";

function App(props) {
  const [Data, setData] = useState(null);
  useEffect(() => {
    const getData = async () => {
      let api_data = (
        await axios.get("http://127.0.0.1:5000/api/knugget-response")
      ).data.name;
      setData(api_data);
      console.log(api_data, typeof api_data);
    };
    getData();
  }, []);
  const config = {
    width: "300px",
    height: "400px",
    floating: true,
    headerTitle: "KnugBot",
    placeholder: "Type response here",
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
      // You can say how can i help you?
      message: "How can I help you?",
      trigger: "5",
    },
    {
      id: "4",
      message: "Have a great day!",
      end: true,
    },

    {
      id: "5",
      user: true,
      trigger: 6,
    },

    {
      id: "6",
      message: Data,
      end: true,
    },
  ];

  const theme = {
    background: "#fff",
    fontFamily: "Arial",
    headerBgColor: "gold",
    headerFontColor: "#fff",
    headerFontSize: "15px",
    botBubbleColor: "#eee",
    botFontColor: "black",
    userBubbleColor: "#fff",
    userFontColor: "black",
  };

  return Data ? (
    <ThemeProvider theme={theme}>
      <ChatBot steps={steps} {...config} />
    </ThemeProvider>
  ) : null;
}

export default App;
