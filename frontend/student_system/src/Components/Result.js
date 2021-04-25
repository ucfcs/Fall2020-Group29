import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Chatbot, { Loading } from "react-simple-chatbot";
import styles from "./Result.module.css";
import Linkify from "react-linkify";
import { route } from "../Constants/constants";

class Result extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      result: "",
      threshold: "",
      trigger: false,
      counter: 0,
      questionAsked: "",
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
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lookup),
    };
    try {
      let api_response = await fetch(route + "get-user-response", options);
      let result = await api_response.json();
      this.setState({
        loading: false,
        result: result.data.answer,
        threshold: result.data.probability,
        counter: counter,
        questionAsked: lookup,
      });
    } catch (err) {
      alert("try failed fo getting user response");
      console.log("error occurred", err);
    }
  }

  increment = () => {
    let count = this.state.counter;
    count++;
    sessionStorage.setItem("counter", count);
  };

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
    let response = await fetch(route + "save-question-asked", options);
    let result = await response.json();
    console.log(result);
  }

  resetWithString() {
    if (this.state.counter > 0) {
      sessionStorage.setItem("counter", 0);
      this.saveUnasweredQuestion();
    }
    return "sorry here's a contact";
  }

  triggerGreeting() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Greeting" });
    });
  }

  triggerMoreHelp(callback) {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "More Help" });
      if (callback !== undefined) {
        callback();
      }
    });
  }

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

  triggerSorryThankYou() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Sorry Thank you" });
    });
  }

  triggerAskAgainDifferently() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "ask again differently" });
    });
  }

  render() {
    const { trigger, loading, result, threshold } = this.state;

    if (this.state.counter >= 2) {
      if (result !== "no match") {
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

        if (threshold <= 0.5) {
          return (
            <div className={styles.body}>
              {loading ? <Loading /> : this.resetWithString()}
            </div>
          );
        }
      } else {
        return (
          <div className={styles.body}>
            {loading ? <Loading /> : this.resetWithString()}
          </div>
        );
      }
    } else {
      if (result !== "no match") {
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
      } else {
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
