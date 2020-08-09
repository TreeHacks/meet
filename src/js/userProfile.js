import React from "react";
import API from "@aws-amplify/api";
import Loading from "./loading";
import { Redirect } from "react-router";

const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;

// const schema = {

// };

// const uiSchema = {

// };

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
    }
  }

//   updateUser() {

//   }

  async componentDidMount() {
    const meet_info = await API.get(
      "treehacks",
      `/users/${this.props.match.params.userId}/forms/meet_info`,
      {}
    );
    console.log(meet_info);
    if (meet_info) {
    
    }
  }

  render() {
    return (
      <div className="user-profile">

      </div>
    );
  }
}

export default UserProfile;