import React, { Component } from "react";
import { connect } from "react-redux";
import { incrementCounter, decrementCounter } from "./testActions";
import { Button } from "semantic-ui-react";

//react places autocomplete
import Script from "react-load-script";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";

//modals
import { openModal } from "../modals/modalActions";
const mapStateToProps = state => ({
  data: state.test.data
});

const actions = {
  incrementCounter,
  decrementCounter,
  openModal
};

class TestComponent extends Component {
  state = {
    address: "",
    scriptLoaded: false
  };

  handleScriptLoad = () => {
    this.setState({ scriptLoaded: true });
  };

  handleFormSubmit = event => {
    event.preventDefault();

    geocodeByAddress(this.state.address)
      .then(results => getLatLng(results[0]))
      .then(latLng => console.log("Success", latLng))
      .catch(error => console.error("Error", error));
  };

  onChange = address => this.setState({ address });
  render() {
    const inputProps = {
      value: this.state.address,
      onChange: this.onChange
    };

    const { data, incrementCounter, decrementCounter, openModal } = this.props;
    return (
      <div>
        <Script
          url="https://maps.googleapis.com/maps/api/js?key=AIzaSyCB53Xfnm1XrNsP01Fr_hB1zPQAyaeaElY&libraries=places"
          onLoad={this.handleScriptLoad}
        />
        <h1>Test Area</h1>
        <h3>Answer is {data} </h3>
        <Button onClick={incrementCounter} color="green">
          Increment
        </Button>
        <Button onClick={decrementCounter} color="red">
          Decrement
        </Button>

        <Button
          onClick={() => openModal("TestModal", { data: 43 })}
          color="teal"
        >
          Open Modal
        </Button>
        <br />
        <br />
        <form onSubmit={this.handleFormSubmit}>
          {this.state.scriptLoaded && (
            <PlacesAutocomplete inputProps={inputProps} />
          )}

          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  actions
)(TestComponent);
