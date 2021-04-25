import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Chatbot, { Loading } from "react-simple-chatbot";
import styles from "./Result.module.css";
import Linkify from "react-linkify";

class Result extends Component {
  constructor(props) {
    super(props);

    // sets initial states
    this.state = {
      loading: true,
      result: "",
      threshold: "",
      trigger: false,
      counter: 0,
      questionAsked: "",
      // wholeResponse: "",
    };

    this.resetWithString = this.resetWithString.bind(this);
  }

  async componentDidMount() {
    let counter = sessionStorage.getItem("counter");
    if (counter === undefined) {
      counter = 0;
      sessionStorage.setItem("counter", counter);
    }
    const { steps } = this.props;
    const lookup = steps.userInput.value;
    const input = { name: lookup };
    // stores returned data in api_response
    const api_response = await axios.post(
      "http://127.0.0.1:5000/api/get-user-response",
      input
    );
    // set the state to the relevant data it needs to hold
    this.setState({
      loading: false,
      result: api_response.data.answer,
      threshold: api_response.data.probability,
      counter: counter,
      questionAsked: lookup,
      // wholeResponse: api_response.data,
    });
  }

  // increments the counter and stores it back into local storage
  increment = () => {
    let count = this.state.counter;
    count++;
    sessionStorage.setItem("counter", count);
  };

  // resets the counter to 0 and stores it back to local storage
  reset = () => {
    sessionStorage.setItem("counter", 0);
  };

  async saveUnasweredQuestion() {
    const { steps } = this.props;
    const lookup = steps.userInput.value;
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lookup),
    };
    let response = await fetch(
      "http://127.0.0.1:5000/api/save-question-asked",
      options
    );
    let result = await response.json();
    console.log(result);
  }
  // reset the counter to 0 and returns a string to display on the UI
  resetWithString() {
    if (this.state.counter > 0) {
      sessionStorage.setItem("counter", 0);
      this.saveUnasweredQuestion();
    }
    // save the question to the database here
    // you can call another function that handles
    // that or just do it all in here
    return "sorry here's a contact";
  }

  // Triggers the next entity in the steps (from react-simple-chatbot)
  triggerGreeting() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Greeting" });
    });
  }

  // Step 2 from conversation design
  triggerMoreHelp(callback) {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "More Help" });
      if (callback !== undefined) {
        callback();
      }
    });
  }

  // triggers thank you
  triggerThankYou() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Thank you" });
    });
  }

  // triggers Even More Help
  triggerEvenMoreHelp() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Even More Help" });
    });
  }

  // triggers Sorry Thank you
  triggerSorryThankYou() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Sorry Thank you" });
    });
  }

  // triggers ask again differently
  triggerAskAgainDifferently() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "ask again differently" });
    });
  }

  // Renders the answer display box in the chatbot
  render() {
    // the constants that are passed in the render (state values)
    const { trigger, loading, result, threshold } = this.state;
    // console.log(wholeResponse);

    // if result if no match then ask again
    if (this.state.counter >= 2) {
      if (result !== "no match") {
        // Threshold 2 within else (if counter >= 2)
        if (threshold >= 0.99) {
          return (
            <div className={styles.body}>
              {loading ? <Loading /> : <Linkify>{result}</Linkify>}
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
                        className={styles.button}
                        onClick={() => {
                          this.triggerMoreHelp();
                          this.reset();
                        }}
                      >
                        Yes
                      </button>
                    )}
                    {!trigger && (
                      <button
                        onClick={() => {
                          this.triggerThankYou();
                          this.reset();
                        }}
                        className={styles.button}
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
            <div className={styles.body}>
              {loading ? <Loading /> : <Linkify>{result}</Linkify>}
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
                        onClick={() => {
                          this.triggerEvenMoreHelp();
                          this.reset();
                        }}
                        className={styles.button}
                      >
                        Yes
                      </button>
                    )}
                    {!trigger && (
                      <button
                        onClick={() => this.triggerMoreHelp()}
                        className={styles.button}
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

        // Threshold 1 within else (if counter >= 2)
        if (threshold <= 0.5) {
          return (
            <div className={styles.body}>
              {loading ? <Loading /> : this.resetWithString()}
            </div>
          );
        }
      }
      // else if result === no match
      else {
        return (
          <div className={styles.body}>
            {loading ? <Loading /> : this.resetWithString()}
          </div>
        );
      }
    } else {
      if (result !== "no match") {
        // Threshold 2 within counter < 2
        if (threshold >= 0.99) {
          return (
            <div className={styles.body}>
              {loading ? (
                <Loading />
              ) : (
                <Linkify className={styles.linkify}>{result}</Linkify>
              )}
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
                        className={styles.button}
                        onClick={() => {
                          this.triggerMoreHelp();
                          this.reset();
                        }}
                      >
                        Yes
                      </button>
                    )}
                    {!trigger && (
                      <button
                        onClick={() => {
                          this.triggerThankYou();
                          this.reset();
                        }}
                        className={styles.button}
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

        // Threshold  1 and 2 (.50 - .90) within counter < 2
        if (threshold < 0.99 && threshold > 0.5) {
          return (
            <div className={styles.body}>
              {loading ? <Loading /> : <Linkify>{result}</Linkify>}
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
                        onClick={() => {
                          this.triggerEvenMoreHelp();
                          this.reset();
                        }}
                        className={styles.button}
                      >
                        Yes
                      </button>
                    )}
                    {!trigger && (
                      <button
                        onClick={() => {
                          this.triggerAskAgainDifferently();
                          this.increment();
                        }}
                        className={styles.button}
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

        // Threshold 1 within counter < 2
        if (threshold < 0.5) {
          return (
            <div className={styles.body}>
              {loading ? (
                <Loading />
              ) : (
                "Sorry I don't quite understand your question. Could you try asking it slightly differently? "
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
                        onClick={() => {
                          this.triggerMoreHelp();
                          this.increment();
                        }}
                        className={styles.button}
                      >
                        Yes
                      </button>
                    )}
                    {!trigger && (
                      <button
                        onClick={() => {
                          this.triggerThankYou();
                          this.reset();
                        }}
                        className={styles.button}
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
      // if result === no match
      else {
        return (
          <div className={styles.body}>
            {loading ? (
              <Loading />
            ) : (
              "Couldn't find what you were looking for. Would you like to try again?"
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
                      onClick={() => {
                        this.triggerMoreHelp(this.increment);
                        // this.increment();
                      }}
                      className={styles.button}
                    >
                      Yes
                    </button>
                  )}
                  {!trigger && (
                    <button
                      onClick={() => {
                        this.triggerSorryThankYou();
                        this.reset();
                      }}
                      className={styles.button}
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
