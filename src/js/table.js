import React from "react";
import API from "@aws-amplify/api";
import Masonry from "react-masonry-component";
import Fuse from "fuse.js";
import Loading from "./loading";
import debounce from "lodash.debounce";
import { set } from "lodash";
import Linkify from "react-linkify";
import ReactGA from "react-ga";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Form from "react-jsonschema-form";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import { setState } from "react-jsonschema-form/lib/utils";
import ViewProfile from "./view_profile";
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
    teammates: {
      title: "Number of Teammates",
      type: "array",
      items: {
        type: "string",
        enum: ["1", "2", "3", "4"],
      },
    },
  },
};
const uiFilterSchema = {
  verticals: {
    "ui:widget": "checkboxes",
    "ui:column": "is-2",
  },
  skills: {
    "ui:widget": "checkboxes",
    "ui:column": "is-4",
  },
  commitment: {
    "ui:widget": "checkboxes",
    "ui:column": "is-4",
  },
  teammates: {
    "ui:widget": "checkboxes",
    "ui:column": "is-4",
  }
};
const log = (type) => console.log.bind(console, type);
const parseTeam = (user) => JSON.parse(user["forms"]["team_info"]["teamList"] || "{}");
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
      error: undefined,
      openModal: false,
      showForm: true,
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
    const body = await API.get("treehacks", "/users_meet")
      .then((response) => {
        return response;
      })
      .catch((error) => {
        // console.(error);
        // console.log(error.response.status);
        // console.log(error.response.data);
        return error;
      });

    const status = body.response?.status ? body.response.status : 200;
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
        user_json.forms.meet_info.profileDesc &&
        user_json.forms.team_info &&
        user_list.push(user_json)
    );

    user_list = user_list.map(
      (user) => set(user, "forms.team_info.teamList", parseTeam(user))
    );

    // For testing with many users
    // for (let i = 1; user_list.length < 500; i++) {
    //   user_list = user_list.concat(
    //     user_list.map(e => ({ ...e, _id: e._id + i }))
    //   );
    // }
    console.log("user list", user_list);
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
      if (this.state.filters.teammates) {
        const teammateFilter = this.state.filters.teammates.map(Number.parseInt);

        results = [
          ...results,
          ...this.state.user_json.filter(
            (user) => teammateFilter.includes(
              Object.keys(user.forms.team_info.teamList).length || 1
            )
          )
        ]
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
      this.setState({ showForm: true });
      results = results.filter((user) => {
        return (
          user.forms.meet_info.isMentor != true &&
          user.forms.meet_info.isOrganizer != true
        );
      });
    } else if (newValue == 2) {
      this.setState({ showForm: false });
      results = results.filter((user) => user.forms.meet_info.isMentor);
    } else if (newValue == 3) {
      this.setState({ showForm: false });
      results = results.filter((user) => user.forms.meet_info.isOrganizer);
    } else if (newValue == 0) {
      this.setState({ showForm: true });
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
    /* const childElements = results.map((single_json) => (
      <div className="entry-wrapper" key={single_json._id}>
        <EntryComponent json={single_json} />
      </div>
    )); */
    const style = {};
    if (this.state.loading) {
      // if (this.state.user_json.length == 0) {

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
                <div
                  className="header"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h1 style={{ marginTop: "0px", marginBottom: "10px" }}>
                    Welcome to Meet 2024!
                  </h1>
                  <p style={{ width: "80%" }}>
                    Use this page to find others attending TreeHacks 2024.
                    Toggle between pages to find different people. Members of
                    the TreeHacks 2024 Organizing team are marked by the team
                    they work on so you can ask questions appropriately.
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
                    placeholder="Search by name, idea, anything!"
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
                  <div
                    id="form"
                    className="filter"
                    style={{
                      marginTop: "0px",
                      display: this.state.showForm ? "block" : "none",
                    }}
                  >
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
                    <TabPanel
                      value={this.state.tabSelection}
                      index={0}
                      style={{
                        padding: "0px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          margin: "0px",
                          padding: "0px",
                          width: "100%",
                        }}
                      >
                        <Masonry className={"gallery"} options={style}>
                          {results ? (
                            <ChildComponent results={results} />
                          ) : (
                            <p>No signups yet</p>
                          )}
                        </Masonry>
                      </div>
                    </TabPanel>
                    <TabPanel value={this.state.tabSelection} index={1}>
                      <Masonry className={"gallery"} options={style}>
                        <ChildComponent results={results} />
                      </Masonry>
                    </TabPanel>
                    <TabPanel value={this.state.tabSelection} index={2}>
                      <Masonry className={"gallery"} options={style}>
                        <ChildComponent results={results} />
                      </Masonry>
                    </TabPanel>
                    <TabPanel value={this.state.tabSelection} index={3}>
                      <Masonry className={"gallery"} options={style}>
                        <ChildComponent results={results} />
                      </Masonry>
                    </TabPanel>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
  }
}

function EntryComponent({ json }) {
  const getColorNum = (vertical) => {
    if (vertical.charAt(0) < "J") {
      return 0;
    } else if (vertical.charAt(0) < "Q") {
      return 1;
    }
    return 2;
  };

  const shouldComponentUpdate = (nextProps) => {
    return nextProps.json !== this.props.json;
  };
  const contactTracker = () => {
    ReactGA.event({
      category: "User",
      action: "Contacted user",
    });
  };

  const props = json;
  let first_name_orig = json["forms"]["meet_info"]["first_name"] || "";
  var firstLetter = first_name_orig.charAt(0);
  let first_name = firstLetter.toUpperCase() + first_name_orig.substring(1);
  let last_letter = (json["forms"]["meet_info"]["last_initial"] || "")
    .charAt(0)
    .toUpperCase();
  let idea = json["forms"]["meet_info"]["profileDesc"];
  let verticals = json["forms"]["meet_info"]["verticals"];
  let id = json["user"]["id"];
  let pronouns = json["forms"]["meet_info"]["pronouns"];
  let contact_url = ENDPOINT_URL + "/users/" + id + "/contact";
  let profile_url = "/users/" + id;
  let profilePictureLink = json["forms"]["meet_info"]["profilePicture"];
  let commitment = json["forms"]["meet_info"]["commitment"];
  const isOrganizer = json["forms"]["meet_info"]["isOrganizer"];
  const isMentor = json["forms"]["meet_info"]["isMentor"];
  const teammates = Object.keys(json["forms"]["team_info"]["teamList"]).length || 1;

  var slackURL = "";
  if (json["forms"]["meet_info"]["slackURL"]) {
    slackURL = json["forms"]["meet_info"]["slackURL"];
  } else {
    slackURL = "https://www.slack.com";
  }

  const [open, setOpen] = React.useState(false);
  const [openData, setOpenData] = React.useState({});

  const handleOpen = (parameter) => (event) => {
    setOpen(true);
    setOpenData(parameter);
  };

  const handleClose = (parameter) => (event) => {
    setOpen(false);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    overflowY: "scroll",
    transform: "translate(-50%, -50%)",
    height: "80%",
    width: "70%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  return (
    <div
      className={"entry " + (isOrganizer ? "organizerCard" : "")}
      style={{
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingLeft: "5px",
        paddingRight: "5px",
      }}
    >
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose()}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <ViewProfile idFromModal={openData} />
          </Box>
        </Fade>
      </Modal>
      <div
        className="header"
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          alignContent: "center",
          paddingBottom: "0px",
          display: "flex",
          flexDirection: "row",
          paddingTop: "5px",
          marginTop: isOrganizer && "15px",
        }}
      >
        {profilePictureLink && (
          <img
            src={profilePictureLink}
            alt="profile picture"
            style={{ objectFit: "cover" }}
          />
        )}
        <h3
          style={{
            textAlign: "left",
            marginBottom: "0px",
            marginTop: isOrganizer && "0px",
          }}
        >
          {first_name} {last_letter} {pronouns && "(" + pronouns + ")"}{" "}
        </h3>
      </div>
      <div
        className={"idea " + (isOrganizer ? "organizerCard" : "")}
        style={{
          padding: 0,
          justifyContent: "flex-start",
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <p id={isOrganizer ? "ideaTextOrganizer" : "ideaText"}>
          {isOrganizer && (
            <>
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                TreeHacks 2023 Organizer
              </span>
              <br />
            </>
          )}
          {isMentor && (
            <>
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                TreeHacks 2023 Mentor
              </span>
              <br />
            </>
          )}

          {idea}
        </p>
      </div>
      <div className="tags">
        {(verticals || commitment) && (
          <p id="interestedText">Interests & Commitment</p>
        )}
        <div id="verticalsDiv">
          {/* {verticals &&
            verticals.length > 0 &&
            verticals.map((vertical) => (
              <div
                className="tag"
                key={vertical}
                style={{
                  backgroundColor: colors[getColorNum(vertical)],
                }}
              >
                {vertical}
              </div>
            ))} */}
          {verticals && (
            <p style={{ marginTop: "0px", textAlign: "left" }}>
              {verticals.join(", ")}
            </p>
          )}
          {commitment && (
            <div className="tag" style={{ backgroundColor: "#105E54" }}>
              Commitment: {commitment}
            </div>
          )}
        </div>
        <p id="teamText" style={{ textAlign: "left" }}>Team Size: {teammates} / 4</p>
      </div>
      {isOrganizer && (
        <div style={{ marginLeft: "10px" }}>
          <a href={slackURL}>
            <img src={require("../assets/slackLogo.png")} width="70" />
          </a>
        </div>
      )}
      <div className="contact">
        {/*  <ReactGA.OutboundLink
          eventLabel="viewProfile"
          to={`/view_profile/${id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          view profile
        </ReactGA.OutboundLink> */}
        <a
          onClick={handleOpen(json)}
          id="viewButton"
          style={{
            textTransform: "none",
            backgroundColor: "transparent",
            color: "#0CB08A",
            fontFamily: "Avenir",
            fontSize: "16px",
            fontWeight: "400",
          }}
        >
          view full profile
        </a>
      </div>
    </div>
  );
}

function ChildComponent({ results }) {
  console.log(results);
  return (
    <>
      {results &&
        results.map((single_json) => (
          <div className="entry-wrapper" key={single_json._id}>
            <EntryComponent json={single_json} />
          </div>
        ))}
    </>
  );
}
export default Table;
