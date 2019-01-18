import React, { Component } from "react";
import { connect } from "react-redux";
import { incrementCounter, decrementCounter } from "./testActions";
import { Button } from "semantic-ui-react";

const mapStateToProps = state => ({
  data: state.test.data
});

const actions = {
  incrementCounter,
  decrementCounter
};

class TestComponent extends Component {
  render() {
    const { data, incrementCounter, decrementCounter } = this.props;
    return (
      <div>
        <h1>Test Area</h1>
        <h3>Answer is {data} </h3>
        <Button onClick={incrementCounter} color="green">
          Increment
        </Button>
        <Button onClick={decrementCounter} color="red">
          Decrement
        </Button>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  actions
)(TestComponent);
