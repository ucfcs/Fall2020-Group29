import React, { Component } from "react";
// import ChatBot, { Loading } from "react-simple-chatbot";
// import { ThemeProvider } from "styled-components";
import axios from "axios";
import PropTypes from "prop-types";
import styles from "./ThankYou.module.css";
import { route } from "../Constants/constants";

class ThankYou extends Component {
  constructor(props) {
    super(props);

    this.state = {
      feedbackConf: "",
    };
  }

  async componentDidMount() {
    const { steps } = this.props;
    const ease = steps.ease.value;
    const answer = steps.answer.value;
    const enjoyment = steps.enjoyment.value;
    const input = { answer: answer, enjoyment: enjoyment, ease: ease };
    const response = await axios.post(route + "submit-feedback", input);
    this.setState({ feedbackConf: response });
  }

  render() {
    const { feedbackConf } = this.state;
    console.log(feedbackConf);
    return (
      <div className={styles.body}>
        <p>Thanks! Your data was submitted successfully!</p>
      </div>
    );
  }
}

ThankYou.propTypes = {
  steps: PropTypes.object,
};

ThankYou.defaultProps = {
  steps: undefined,
};

export default ThankYou;
