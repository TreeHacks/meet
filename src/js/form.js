import React from "react";
import Form from "react-jsonschema-form";
import API from "@aws-amplify/api";
import Loading from "./loading";
import { Redirect } from "react-router";

const schema = {
  title: "Tell us about yourself!",
  type: "object",
  required: [],
  properties: {
    profileDesc: { type: "string", title: "Profile Description" },
    idea: { type: "string", title: "Challenge ideas" },
    verticals: {
      title: "Challenges I'm interested in",
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: [
          "Healthcare",
          "New Froniers",
          "Web 3.0 and Fintech",
          "Sustainability",
          "Education",
          "Privacy and Safety"
        ]
      }
    },
    pronouns: { type: "string", title: "Pronouns" },
    skills: {
      title: "My Skills",
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
          "Systems"
        ]
      }
    },
    userType: {
      title: "Profile Type",
      type: "string",
      default: "Hacker",
      enumNames: [
        "Hacker",
        "Mentor",
      ],
      "enum": [
        "Hacker",
        "Mentor",
      ]
    },
    commitment: {
      title: "Commitment Level",
      type: "string",
      enumNames: [
        "High - Shooting for a prize, will spend majority of time hacking",
        "Medium - Will submit a substantial project, but with long breaks (e.g lots of rest, workshops)",
        "Low - Wants to submit something, but won't spend majority of time hacking"
      ],
      "enum": [
        "High",
        "Medium",
        "Low"
      ]
    },
    timezoneOffset: {
      title: "Timezone",
      type: "string",
      default: getTimezoneOffset()
    },
    githubLink: { type: "string", title: "GitHub Link" },
    linkedinLink: { type: "string", title: "Linkedin Link" },
    devpostLink: { type: "string", title: "Devpost Link" },
    portfolioLink: { type: "string", title: "Portfolio Link" },
    showProfile: {
      type: "boolean",
      title: "Yes! Show my profile and allow other hackers to contact me.",
      default: true
    }
  }
};

const uiSchema = {
  profileDesc: {
    "ui:widget": "textarea",
    "ui:placeholder":
      "Tell other hackers about yourself!"
  },
  idea: {
    "ui:widget": "textarea",
    "ui:placeholder":
      "Pitch an idea that interests you!"
  },
  pronouns: {
    "ui:placeholder":
      "Gender pronouns (optional)"
  },
  verticals: {
    "ui:widget": "checkboxes"
  },
  skills: {
    "ui:widget": "checkboxes"
  },
  timezoneOffset: {
    "ui:description": "Enter your timezone in GMT e.g GMT +0230, GMT -1100"
  },
  userType: {
    "ui:description": "Are you a hacker vs mentor?",
  },
  commitment: {
    "ui:description": "What is your commitment level for TreeHacks 2023?"
  },
  githubLink: {
    "ui:description": "Social Media Links:",
    "ui:placeholder":
      "GitHub Profile"
  },
  linkedinLink: {
    "ui:placeholder":
      "Linkedin Profile"
  },
  devpostLink: {
    "ui:placeholder":
      "Devpost Profile"
  },
  portfolioLink: {
    "ui:placeholder":
      "Portfolio Link"
  },
};

const log = type => console.log.bind(console, type);

// // Automatically calculate GMT timezone
function getTimezoneOffset() {
  function z(n){return (n<10? '0' : '') + n}
  var offset = new Date().getTimezoneOffset();
  var sign = offset < 0? '+' : '-';
  offset = Math.abs(offset);
  return "GMT " + sign + z(offset/60 | 0) + z(offset%60);
}

function isValidGMT(userInp) {
  var re = /^(GMT )[+|-][0-1][0-9][0-5][0-9]$/;
  return re.exec(userInp);
}

class MeetForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formSchema: schema,
      dataFetched: false,
      redirect: false
    };
  }

  async componentDidMount() {
    const meet_info = await API.get(
      "treehacks",
      `/users/${this.props.user.username}/forms/meet_info`,
      {}
    );
    console.log("User: " + this.props.user.username);
    if (meet_info) {
      for (const index in meet_info) {
        if (!(index in this.state.formSchema["properties"])) continue;
        this.state.formSchema["properties"][index]["default"] =
          meet_info[index];
      }

      this.setState({
        formSchema: this.state.formSchema,
        dataFetched: true
      });
    }
  }

  async submitForm(e) {
    const payload = { body: {...e.formData, isMentor: e.formData.userType === "Mentor"} }
    delete payload["body"]["userType"];

    if (isValidGMT(payload["body"]["timezoneOffset"]) == null) {
      alert("Please enter your GMT timezone in a valid format (e.g GMT +0800, GMT -1130)");
    } else {
      const resp = await API.put(
        "treehacks",
        `/users/${this.props.user.username}/forms/meet_info`,
        payload
      );
      console.log(resp);
      this.setState({ redirect: true });
    }
  }

  render() {
    if (false) {
    // if (!this.state.dataFetched) {
      return <Loading />;
    }
    else {
      return (
        <div id="form">
          <Form
            schema={this.state.formSchema}
            uiSchema={uiSchema}
            onChange={log("changed")}
            onSubmit={e => this.submitForm(e)}
            onError={log("errors")}
          />
          {this.state.redirect && <Redirect to="/" />}
        </div>
      );
    }
  }
}

export default MeetForm;
