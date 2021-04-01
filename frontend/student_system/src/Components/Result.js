import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import ChatBot, { Loading } from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";

class Result extends Component {
  constructor(props) {
    super(props);
    this.count = 0;

    // sets initial states
    this.state = {
      loading: true,
      result: "",
      threshold: "",
      //   count: 0,
      trigger: false,
    };

    // this.triggetNext("Greeting");
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
      threshold: api_response.data.probability,
      //   count: this.state.count + 1,
    });
  }

  // Triggers the next entity in the steps (from react-simple-chatbot)
  triggerGreeting() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Greeting" });
    });
    // this.count = this.count + 1;
    console.log("this is inside triggerNext" + this.count);
  }
  // Step 2 from conversation design
  triggerMoreHelp() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "More Help" });
    });
  }
  // trigger
  triggerThankYou() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Thank you" });
    });
  }

  triggerEvenMoreHelp() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Even More Help" });
    });
  }

  // Renders the answer display box in the chatbot
  render() {
    // the constants that are passed in the render (state values)
    const { trigger, loading, result, threshold } = this.state;

    console.log(threshold);
    // console.log(count);
    // if result if no match then ask again
    if (result !== "no match") {
      // Threshold 2
      if (threshold > 0.99) {
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
                Is there something else I can help you with?
                <div>
                  {!trigger && (
                    <button
                      onClick={() => this.triggerMoreHelp()}
                      style={{
                        backgroundColor: "#ffd700",
                        borderColor: "#ffd700",
                        color: "white",
                        borderWidth: 0,
                        borderRadius: 50,
                        height: 30,
                        margin: 10,
                        fontWeight: "bold",
                      }}
                    >
                      Yes
                    </button>
                  )}
                  {!trigger && (
                    <button
                      onClick={() => this.triggerThankYou()}
                      style={{
                        backgroundColor: "#ffd700",
                        borderColor: "#ffd700",
                        color: "white",
                        borderWidth: 0,
                        borderRadius: 50,
                        height: 30,
                        margin: 10,
                        width: 30,
                        fontWeight: "bold",
                      }}
                    >
                      No
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      // Threshold  1 and 2 (.50 - .90)
      if (threshold < 0.99 && threshold > 0.5) {
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
                Did this answer your question?
                <div>
                  {!trigger && (
                    <button
                      onClick={() => this.triggerEvenMoreHelp()}
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
                      Yes
                    </button>
                  )}
                  {!trigger && (
                    <button
                      onClick={() => this.triggerThankYou()}
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
                      No
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      // Threshold 1
      if (threshold <= 0.5) {
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
            {loading ? (
              <Loading />
            ) : (
              "Sorry I don't quite understand your question. Could you try to asking it slightly differently? "
            )}
            {!loading && (
              <div
                style={{
                  textAlign: "center",
                  margin: 20,
                }}
              >
                <div>
                  {!trigger && (
                    <button
                      onClick={() => this.triggerMoreHelp()}
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
                      Yes
                    </button>
                  )}
                  {!trigger && (
                    <button
                      onClick={() => this.triggerThankYou()}
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
                      No
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }
    }

    // could not find any result
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
        {loading ? (
          <Loading />
        ) : (
          "couldn't find what you were looking for would you like to try again?"
        )}
        {!loading && (
          <div
            style={{
              textAlign: "center",
              margin: 20,
            }}
          >
            <div>
              {!trigger && (
                <button
                  onClick={() => this.triggerMoreHelp()}
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
                  Yes
                </button>
              )}
              {!trigger && (
                <button
                  onClick={() => this.triggerThankYou()}
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
                  No
                </button>
              )}
            </div>
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

export default Result;
