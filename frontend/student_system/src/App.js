import "./App.css";
import Knugget from "./Knugget.jpg";
import React, { useState, useEffect, Component } from "react";
import ChatBot, { Loading } from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import axios from "axios";
import PropTypes from "prop-types";

class Result extends Component {
  constructor(props) {
    super(props);

    // sets initial states
    this.state = {
      loading: true,
      department: "",
      category: "",
      result: "",
      trigger: false,
    };

    this.triggetNext = this.triggetNext.bind(this);
  }
  async componentDidMount() {
    const { steps } = this.props;
    const lookup = steps.userInput.value;
    const input = { name: lookup };
    // stores returned data in api_response
    const api_response = await axios.post(
      "http://127.0.0.1:5000/api/user-response",
      input
    );
    // set the state to the relevant data it needs to hold
    this.setState({
      loading: false,
      result: api_response.data.answer,
      department: api_response.data.department,
      category: api_response.data.category,
    });
  }
  triggetNext() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep();
    });
  }
  render() {
    const { trigger, loading, department, category, result } = this.state;
    console.log(department);
    console.log(category);
    console.log(result);
    return (
      <div
        style={{
          textAlign: "center",
          padding: 15,
          marginTop: 20,
          marginLeft: 10,
          marginRight: 10,
          fontFamily: "Arial",
          fontSize: "11pt",
          backgroundColor: "#eee",
          borderRadius: 25,
        }}
      >
        {loading ? <Loading /> : result}
        {!loading && (
          <div
            style={{
              textAlign: "center",
              margin: 20,
            }}
          >
            {!trigger && (
              <button
                onClick={() => this.triggetNext()}
                style={{
                  backgroundColor: "#ffd700",
                  borderColor: "#ffd700",
                  color: "white",
                  borderWidth: 0,
                  borderRadius: 50,
                  height: 20,
                  fontWeight: "bold",
                }}
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}
Result.propTypes = {
  steps: PropTypes.object,
  triggerNextStep: PropTypes.func,
};

Result.defaultProps = {
  steps: undefined,
  triggerNextStep: undefined,
};

function App(props) {
  // Dummy Function to return some data to the chatbot
  function dummy(value) {
    return "Let me see what I can do to help with " + value;
  }
  let nextResponse = "Understandable, have a nice day!";

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
      trigger: "3",
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
