import React from "react";
import Form from "react-jsonschema-form";
import API from "@aws-amplify/api";
import Loading from "./loading";
import { Redirect } from "react-router";
import ReactGA from 'react-ga';

ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_TOKEN);
ReactGA.pageview(window.location.pathname + window.location.search);
const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;

const schema = {
  title: "Profile Page",
  type: "object",
  properties: {
    profileDesc: { type: "string", title: "Profile Description", readOnly: true },
    idea: { type: "string", title: "Challenge ideas", readOnly: true },
    verticals: {
      title: "Challenges user is interested in",
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: [
          "healthcare",
          "education",
          "civic engagement",
          "sustainability",
          "social (inter)connectivity",
          "anything cool!"
        ]
      }
      , readOnly: true
    },
    pronouns: { type: "string", title: "Pronouns", readOnly: true },
    skills: {
      title: "User's Skills",
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
      }, readOnly: true
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
      ], readOnly: true
    },
    timezoneOffset: {
      title: "Timezone",
      type: "string",
      default: "Enter something", readOnly: true
    },
    githubLink: { type: "string", title: "GitHub Link", readOnly: true },
    devpostLink: { type: "string", title: "Devpost Link", readOnly: true },
    portfolioLink: { type: "string", title: "Portfolio Link", readOnly: true },
    linkedinLink: { type: "string", title: "Linkedin Link", readOnly: true }
  }
};

const uiSchema = {
  profileDesc: {
    "ui:widget": "textarea",
    "ui:placeholder":
      "No profile description shared"
  },
  idea: {
    "ui:widget": "textarea",
    "ui:placeholder":
      "No ideas shared"
  },
  pronouns: {
    "ui:description": "User's pronouns",
    "ui:placeholder":
      "None specified"
  },
  verticals: {
    "ui:widget": "checkboxes"
  },
  skills: {
    "ui:widget": "checkboxes"
  },
  timezoneOffset: {
    "ui:description": "User's timezone",
    "ui:placeholder":
      "None specified"
  },
  commitment: {
    "ui:description": "User's commitment level",
    "ui:placeholder":
      "None specified"
  },
  githubLink: {
    "ui:description": "Social Media Links:",
    "ui:placeholder":
      "No GitHub profile specified"
  },
  devpostLink: {
    "ui:placeholder":
      "No Devpost profile specified"
  },
  portfolioLink: {
    "ui:placeholder":
      "No Portfolio specified"
  },
  linkedinLink: {
    "ui:placeholder":
      "No Linkedin profile specified"
  },
};

// Change first names in the relevant portions of the schema
function changeSchemaName(name) {
  schema.title = name + "'s Profile Page";
  schema.properties.verticals.title = "Challenges " + name + " is interested in";
  schema.properties.skills.title = name + "'s Skills";
  uiSchema.pronouns["ui:description"] = name + "'s pronouns";
  uiSchema.timezoneOffset["ui:description"] = name + "'s timezone";
  uiSchema.commitment["ui:description"] = name + "'s commitment level";
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
    // Get appropriate user from databases
    const user_id = this.props.match.params.id;
    this.setState({id: user_id});
    const body = await API.get("treehacks", "/users_meet", {});
    var filteredResults = body.results.filter(function(item) { 
       return item.user.id === user_id;  
    });
    var meet_info;

    console.log(body);

    // Clean up JSON if possible
    if (filteredResults.length) {
      meet_info = filteredResults[0].forms.meet_info;
    } else{
      alert("No user found!");
    }

    // Set data appropriately
    if (meet_info) {
      changeSchemaName(meet_info.first_name)
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

  render() {
    if (!this.state.dataFetched) {
      return <Loading />;
    }
    else {
      let contact_url =
      ENDPOINT_URL + "/users/" + this.state.id + "/contact";
      return (
        <div id="form">
          <Form
            schema={this.state.formSchema}
            uiSchema={uiSchema}
            children={true}
          />

          <div className="main-button white-text">
            <ReactGA.OutboundLink eventLabel="Contact"
                to={contact_url} target = "_blank"
              >
              Contact on Slack
            </ReactGA.OutboundLink>
          </div>

          {this.state.redirect && <Redirect to="/" />}
        </div>
      );
    }
  }
}

export default MeetForm;
