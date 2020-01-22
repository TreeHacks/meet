import React from 'react';
import Form from "react-jsonschema-form";
import API from "@aws-amplify/api";

const schema = {
  title: "Treehacks form!",
  type: "object",
  required: ["first_name", "last_name", "q1"],
  properties: {
    first_name: {type: "string", title: "First name"},
    last_name: {type: "string", title: "Last name"},
    phone: {type: "string", title: "Phone number"},
    verticals: {type: "array", items: {type: "object", properties: {description: {type: "string"}}}},
    university: {type: "string", title: "University"},
    level_of_study: {type: "string", title: "Level of study"},
    major: {type: "string", title: "Major"},
    q1: {type: "string", title: "Who"},
    q2: {type: "string", title: "What"},
    q3: {type: "string", title: "Where"},
    q_slack: {type: "string", title: "Slack"}
  }
};

const log = (type) => console.log.bind(console, type);

class MeetForm extends React.Component {
  constructor(props) {
    super(props);
  }

  async submitForm(formData, e) {
    console.log("Data submitted: ",  formData);
    const resp = await API.put("treehacks", `/users/${this.props.user.username}/meet_info`, {body: formData});
  }

  render() {
    return (
      <div id="form">
        <Form schema={schema}
          onChange={log("changed")}
          onSubmit={this.submitForm}
          onError={log("errors")} />
        user id is {this.props.user && this.props.user.username}
      </div>
    );
  }
}

export default MeetForm;
