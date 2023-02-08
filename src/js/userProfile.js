import React from "react";
import API from "@aws-amplify/api";
import Loading from "./loading";
import ReactGA from "react-ga";

const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: undefined,
      dataFetched: false,
    };
  }

  async componentDidMount() {
    // TO DO: Remove authentication for the meet_info API
    // or create a new API for getting user profiles.
    const meet_info = await API.get(
      "treehacks",
      `/users/${this.props.match.params.userId}/forms/meet_info`,
      {}
    );
    if (meet_info) {
      this.setState({
        userInfo: meet_info,
        dataFetched: true,
      });
    }
  }

  render() {
    // if (false) {
    if (!this.state.dataFetched) {
      return <Loading />;
    }
    return (
      <div className="user-profile">
        <UserProfileHeader
          userInfo={this.state.userInfo}
          userId={this.props.match.params.userId}
        />
        <UserProfileSummary userInfo={this.state.userInfo} />
        <UserProfileProject userInfo={this.state.userInfo} />
        <UserProfileExperience userInfo={this.state.userInfo} />
        <UserProfileOtherInfo userInfo={this.state.userInfo} />
      </div>
    );
  }
}

function UserProfileHeader(props) {
  // TO DO: Display user's information and edit design.
  let contact_url = ENDPOINT_URL + "/users/" + props.userId + "/contact";
  return (
    <div className="user-profile-header">
      <div className="full-name">Full Name</div>
      <div className="contact">
        <ReactGA.OutboundLink
          eventLabel="Contact"
          to={contact_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          contact
        </ReactGA.OutboundLink>
      </div>
    </div>
  );
}

function UserProfileSummary(props) {
  // TO DO: Display user's information and edit design.
  return (
    <div className="user-profile-summary">
      <div className="field-name">Summary</div>
      <div className="field-text">This information is not available.</div>
    </div>
  );
}

function UserProfileProject(props) {
  // TO DO: Display user's information and edit design.
  return (
    <div className="user-profile-project">
      <div className="field-name">TreeHacks Project</div>
      <div className="field-text">This information is not available.</div>
    </div>
  );
}

function UserProfileExperience(props) {
  // TO DO: Display user's information and edit design.
  return (
    <div className="user-profile-experience">
      <div className="field-name">Experience</div>
      <div className="field-text">This information is not available.</div>
    </div>
  );
}

function UserProfileOtherInfo(props) {
  // TO DO: Display user's information and edit design.
  return (
    <div className="user-profile-other-info">
      <div className="field-name">Other Information</div>
      <div className="field-text">This information is not available.</div>
    </div>
  );
}

export default UserProfile;
