/* eslint-disable no-undef */
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { HTTP } from "meteor/http";
import "../imports/api/events.js";
import "../imports/api/messages.js";
import { ServiceConfiguration } from "meteor/service-configuration";
import { WebApp } from "meteor/webapp";

WebApp.addHtmlAttributeHook(() => ({ lang: "en" }));

const methodName = {
  type: "method",
  name: "searchYelp"
};

if (Meteor.isServer) {
  DDPRateLimiter.addRule(
    {
      methodName
    },
    4,
    1000
  );
}

const settings = Meteor.settings.google;

if (settings) {
  ServiceConfiguration.configurations.remove({
    service: "google"
  });

  ServiceConfiguration.configurations.insert({
    service: "google",
    clientId: settings.clientId,
    secret: settings.secret
  });
}

Accounts.onCreateUser((options, user) => {
  user.profile = user.services.google;
  user.profile.interestedEvents = [];
  user.profile.joinedEvents = [];
  return user;
});

const API_KEY = Meteor.settings.yelp.apiKey;

Meteor.methods({
  searchYelp(params) {
    console.log("para" + params);
    const URL = "https://api.yelp.com/v3/businesses/search";
    const options = {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      },
      params: params
    };
    return HTTP.get(URL, options);
  },
  getYelpDetail(id) {
    check(id, String);
    const URL = `https://api.yelp.com/v3/businesses/${id}`;
    const options = {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    };
    return HTTP.get(URL, options);
  },

  getMapToken() {
    return Meteor.settings.mapbox.token;
  }
});

Meteor.startup(() => {});
