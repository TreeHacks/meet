import React from 'react';
import Form from "react-jsonschema-form";
import API from "@aws-amplify/api";

const schema = {
  title: "Profile",
  type: "object",
  required: [],
  properties: {
    verticals: {
      "type": "array",
      "uniqueItems": true,
      "items": {"type": "string", enum:["education", "medical access", "voice assistance", "iot", "ar/vr", "geospatial"] }
    },
    idea: {type: "string", title: "Challenge ideas"},
    showProfile: {type: "boolean", title: "Yes! Show my profile and allow other hackers to contact me.", default: false}
  }
};

const uiSchema = {
  verticals: {
    "ui:widget": "checkboxes"
  },
  idea: {"ui:widget": "textarea", "ui:placeholder": "Pitch an idea and/or tell other hackers about yourself! (150 words max)"}
}

const log = (type) => console.log.bind(console, type);

class MeetForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {formSchema: schema};
  }

  async componentDidMount() {
    const user_info = await API.get("treehacks", `/users/${this.props.user.username}`, {});
    console.log(user_info);
    const meet_info = await API.get("treehacks", `/users/${this.props.user.username}/forms/meet_info`, {});
    console.log(meet_info);
    if (meet_info) {
      for (const index in meet_info) {
        if (!(index in this.state.formSchema["properties"])) continue;
        {this.state.formSchema["properties"][index]["default"] = meet_info[index]};
      }
      this.setState({formSchema: this.state.formSchema});
    }
  }

  async submitForm(e) {
    const form = {body: e.formData}
    console.log("Data submitted: ", form);
    const resp = await API.put("treehacks", `/users/${this.props.user.username}/forms/meet_info`, form);
    console.log(resp)
  }

  render() {
    return (
      <div id="form">
        <Form schema={this.state.formSchema}
          uiSchema={uiSchema}
          onChange={log("changed")}
          onSubmit={e => this.submitForm(e)}
          onError={log("errors")} />
      </div>
    );
  }
}

export default MeetForm;
