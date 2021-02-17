import './App.css';
import Knugget from './Knugget.jpg';
import React from "react";
import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";

function App(props) 
{

  function dummy(value) {
    return "Let me see what I can do to help with " + value
  }
  let nextResponse = "Understandable, have a nice day!";

  const config = {
    width: "300px",
    height: "400px",
    floating: true,
    headerTitle: "KnugBot",
    placeholder: "Type response here",
    botAvatar: Knugget,
    hideUserAvatar: true
  };


  const steps = [
    {
     id: "Greeting",
     message: "It me, Knugget! Need some knugvising?",
     trigger: "2"
    },

    {
      id: '2',
      options: [
        { value: 1, label: 'Yes', trigger: '3' },
        { value: 2, label: 'No', trigger: '4' },
      ],
    },
    {
      id: '3',
      message: 'How can I help?',
      trigger: '5',
    },
    {
      id: '4',
      message: nextResponse,
      end: true,
    },

    {
      id: "5",
      user: true,
      trigger: 6,
     },
    {
      id: "6",
      message: dummy('{previousValue}'),
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
    userFontColor: "#000000"
   };

  return (
    <ThemeProvider theme={theme}>
      <div >
      <ChatBot 
        recognitionEnable={true}
        steps={steps} {...config} />
      </div>
    </ThemeProvider>
   );
}

export default App;
