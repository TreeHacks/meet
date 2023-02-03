import React from "react";
import API from "@aws-amplify/api";
import Masonry from "react-masonry-component";
import Fuse from "fuse.js";
import Loading from "./loading";
import debounce from "lodash.debounce";
import Linkify from "react-linkify";
import ReactGA from "react-ga";

// ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_TOKEN);
ReactGA.pageview(window.location.pathname + window.location.search);

const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;
const colors = ["#FDEE6E", "#C490E8", "#F8806C"];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const LinkDecorator = (href, text, key) => {
  return (
    <a href={href} key={key} target="_blank">
      {text}
    </a>
  );
};

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      user_json: [],
      results: [],
      loading: false,
      error: undefined,
    };
    this._search = this._search.bind(this);
    this.search = debounce(this._search, 800);
  }

  async componentDidMount() {
    this.setState({ loading: true });
    const body = await API.get("treehacks", "/users_meet", {});
    const status = body["status"];
    this.setState({ loading: false });
    if (status !== 200) {
      this.setState({ error: "You have don't have access" });
      return;
    }

    let user_list = [];
    body["results"].map(
      (user_json) =>
        user_json.forms.meet_info &&
        user_json.forms.meet_info.showProfile &&
        user_json.forms.meet_info.idea &&
        user_list.push(user_json)
    );

    // For testing with many users
    // for (let i = 1; user_list.length < 500; i++) {
    //   user_list = user_list.concat(
    //     user_list.map(e => ({ ...e, _id: e._id + i }))
    //   );
    // }

    var fuse = new Fuse(user_list, {
      keys: ["forms.meet_info.idea"],
      useExtendedSearch: true,
    });
    this.setState({ user_json: user_list, fuse, loading: false }, () =>
      this._search()
    );
  }

  _search() {
    let results;
    if (this.state.query) {
      results = this.state.fuse.search(`=${this.state.query}`);
    } else {
      results = this.state.user_json;
      shuffle(results);
    }
    this.setState({ results });
  }

  render() {
    let { results } = this.state;

    const childElements = results.map((single_json) => (
      <div className="entry-wrapper" key={single_json._id}>
        <Entry json={single_json} />
      </div>
    ));

    const style = {};
    //if (false) {
    if (this.state.loading) {
      return <Loading />;
    } else {
      return (
        <>
          {this.state.error ? (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                margin: "0 auto",
                padding: "20px",
                border: "1px solid green",
                width: "fit-content",
                marginTop: "20px",
              }}
            >
              Error: {this.state.error}
            </div>
          ) : (
            <div id="table">
              <div className="content">
                <div className="header" style={{ width: "50%" }}>
                  <p>
                    Use this page to find ideas you might want to work on,
                    contributed by your fellow hackers. If you want to add an
                    idea below, pitch it in your Meet profile! <br />
                    <br />
                    P.S. This page only shows hackers who have pitched an idea -
                    use the people tab to see a full list of people at TreeHacks
                    2023, including their interested tracks, commitment level,
                    and more!
                  </p>
                </div>
                <div className="search">
                  <input
                    type="text"
                    value={this.state.query || ""}
                    onChange={(e) =>
                      this.setState({ query: e.target.value }, () =>
                        this.search()
                      )
                    }
                    placeholder="Search for ideas..."
                  />
                </div>
                <Masonry className={"gallery"} options={style}>
                  {childElements}
                </Masonry>
              </div>
            </div>
          )}
        </>
      );
    }
  }
}

class Entry extends React.Component {
  getColorNum(vertical) {
    if (vertical.charAt(0) < "f") {
      return 0;
    } else if (vertical.charAt(0) < "j") {
      return 1;
    }
    return 2;
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.json !== this.props.json;
  }

  contactTracker() {
    ReactGA.event({
      category: "User",
      action: "Viewed profile",
    });
  }

  render() {
    const props = this.props;
    let first_name_orig = props.json["forms"]["meet_info"]["first_name"] || "";
    var firstLetter = first_name_orig.charAt(0);
    let first_name = firstLetter.toUpperCase() + first_name_orig.substring(1);
    let last_letter = (props.json["forms"]["meet_info"]["last_initial"] || "")
      .charAt(0)
      .toUpperCase();
    let idea = props.json["forms"]["meet_info"]["idea"];
    let verticals = props.json["forms"]["meet_info"]["verticals"];
    let id = props.json["user"]["id"];
    let pronouns = props.json["forms"]["meet_info"]["pronouns"];
    let contact_url = ENDPOINT_URL + "/users/" + id + "/contact";
    let profilePictureLink = props.json["forms"]["meet_info"]["profilePicture"];
    let commitment = props.json["forms"]["meet_info"]["commitment"];
    return (
      <div className="entry">
        <div className="header">
          {profilePictureLink && (
            <img src={profilePictureLink} alt="profile picture" />
          )}
          <h3>
            {first_name} {last_letter} {pronouns && "(" + pronouns + ")"}
          </h3>
        </div>
        <div className="idea">
          <Linkify componentDecorator={LinkDecorator}>
            <p>
              <strong>Idea:</strong> {idea}
            </p>
          </Linkify>
          <br />
        </div>
        <div className="contact">
          <ReactGA.OutboundLink
            eventLabel="viewProfile"
            to={`/view_profile/${id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            view profile
          </ReactGA.OutboundLink>
        </div>
      </div>
    );
  }
}

export default Table;
