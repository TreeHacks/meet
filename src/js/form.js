import React from "react";
import Form from "react-jsonschema-form";
import API from "@aws-amplify/api";
import Loading from "./loading";
import { Redirect } from "react-router";
//TODO: modify schema to split up profile and ideas
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
          "education",
          "medical access",
          "voice assistance",
          "iot",
          "ar/vr",
          "geospatial"
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
    commitment: {
      title: "Commitment Level",
      type: "string",
      enum: [
        "Low",
        "Medium",
        "High"
      ]
    },
    timezoneOffset: {
      title: "Timezone",
      type: "string",
      enum: [
        "UTC−12:00",
        "UTC−11:00",
        "UTC−10:00",
        "UTC−09:30",
        "UTC−09:00",
        "UTC−08:00",
        "UTC−07:00",
        "UTC−06:00",
        "UTC−05:00",
        "UTC−04:00",
        "UTC−03:30",
        "UTC−03:00",
        "UTC−02:00",
        "UTC−01:00",
        "UTC±00:00",
        "UTC+01:00",
        "UTC+02:00",
        "UTC+03:00",
        "UTC+03:30",
        "UTC+04:00",
        "UTC+04:30",
        "UTC+05:00",
        "UTC+05:30",
        "UTC+05:45",
        "UTC+06:00",
        "UTC+06:30",
        "UTC+07:00",
        "UTC+08:00",
        "UTC+08:45",
        "UTC+09:00",
        "UTC+09:30",
        "UTC+10:00",
        "UTC+10:30",
        "UTC+11:00",
        "UTC+12:00",
        "UTC+12:45",
        "UTC+13:00",
        "UTC+14:00"
      ]
    },
    githubLink: { type: "string", title: "GitHub Link" },
    devpostLink: { type: "string", title: "Devpost Link" },
    portfolioLink: { type: "string", title: "Portfolio Link" },
    linkedinLink: { type: "string", title: "Linkedin Link" },
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
      "Tell other hackers about yourself! (150 words max)"
  },
  idea: {
    "ui:widget": "textarea",
    "ui:placeholder":
      "Pitch an idea that interests you! (150 words max)"
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
    "ui:description": "What is your timezone?"
  },
  commitment: {
    "ui:description": "What is your commitment level for TreeHacks 2021?"
  },
  githubLink: {
    "ui:description": "Social Media Links:",
    "ui:placeholder":
      "GitHub Profile"
  },
  devpostLink: {
    "ui:placeholder":
      "Devpost Profile"
  },
  portfolioLink: {
    "ui:placeholder":
      "Portfolio Liink"
  },
  linkedinLink: {
    "ui:placeholder":
      "Linkedin Profile"
  },
};

const log = type => console.log.bind(console, type);

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
    console.log(meet_info);
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
    const form = { body: e.formData };
    console.log("Data submitted: ", form);
    const resp = await API.put(
      "treehacks",
      `/users/${this.props.user.username}/forms/meet_info`,
      form
    );
    console.log(resp);
    this.setState({ redirect: true });
  }

  render() {
    if (!this.state.dataFetched) {
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
