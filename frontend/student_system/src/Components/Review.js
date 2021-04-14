import React, { useState, useEffect, Component } from "react";
import ChatBot, { Loading } from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import axios from "axios";
import PropTypes from "prop-types";

class Review extends Component {
  constructor(props) {
    super(props);

    this.state = {
      answer: "",
      enjoyment: "",
      ease: "",
    };
  }

  componentWillMount() {
    const { steps } = this.props;
    const { answer, enjoyment, ease } = steps;

    this.setState({ answer, enjoyment, ease });
  }

  render() {
    const { answer, enjoyment, ease } = this.state;
    return (
      <div style={{ width: "100%" }}>
        <h3>Summary</h3>
        <table>
          <tbody>
            <tr>
              <td>answer</td>
              <td>{answer.value}</td>
            </tr>
            <tr>
              <td>enjoyment</td>
              <td>{enjoyment.value}</td>
            </tr>
            <tr>
              <td>ease</td>
              <td>{ease.value}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

Review.propTypes = {
  steps: PropTypes.object,
};

Review.defaultProps = {
  steps: undefined,
};

export default Review;
