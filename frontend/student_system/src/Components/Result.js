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
      followUp: "",
    };
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
    try {
      const api_response = await axios.post(route + "get-user-response", input);
      this.setState(
        {
          loading: false,
          result: api_response.data.answer,
          threshold: api_response.data.probability,
          counter: counter,
          questionAsked: lookup,
          followUp: await api_response.data.followUp,
        },
        () => {
          if (
            this.state.counter >= 2 &&
            (this.state.result === "no match" || this.state.threshold <= 0.75)
          ) {
            this.saveUnasweredQuestion();
          }
          this.incNumOfQuestionsAsked();
          if (this.state.result !== "no match" && this.state.threshold >= 0.9) {
            this.incNumOfQuestionsAnsweredCorrectly();
          }
        }
      );
    } catch (err) {
      alert("Request Failed");
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

  async incReferredToAdvisor() {
    let options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: "test string",
    };
    let response = await fetch(route + "increment-metric-4", options);
    let result = await response.json();
    console.log(result);
  }

  async incNumOfQuestionsAsked() {
    let options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: "test string",
    };
    let response = await fetch(route + "increment-metric-2", options);
    let result = await response.json();
    console.log(result);
  }

  async incNumOfQuestionsAnsweredCorrectly() {
    let options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: "test string",
    };
    let response = await fetch(route + "increment-metric-3", options);
    let result = await response.json();
    console.log(result);
  }

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

  triggerGreeting() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Greeting" });
    });
  }

  triggerMoreHelp() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "More Help" });
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

  // async handleFollowUp() {
  //   let followUp = this.state.followUp;
  //   console.log(followUp);
  //   let options = {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ name: followUp }),
  //   };
  //   const response = await fetch(route + "get-user-response", options);
  //   const result = await response.json();
  //   console.log(result);
  // }

  render() {
    const { trigger, loading, result, threshold, followUp } = this.state;
    if (this.state.counter >= 2) {
      if (result !== "no match") {
        if (threshold >= 0.9) {
          return (
            <div className={styles.body}>
              {loading ? (
                <Loading />
              ) : (
                <Linkify properties={{ target: "_blank" }}>{result}</Linkify>
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
        } else if (threshold < 0.9 && threshold > 0.75) {
          return (
            <div className={styles.body}>
              {loading ? (
                <Loading />
              ) : (
                <Linkify properties={{ target: "_blank" }}>{result}</Linkify>
              )}
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
                          this.incNumOfQuestionsAnsweredCorrectly();
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
        } else {
          return (
            <div className={styles.body}>
              {loading ? (
                <Loading />
              ) : (
                <Linkify>
                  Sorry I don't have the knug wisdom to answer your question.
                  For questions related to CS undergraduate advising, please
                  contact Jenny Shen at Jenny.Shen@ucf.edu, for IT undergraduate
                  advising contact Sean Donovan at Sean.Donovan@ucf.edu.
                  Otherwise please contact the appropriate department.
                </Linkify>
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
      } else {
        return (
          <div className={styles.body}>
            {loading ? (
              <Loading />
            ) : (
              <Linkify>
                Sorry I don't have the knug wisdom to answer your question. For
                questions related to CS undergraduate advising, please contact
                Jenny Shen at Jenny.Shen@ucf.edu, for IT undergraduate advising
                contact Sean Donovan at Sean.Donovan@ucf.edu. Otherwise please
                contact the appropriate department.
              </Linkify>
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
    } else if (this.state.counter < 2) {
      if (result !== "no match") {
        if (threshold >= 0.9) {
          return (
            <div className={styles.body}>
              {loading ? (
                <Loading />
              ) : (
                <Linkify target="_blank" className={styles.linkify}>
                  {result}
                </Linkify>
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
        } else if (threshold < 0.9 && threshold > 0.75) {
          return (
            <div className={styles.body}>
              {loading ? (
                <Loading />
              ) : (
                <Linkify properties={{ target: "_blank" }}>{result}</Linkify>
              )}
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
                          this.incNumOfQuestionsAnsweredCorrectly();
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
        } else if (threshold <= 0.75) {
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
