import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import { EJSON } from "meteor/ejson";
import { Image, Button, Item, Segment, Input, Grid } from "semantic-ui-react";
import BusinessItem from "./BusinessItem.jsx";
import EventItem from "./EventItem.jsx";
import UserProfile from "./UserProfile.jsx";
import Map from "./Map.jsx";
import { Events } from "../api/events.js";
import "../../client/main.css";

class MainContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lat: 0,
      longt: 0,
      message: "",
      businesses: [],
      isloading: false,
      location: "",
      mouseOver: []
    };
    this.onChange = this.onChange.bind(this);
    this.onKey = this.onKey.bind(this);
    this.handleClear = this.handleClear.bind(this);
  }

  renderBusinesses() {
    return this.state.businesses.map((c, index) => (
      // const className = c.highLight ? "res-hover" : "res-item";
      //const resInfo = c.info;
      // return (
      <BusinessItem
        key={c._id}
        content={c}
        isMouseOver={this.state.mouseOver[index]}
        changeFunction={() => this.changeMouseOverStatus(index)}
      />
    ));
  }

  changeMouseOverStatus(index) {
    const newArray = this.state.mouseOver.slice();
    newArray[index] = !newArray[index];
    this.setState({
      mouseOver: newArray
    });
  }

  renderMap() {
    return (
      <Map
        markers={this.state.businesses}
        isMouseOverArray={this.state.mouseOver}
        changeFunction={i => this.changeMouseOverStatus(i)}
      />
    );
  }

  componentDidMount() {
    let lat = 0.0;
    let longt = 0.0;
    navigator.geolocation.getCurrentPosition(position => {
      // get current location
      lat = position.coords.latitude;
      longt = position.coords.longitude;
      console.log("--------latitude:  " + lat + "    longitude:  " + longt);
      this.setState({
        lat: lat,
        longt: longt
      });
      console.log("latitude:  " + lat + "    longitude:  " + longt);
    });
  }
  //Update state.message upon input update
  onChange(evt) {
    console.log("change", evt.target.value);
    this.setState({
      message: evt.target.value
    });
    console.log("After change  ", this.state.message);
    let lat = 0.0;
    let longt = 0.0;
    navigator.geolocation.getCurrentPosition(position => {
      // get current location
      lat = position.coords.latitude;
      longt = position.coords.longitude;
      //console.log("--------latitude:  " + lat + "    longitude:  " + longt);
      this.setState({
        lat: lat,
        longt: longt
      });
      //console.log("latitude:  " + lat + "    longitude:  " + longt);
    });
  }

  // When user press Enter, get current location, and send location, input text to server.
  // Server would call Yelp api and return an array of businesses. Update returned array in state.businesses
  onKey(evt) {
    if (evt.key === "Enter") {
      this.setState({ isloading: true });
      if (navigator.geolocation) {
        // call backend yelp api
        console.log(
          "KEYPRESS_____latitude:  " +
            this.state.lat +
            "    longitude:  " +
            this.state.longt
        );
        this.setState({
          businesses: [],
          mouseOver: []
        });

        let params = {
          latitude: this.state.lat,
          longitude: this.state.longt,
          radius: 30000,
          term: this.state.message
        };

        if (this.state.location.length === 0) {
          params = {
            latitude: this.state.lat,
            longitude: this.state.longt,
            radius: 30000,
            term: this.state.message
          };
        } else {
          params = {
            location: this.state.location,
            radius: 30000,
            term: this.state.message
          };
        }
        console.log("here!!" + this.state.location);
        //refactorr call
        Meteor.call("searchYelp", params, (err, res) => {
          console.log("API");
          if (err) {
            alert("Error calling Yelp API");
            console.log(err);
            return;
          }
          // Format returned result, and set it in the state
          let businessesArr = EJSON.parse(res["content"])["businesses"];
          this.setState({
            businesses: businessesArr,
            isloading: false,
            mouseOver: Array(businessesArr.length).fill(false)
          });
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    }
  }

  handleClear() {
    this.setState({ businesses: [], message: "" });
  }

  renderNewEvents() {
    return this.props.newEvents.map(c => <EventItem key={c._id} myEvent={c} />);
  }

  render() {
    return (
      <Grid columns={3}>
        <Grid.Row centered>
          <Grid.Column textAlign="center">
            <span>
              <h1 id="pizza">
                <span role="img" aria-label="emoji">
                  🍕
                </span>
                pizzaMate
              </h1>
            </span>

            <div>
              <Input
                label={"Search"}
                loading={this.state.isloading}
                icon="search"
                type="text"
                placeholder="restaurants"
                value={this.state.message}
                onChange={this.onChange.bind(this)}
                onKeyPress={this.onKey.bind(this)}
                aria-label="search"
              />
              <Input
                label={"Near"}
                loading={this.state.isloading}
                icon="search"
                type="text"
                placeholder="location"
                value={this.state.location}
                onChange={e => this.setState({ location: e.target.value })}
                onKeyPress={this.onKey.bind(this)}
                aria-label="search-location"
              />
              {this.state.businesses.length === 0 ? null : (
                <Button
                  basic
                  color={"red"}
                  content="Clear Results"
                  onClick={this.handleClear.bind(this)}
                />
              )}
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row centered>
          <Grid.Column width={4}>
            <UserProfile content={Meteor.user()} />
          </Grid.Column>
          <Grid.Column width={7}>{this.renderMap()}</Grid.Column>
          <Grid.Column width={5}>
            <Segment style={{ overflow: "auto", maxHeight: 900 }}>
              {this.state.isloading ? (
                <Image size={"large"} src={"imgs/loading.gif"} centered />
              ) : this.state.businesses.length === 0 ? (
                <Item.Group>
                  <Item>
                    <Item.Content verticalAlign="middle">
                      <Item.Header>New Events Near You</Item.Header>
                    </Item.Content>
                  </Item>
                  <div className="ui divider" />
                  {this.renderNewEvents()}
                </Item.Group>
              ) : (
                this.renderBusinesses()
              )}
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

MainContainer.propTypes = {
  newEvents: PropTypes.arrayOf(PropTypes.object)
};

export default withTracker(() => {
  Meteor.subscribe("newEvents");

  return {
    newEvents: Events.find({}, { sort: { createAt: -1 } }).fetch()
  };
})(MainContainer);
