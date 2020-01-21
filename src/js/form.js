import React from 'react';
import Form from "react-jsonschema-form";

const schema = {
  title: "Treehacks form!",
  type: "object",
  required: ["first_name", "last_name", "q1"],
  properties: {
    first_name: {type: "string", title: "First name"},
    last_name: {type: "string", title: "Last name"},
    phone: {type: "string", title: "Phone number"},
    verticals: {type: "string", enum: ["a", "b"], enumNames: ["aar", "bar"]},
    university: {type: "string", title: "University"},
    level_of_study: {type: "string", title: "Level of study"},
    major: {type: "string", title: "Major"},
    q1: {type: "string", title: "Who"},
    q2: {type: "string", title: "What"},
    q3: {type: "string", title: "Where"},
  }
};

const log = (type) => console.log.bind(console, type);

class MeetForm extends React.Component {
  render() {
    return (
      <div id="form">
        <Form schema={schema}
          onChange={log("changed")}
          onSubmit={log("submitted")}
          onError={log("errors")} />
      </div>
    );
  }
}

export default MeetForm;
