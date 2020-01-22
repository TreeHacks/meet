import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import './index.scss';
import Table from './js/table';
import MeetForm from './js/form';
import * as serviceWorker from './js/serviceWorker';
import API from "@aws-amplify/api";
import queryString from "query-string";

const LOGIN_URL = process.env.REACT_APP_LOGIN_URL;
const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;

export const custom_header = async () => {
  return { Authorization: await localStorage.getItem("jwt") }
}
API.configure({
  endpoints: [
    {
      name: "treehacks",
      endpoint: ENDPOINT_URL,
      custom_header: custom_header
    }
  ]
});

export function parseJwt(token) {
  var base64UrlSplit = token.split('.');
  if (!base64UrlSplit) return null;
  const base64Url = base64UrlSplit[1];
  if (!base64Url) return null;
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

function getCurrentUser() {
  const jwt = getJwt();
  if (jwt) {
    // Verify JWT here.
    const parsed = parseJwt(jwt);
    if (!parsed) {
      console.log("JWT invalid");
    }
    else if (new Date().getTime() / 1000 >= parseInt(parsed.exp)) {
      console.log("JWT expired");
      // TODO: add refresh token logic if we want here.
    }
    else {
      let attributes = { "name": parsed["name"], "email": parsed["email"], "email_verified": parsed["email_verified"], "cognito:groups": parsed["cognito:groups"] };
      return {
        "username": parsed["sub"],
        attributes
      };
    }
  }
  // If JWT from SAML has expired, or if there is no JWT in the first place, run this code.
  throw "No current user";
}

function getJwt() {
  return localStorage.getItem("jwt");
}

function logout() {
  localStorage.removeItem("jwt");
  window.location.href = `${LOGIN_URL}/logout?redirect=${window.location.href}`;
}

function login() {
  window.location.href = `${LOGIN_URL}?redirect=${window.location.href}`;
}

const hash = queryString.parse(window.location.hash);
if (hash && hash.jwt) {
  localStorage.setItem("jwt", hash.jwt);
  window.location.hash = "";
}


function Main() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    try {
      setUser(getCurrentUser());
    }
    catch(e) {
      login();
    }
  }, []);

  return (
    <BrowserRouter>
      <div>
        <div id="page-elems">
          <Link to="/">table</Link>
          <Link to="/form">form</Link>
        </div>
        <Switch>
          <Route path="/form">
            <MeetForm user={user} />
          </Route>
          <Route path="/">
            <Table user={user} />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.render(<Main />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
