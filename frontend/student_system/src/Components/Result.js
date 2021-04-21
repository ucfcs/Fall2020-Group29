import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Chatbot, { Loading } from "react-simple-chatbot";
import styles from "./Result.module.css";

class Result extends Component {
  constructor(props) {
    super(props);

    // sets initial states
    this.state = {
      loading: true,
      result: "",
      threshold: "",
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
    });
  }

  // increments the counter and stores it back into local storage
  increment = () => {
    let count = sessionStorage.getItem("counter");
    count++;
    sessionStorage.setItem("counter", count);
  };

  // resets the counter to 0 and stores it back to local storage
  reset = () => {
    sessionStorage.setItem("counter", 0);
  };

  // Triggers the next entity in the steps (from react-simple-chatbot)
  triggerGreeting() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Greeting" });
    });
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

  triggerSorryThankYou() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep({ trigger: "Sorry Thank you" });
    });
  }

  // Renders the answer display box in the chatbot
  render() {
    // the constants that are passed in the render (state values)
    const { trigger, loading, result, threshold } = this.state;
    // console.log(threshold);
    let counter = sessionStorage.getItem("counter");
    console.log("this is counter " + counter);

    // if result if no match then ask again
    if (counter < 2) {
      if (result !== "no match") {
        // Threshold 2
        if (threshold > 0.99) {
          return (
            <div className={styles.body}>
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
                        className={styles.button}
                        onClick={() => {
                          this.triggerMoreHelp();
                          // this.increment();
                        }}
                      >
                        Yes
                      </button>
                    )}
                    {!trigger && (
                      <button
                        onClick={() => {
                          this.triggerThankYou();
                          // this.reset();
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

        // Threshold 1
        if (threshold <= 0.5) {
          return (
            <div className={styles.body}>
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
                  {/* <div>
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
                    )} */}
                  {/* </div> */}
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
    // could not find any result
    else {
      if (result !== "no match") {
        // Threshold 2
        if (threshold > 0.99) {
          return (
            <div className={styles.body}>
              {loading ? <Loading /> : result}
              {!loading && (
                <div
                  style={{
                    textAlign: "center",
                    margin: 20,
                  }}
                >
                  I have reached thank u counter works
                  <div>
                    {!trigger && (
                      <button
                        className={styles.button}
                        onClick={() => {
                          this.triggerMoreHelp();
                          // this.increment();
                        }}
                      >
                        Yes
                      </button>
                    )}
                    {!trigger && (
                      <button
                        onClick={() => {
                          this.triggerThankYou();
                          // this.reset();
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

        // Threshold 1
        if (threshold <= 0.5) {
          return (
            <div className={styles.body}>
              {loading ? (
                <Loading />
              ) : (
                "Sorry I don't think I have the knug wisdom to answer your question. Please email a qualified personnel "
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
                      onClick={() => this.triggerMoreHelp()}
                      className={styles.button}
                    >
                      Yes
                    </button>
                  )}
                  {!trigger && (
                    <button
                      onClick={() => this.triggerSorryThankYou()}
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
                  onClick={() => this.triggerMoreHelp()}
                  className={styles.button}
                >
                  Yes
                </button>
              )}
              {!trigger && (
                <button
                  onClick={() => this.triggerSorryThankYou()}
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
Result.propTypes = {
  steps: PropTypes.object,
  triggerNextStep: PropTypes.func,
};

Result.defaultProps = {
  steps: undefined,
  triggerNextStep: undefined,
};

export default Result;
