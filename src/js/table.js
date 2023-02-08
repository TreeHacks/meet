import React from "react";
import API from "@aws-amplify/api";
import Masonry from "react-masonry-component";
import Fuse from "fuse.js";
import Loading from "./loading";
import debounce from "lodash.debounce";
import Linkify from "react-linkify";
import ReactGA from "react-ga";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Form from "react-jsonschema-form";

// ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_TOKEN);
ReactGA.pageview(window.location.pathname + window.location.search);

const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;
//const colors = ['#105E54', '#CBBEFF', '#513EC3']; // YELLOW, PURPLE, RED -> GREEN, PURPLE, BLACK
const colors = ["#513EC3", "#513EC3", "#513EC3"]; // PURPLE

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
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const filterSchema = {
  title: "Filter Options",
  type: "object",
  required: [],
  properties: {
    verticals: {
      title: "Challenges",
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: [
          "Healthcare",
          "New Frontiers",
          "Web 3.0 and Fintech",
          "Sustainability",
          "Education",
          "Privacy and Safety",
        ],
      },
    },
    skills: {
      title: "Skills",
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: [
          "AI",
          "Data Mining",
          "NLP",
          "Web Development",
          "IOS",
          "Android",
          "Pitching",
          "Marketing",
          "Design",
          "AR/VR",
          "Game Development",
          "Systems",
        ],
      },
    },
    commitment: {
      title: "Commitment Level",
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: ["High", "Medium", "Low"],
      },
    },
  },
};

const uiFilterSchema = {
  verticals: {
    "ui:widget": "checkboxes",
    "ui:column": "is-4",
  },
  skills: {
    "ui:widget": "checkboxes",
    "ui:column": "is-4",
  },
  commitment: {
    "ui:widget": "checkboxes",
    "ui:column": "is-4",
  },
};

const log = (type) => console.log.bind(console, type);

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      user_json: [],
      results: [],
      tabSelection: 0,
      filters: [],
      filterFormData: {},
      loading: false,
    };
    this._search = this._search.bind(this);
    this._filter = this._filter.bind(this);
    this.clearFilterOptions = this.clearFilterOptions.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);

    this.search = debounce(this._search, 800);
    this.filter = debounce(this._filter, 800);
  }

  async componentDidMount() {
    this.setState({ loading: true });
    const body = await API.get("treehacks", "/users_meet", {});
    this.setState({ loading: false });
    let user_list = [];
    body["results"].map(
      (user_json) =>
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
      keys: ["forms.meet_info.profileDesc", "forms.meet_info.first_name"],
      useExtendedSearch: true,
    });

    this.setState({ user_json: user_list, fuse }, () => this._search());
  }

  _search() {
    let results;
    if (this.state.query) {
      if (this.state.filters) {
        var filteredFuse = new Fuse(this.state.results, {
          keys: ["forms.meet_info.profileDesc", "forms.meet_info.first_name"],
          useExtendedSearch: true,
        });

        results = filteredFuse.search(`=${this.state.query}`);
      } else {
        results = this.state.fuse.search(`=${this.state.query}`);
      }
    } else {
      results = this.state.user_json;
      shuffle(results);
    }
    this.setState({ results });
  }

  async _filter() {
    let results = [];

    if (!Object.values(this.state.filters).every((x) => !x.length)) {
      if (this.state.filters.skills) {
        this.state.filters.skills.forEach((filterQuery) => {
          results = [
            ...results,
            ...this.state.user_json.filter(
              (user) =>
                user.forms.meet_info.skills == filterQuery ||
                (user.forms.meet_info.skills &&
                  user.forms.meet_info.skills.indexOf(filterQuery) >= 0)
            ),
          ];
        });
      }

      if (this.state.filters.verticals) {
        this.state.filters.verticals.forEach((filterQuery) => {
          results = [
            ...results,
            ...this.state.user_json.filter(
              (user) =>
                user.forms.meet_info.verticals == filterQuery ||
                (user.forms.meet_info.verticals &&
                  user.forms.meet_info.verticals.indexOf(filterQuery) >= 0)
            ),
          ];
        });
      }

      if (this.state.filters.commitment) {
        this.state.filters.commitment.forEach((filterQuery) => {
          results = [
            ...results,
            ...this.state.user_json.filter(
              (user) => user.forms.meet_info.commitment == filterQuery
            ),
          ];
        });
      }

      this.setState({ results });
    } else {
      results = this.state.user_json;
      shuffle(results);
      this.setState({ results });
    }
  }

  clearFilterOptions() {
    const results = this.state.user_json;
    this.setState({ results, filterFormData: {}, filters: [] });
  }

  handleTabChange(event, newValue) {
    this.setState({ tabSelection: newValue });

    let results = this.state.user_json;

    if (newValue == 1) {
      results = results.filter((user) => {
        return (
          user.forms.meet_info.isMentor != true &&
          user.forms.meet_info.isOrganizer != true
        );
      });
    } else if (newValue == 2) {
      results = results.filter((user) => user.forms.meet_info.isMentor);
    } else if (newValue == 3) {
      results = results.filter((user) => user.forms.meet_info.isOrganizer);
    } else {
      shuffle(results);
    }
    this.setState({ results });
  }

  handleFilterChange(formState) {
    if (Object.values(formState.formData).every((x) => !x.length)) {
      this.setState({ filterFormData: {}, filters: [] });
    } else {
      this.setState({ filterFormData: formState.formData });
    }
  }

  async submitForm(e) {
    const filters = { ...e.formData };

    this.setState({ filters }, () => this._filter());
  }

  render() {
    let { results } = this.state;

    const childElements = results.map((single_json) => (
      <div className="entry-wrapper" key={single_json._id}>
        <Entry json={single_json} />
      </div>
    ));

    const style = {};
    if (this.state.loading) {
      // if (this.state.user_json.length == 0) {
      return <Loading />;
    } else {
      return (
        <div id="table">
          <div className="content">
            <div className="header">
              <p>
                Welcome to TreeHacks Meet! Use this page to find others attending
                TreeHacks 2023.
              </p>
            </div>
            <div className="search">
              <input
                type="text"
                value={this.state.query || ""}
                onChange={(e) =>
                  this.setState({ query: e.target.value }, () => this.search())
                }
                placeholder="Search for anything..."
              />
            </div>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={this.state.tabSelection}
                onChange={this.handleTabChange}
                aria-label="basic tabs example"
              >
                <Tab label="All" {...a11yProps(0)} />
                <Tab label="Hackers" {...a11yProps(1)} />
                <Tab label="Mentors" {...a11yProps(2)} />
                <Tab label="Organizers" {...a11yProps(3)} />
              </Tabs>
            </Box>

            <div className="directory-container">
              <div id="form" className="filter">
                <Form
                  schema={filterSchema}
                  uiSchema={uiFilterSchema}
                  onChange={this.handleFilterChange}
                  onSubmit={(e) => {
                    this.submitForm(e);
                  }}
                  onError={log("errors")}
                  formData={this.state.filterFormData}
                >
                  <button type="submit" className="btn btn-success">
                    Filter
                  </button>{" "}
                  <br />
                  <button
                    className="btn-danger"
                    onClick={this.clearFilterOptions}
                    style={{ marginTop: "0.25rem" }}
                  >
                    Clear Filter
                  </button>
                </Form>
              </div>

              <div>
                <TabPanel value={this.state.tabSelection} index={0}>
                  <Masonry className={"gallery"} options={style}>
                    {childElements ? <>{childElements}</> : <p>No signups yet</p>}
                  </Masonry>
                </TabPanel>

                <TabPanel value={this.state.tabSelection} index={1}>
                  <Masonry className={"gallery"} options={style}>
                    {childElements}
                  </Masonry>
                </TabPanel>

                <TabPanel value={this.state.tabSelection} index={2}>
                  <Masonry className={"gallery"} options={style}>
                    {childElements}
                  </Masonry>
                </TabPanel>

                <TabPanel value={this.state.tabSelection} index={3}>
                  <Masonry className={"gallery"} options={style}>
                    {childElements}
                  </Masonry>
                </TabPanel>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

class Entry extends React.Component {
  getColorNum(vertical) {
    if (vertical.charAt(0) < "J") {
      return 0;
    } else if (vertical.charAt(0) < "Q") {
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
      action: "Contacted user",
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
    let idea = props.json["forms"]["meet_info"]["profileDesc"];
    let verticals = props.json["forms"]["meet_info"]["verticals"];
    let id = props.json["user"]["id"];
    let pronouns = props.json["forms"]["meet_info"]["pronouns"];
    let contact_url = ENDPOINT_URL + "/users/" + id + "/contact";
    let profile_url = "/users/" + id;
    let profilePictureLink = props.json["forms"]["meet_info"]["profilePicture"];
    let commitment = props.json["forms"]["meet_info"]["commitment"];
    const isOrganizer = props.json["forms"]["meet_info"]["isOrganizer"];

    var slackURL = "";
    if (props.json["forms"]["meet_info"]["slackURL"]) {
      slackURL = props.json["forms"]["meet_info"]["slackURL"];
    } else {
      slackURL = "https://www.slack.com";
    }
    return (
      <div className={"entry " + (isOrganizer ? "organizerCard" : "")}>
        <div className="header">
          {profilePictureLink && (
            <img
              src={profilePictureLink}
              alt="profile picture"
              style={{ objectFit: "cover" }}
            />
          )}
          <h3>
            {first_name} {last_letter} {pronouns && "(" + pronouns + ")"}{" "}
          </h3>
        </div>
        <div className={"idea " + (isOrganizer ? "organizerCard" : "")}>
          <Linkify componentDecorator={LinkDecorator}>
            <p>{idea}</p>
          </Linkify>
        </div>
        <div className="tags">
          {commitment && (
            <div className="tag" style={{ backgroundColor: "#105E54" }}>
              Commitment: {commitment}
            </div>
          )}
          {verticals &&
            verticals.length > 0 &&
            verticals.map((vertical) => (
              <div
                className="tag"
                key={vertical}
                style={{
                  backgroundColor: colors[this.getColorNum(vertical)],
                }}
              >
                {vertical}
              </div>
            ))}
        </div>
        {isOrganizer && (
          <div style={{ marginBottom: "100" }}>
            <a href={slackURL}>
              <img src={require("../assets/slackLogo.png")} width="70" />
            </a>
          </div>
        )}
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
