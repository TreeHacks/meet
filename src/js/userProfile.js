import React from "react";
import API from "@aws-amplify/api";
import Loading from "./loading";

const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: undefined,
      dataFetched: false,
    }
  }

  async componentDidMount() {
    // TO DO: Remove authentication for the meet_info API
    // or create a new API for getting user profiles.
    const meet_info = await API.get(
      "treehacks",
      `/users/${this.props.match.params.userId}/forms/meet_info`,
      {}
    );
    console.log(meet_info);
    if (meet_info) {
      this.setState({
        userInfo: meet_info,
        dataFetched: true,
      });
    }
  }

  render() {
    if (!this.state.dataFetched) {
      return <Loading />;
    }
    return (
      <div className="user-profile">
        <UserProfileHeader userInfo={this.state.userInfo} />
        <UserProfileSummary userInfo={this.state.userInfo} />
        <UserProfileProject userInfo={this.state.userInfo} />
        <UserProfileExperience userInfo={this.state.userInfo} />
        <UserProfileOtherInfo userInfo={this.state.userInfo} />
      </div>
    );
  }
}

class UserProfileHeader extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.userInfo !== this.props.userInfo;
  }

  render() {
    return (
      <div className="user-profile-header">
        User Profile Header
      </div>
    );
  }
}

class UserProfileSummary extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.userInfo !== this.props.userInfo;
  }

  render() {
    return (
      <div className="user-profile-summary">
        User Profile Summary
      </div>
    );
  }
}

class UserProfileProject extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.userInfo !== this.props.userInfo;
  }

  render() {
    return (
      <div className="user-profile-project">
        User Profile Project
      </div>
    );
  }
}

class UserProfileExperience extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.userInfo !== this.props.userInfo;
  }

  render() {
    return (
      <div className="user-profile-experience">
        User Profile Experience
      </div>
    );
  }
}

class UserProfileOtherInfo extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.userInfo !== this.props.userInfo;
  }

  render() {
    return (
      <div className="user-profile-other-info">
        User Profile Other Info
      </div>
    );
  }
}

export default UserProfile;