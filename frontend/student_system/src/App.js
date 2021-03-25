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
    const api_response = await axios.post(
      "http://127.0.0.1:4999/api/user-response",
      input
    );
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
    // console.log(department);
    // console.log(category);
    console.log(result);
    return (
      <div
        style={{
          textAlign: "center",
          padding: 15,
          margin: 30,
          fontFamily: "Arial",
          fontSize: "12pt",
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
              <button onClick={() => this.triggetNext()}>Try again</button>
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
  // const [result, setResult] = useState(null);
  // // const [userData, setUserData] = useState(null);
  // // const [category, setCategory] = useState(null);
  // // const [department, setDepartment] = useState(null);

  // // UseEffect Hook to make a POST request
  // // console.log(userData);
  // useEffect(() => {
  //   if (userData != null) {
  //     // POST request using axios inside useEffect React hook
  //     const getResponse = async () => {
  //       const article = { name: userData };
  //       let api_data = await axios.post(
  //         "http://127.0.0.1:5000/api/user-response",
  //         article
  //       );
  //       setResult(api_data.data.dept);
  //       console.log(api_data.data.dept, typeof api_data.data);
  //     };
  //     getResponse();
  //   }
  // console.log(userData);
  // }, [userData]);
  // console.log("result", result);
  // let newResult = JSON.stringify(result);
  // console.log(newResult);

  function dummy(value) {
    // console.log(value);
    // setUserData(value);

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
      trigger: "Greeting",
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
