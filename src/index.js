import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "./index.scss";
import Table from "./js/table";
import MeetForm from "./js/form";
import JobsPage from "./js/jobs.js";
import IdeasPage from "./js/ideas.js";
import TeamsPage from "./js/teams.js";
import ViewProfile from "./js/view_profile.js";
import * as serviceWorker from "./js/serviceWorker";
import API from "@aws-amplify/api";
import queryString from "query-string";
import logo from "./svg/logo.svg";
import UserProfile from "./js/userProfile";
import SponsorAdminPage from "./js/sponsorAdmins";

const LOGIN_URL = process.env.REACT_APP_LOGIN_URL;
const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;

export const custom_header = async () => {
  return { Authorization: await localStorage.getItem("jwt") };
};
API.configure({
  endpoints: [
    {
      name: "treehacks",
      endpoint: ENDPOINT_URL,
      custom_header: custom_header,
    },
  ],
});

export function parseJwt(token) {
  var base64UrlSplit = token.split(".");
  if (!base64UrlSplit) return null;
  const base64Url = base64UrlSplit[1];
  if (!base64Url) return null;
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(base64));
}

function getCurrentUser() {
  const jwt = getJwt();
  if (jwt) {
    // Verify JWT here.
    const parsed = parseJwt(jwt);
    if (!parsed) {
      console.log("JWT invalid");
    } else if (new Date().getTime() / 1000 >= parseInt(parsed.exp)) {
      console.log("JWT expired");
      // TODO: add refresh token logic if we want here.
    } else {
      let attributes = {
        name: parsed["name"],
        email: parsed["email"],
        email_verified: parsed["email_verified"],
        "cognito:groups": parsed["cognito:groups"],
      };
      return {
        username: parsed["sub"],
        attributes,
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
    const token = new URLSearchParams(window.location.search).get("tkn");

    // if an admin isn't registering an account
    if (!token)
      try {
        setUser(getCurrentUser());
      } catch (e) {
        login();
      }
  }, []);
  let user_url = user && user.username ? "/users/" + user.username : "/";

  return (
    <BrowserRouter>
      <div id="menu">
        <div id="page-elems">
          <li id="navbar-logo">
            <a href="/">
              <img src={logo} alt="treehacks small logo" />
              <div id="title">
                <span className="logo-text-tree">tree</span>
                <span className="logo-text-hacks">hacks</span>
                <span className="logo-text-meet">teams</span>
              </div>
            </a>
          </li>
          <Link to="/">people</Link>
          <Link to="/ideas">ideas</Link>
          <Link to="/teams">form team</Link>
          {user && !user?.attributes["cognito:groups"]?.includes("sponsor") && (
            <Link to="/profile">edit profile</Link>
          )}
          <a href="https://youtu.be/08bUlbXf5mk">demo</a>
          {/* TODO: is this necessary? */}
          {/* <Link to={user_url}>account</Link> */}
          <Link to="/logout" onClick={logout}>
            log out
          </Link>
        </div>
        <Switch>
          <Route path="/profile">{user && <MeetForm user={user} />}</Route>
          <Route
            path="/users/:userId"
            render={(props) => <UserProfile {...props} />}
          ></Route>
          <Route path="/ideas">{user && <IdeasPage user={user} />}</Route>
          <Route path="/teams">{user && <TeamsPage user={user} />}</Route>
          {/* <Route path="/view_profile/:id" component={ViewProfile}>
            {user && <ViewProfile />}
          </Route> */}
          {/*<Route path="/sponsors">{user && <JobsPage user={user} />}</Route>*/}
          <Route path="/" style={{ margin: "0px" }}>
            <Table user={user} />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.render(<Main />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
