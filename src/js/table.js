import React from "react";
import API from "@aws-amplify/api";
import Masonry from "react-masonry-component";
import Fuse from "fuse.js";
import Loading from "./loading";
import debounce from "lodash.debounce";
import Linkify from "react-linkify";
import ReactGA from 'react-ga';
import { getUserMeetMock } from "../mock/usersMeet";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_TOKEN);
ReactGA.pageview(window.location.pathname + window.location.search);

const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;
const colors = ["#FDEE6E", "#C490E8", "#F8806C"];

const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const LinkDecorator = (href, text, key) => {
    return <a href={href} key={key} target="_blank">
        {text}
    </a>;
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      user_json: [],
      results: [],
      tabSelection: 0,
    };
    this._search = this._search.bind(this);
    this.search = debounce(this._search, 800);
  }

  async componentDidMount() {
    const body = getUserMeetMock();
    // const body = await API.get("treehacks", "/users_meet", {});
    let user_list = [];
    body["results"].map(
      user_json =>
        user_json.forms.meet_info &&
        user_json.forms.meet_info.showProfile &&
        user_json.forms.meet_info.profileDesc &&
        user_list.push(user_json)
    );

    // For testing with many users
    // for (let i = 1; user_list.length < 500; i++) {
    //   user_list = user_list.concat(
    //     user_list.map(e => ({ ...e, _id: e._id + i }))
    //   );
    // }

    var fuse = new Fuse(user_list, {
      keys: [
        "forms.meet_info.profileDesc",
        "forms.meet_info.verticals",
        "forms.meet_info.first_name"
      ]
    });
    this.setState({ user_json: user_list, fuse }, () => this._search());
  }

  _search() {
    let results;
    if (this.state.query) {
      results = this.state.fuse.search(this.state.query);
    } else {
      results = this.state.user_json;
      shuffle(results);
    }
    this.setState({ results });
  }

  handleChange = (event, newValue) => {
    this.setState({tabSelection: newValue});
  };

  render() {
    let { results } = this.state;

    const childElements = results.map(single_json => (
      <div className="entry-wrapper" key={single_json._id}>
        <Entry json={single_json} />
      </div>
    ));

    const style = {};
    if (false) {
    // if (this.state.user_json.length == 0) {
      return <Loading />;
    }
    else {
      return (
        <div id="table">
          <div className="content">
            <div className="header">
              <p>
                Welcome to TreeHacks Meet! Use this page to find other
                hackers and mentors attending TreeHacks 2023.
              </p>
            </div>
            <div className="search">
              <input
                type="text"
                value={this.state.query || ""}
                onChange={e =>
                  this.setState({ query: e.target.value }, () => this.search())
                }
                placeholder="Search for anything..."
              />
            </div>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={this.state.tabSelection} onChange={this.handleChange} aria-label="basic tabs example">
                <Tab label="All" {...a11yProps(0)} />
                <Tab label="Mentors" {...a11yProps(1)} />
              </Tabs>
            </Box>
            <TabPanel value={this.state.tabSelection} index={0}> 
              {/* Need to clear all filters */}
              <Masonry className={"gallery"} options={style}>
                {childElements}
              </Masonry>
            </TabPanel>

            <TabPanel value={this.state.tabSelection} index={1}>
              {/* Need to filter just mentors */}
              <Masonry className={"gallery"} options={style}>
                {childElements}
              </Masonry>
            </TabPanel>

            
          </div>
        </div>
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

  contactTracker () {
    ReactGA.event({
      category: 'User',
      action: 'Contacted user'
    });
  }

  render() {
    const props = this.props;
    let first_name_orig =
      props.json["forms"]["meet_info"]["first_name"] || "";
    var firstLetter = first_name_orig.charAt(0);
    let first_name = firstLetter.toUpperCase() + first_name_orig.substring(1);
    let last_letter = (
      props.json["forms"]["meet_info"]["last_initial"] || ""
    )
      .charAt(0)
      .toUpperCase();
    let idea = props.json["forms"]["meet_info"]["profileDesc"];
    let verticals = props.json["forms"]["meet_info"]["verticals"];
    let id = props.json["user"]["id"];
    let pronouns = props.json["forms"]["meet_info"]["pronouns"];
    let contact_url =
      ENDPOINT_URL + "/users/" + id + "/contact";
    let profile_url = "/users/" + id;
    let profilePictureLink = props.json["forms"]["meet_info"]["profilePicture"];
    let commitment = props.json["forms"]["meet_info"]["commitment"];
    return (
      <div className="entry">
        <div className="header">
          {profilePictureLink && <img src={profilePictureLink} alt="profile picture" />}
            <h3>
              {first_name} {last_letter} {pronouns && "(" + pronouns + ")"}
            </h3>
        </div>
        <div className="idea">
          <Linkify componentDecorator={LinkDecorator}>
            <p>{idea}</p>
          </ Linkify>
        </div>
        <div className="tags">
          {commitment && 
            <div
              className="tag"
              style={{ backgroundColor: "#0CB08A" }}
            >
              Commitment: {commitment}
            </div>
          }
          {verticals &&
            verticals.length > 0 &&
            verticals.map(vertical => (
              <div
                className="tag"
                key={vertical}
                style={{ backgroundColor: colors[this.getColorNum(vertical)] }}
              >
                {vertical}
              </div>
            ))}
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
