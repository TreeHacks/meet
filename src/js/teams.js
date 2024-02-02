import React from "react";
import Form from "react-jsonschema-form";
import API from "@aws-amplify/api";
import Loading from "./loading";
import { Redirect } from "react-router";

const schema = {
  type: "object",
  required: [],
  properties: {
    action: { type: "string", title: "Action" },
    pendingList: { type: "string", title: "Pending Teammates" },
    approvedList: { type: "string", title: "Approved Teammates" },
  },
};

const uiSchema = {
  action: {
    "ui:placeholder": "Do 'add:emailaddr@urmom.com' or 'rem:emailaddr@ur.mom'",
  },
  pendingList: {
    "ui:widget": "textarea",
    "ui:placeholder": "No pending teammates",
    "ui:options": {
      rows: 3,
    },
    "ui:readonly": true, 
  },
  approvedList: {
    "ui:widget": "textarea",
    "ui:placeholder": "No approved teammates",
    "ui:options": {
      rows: 3,
    },
    "ui:readonly": true, 
  },
};

const log = (type) => console.log.bind(console, type);

class MeetForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formSchema: schema,
      dataFetched: false,
      redirect: false,
      error: undefined,
    };
  }

  async loadLists() {
    const team_info_response = await API.get(
      "treehacks",
      `/users/${this.props.user.username}/forms/team_info`,
      {}
    )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });

    const team_info = JSON.parse(team_info_response.teamList || "{}");

    const pending_list = Object.keys(team_info).filter((email) => team_info[email] === 0);
    const approved_list = Object.keys(team_info).filter(
      (email) => team_info[email] === 1 && email !== this.props.user.email
    );

    if (pending_list){
      this.state.formSchema["properties"]["pendingList"]["default"] = pending_list.join(", ");
    }

    if (approved_list) {
      this.state.formSchema["properties"]["approvedList"]["default"] = approved_list.join(", ");
    }

    this.setState({
      formSchema: this.state.formSchema,
      dataFetched: true,
    });
  }

  async componentDidMount() {
    await this.loadLists();
  }

  add(caller, called) {
    const payload = {
      body: { email: called },
    };

    API.put(
      "treehacks",
      `/users/${caller}/forms/add_teammate`,
      payload
    ).catch((error) => {
      console.log("error adding teammate");
      console.log(error);
      this.setState({ error });
    });
  }

  async remove(caller, called) {
    const payload = {
      body: { email: called },
    };

    API.put(
      "treehacks",
      `/users/${caller}/forms/remove_teammate`,
      payload
    ).catch((error) => {
      console.log("error removing teammate");
      console.log(error);
      this.setState({ error });
    });
  }

  async submitForm(e) {
    // Split the inputted string, eg. "add:username@gmail.com"
    var inputCombined = e.formData.action;
    var inputAction = inputCombined.split(":")[0];
    var inputId = inputCombined.split(":")[1];

    if (inputAction == "add") {
      await this.add(this.props.user.username, inputId);;
    } else if (inputAction == "rem") {
      await this.remove(this.props.user.username, inputId);
    } else {
      // Say error
    }
    
    await this.loadLists();
  }

  render() {
    if (!this.state.dataFetched) {
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
            <div id="form">
              <h1
                style={{ marginTop: "0px", marginBottom: "10px" }}
                id="formHeader"
              >
                Make your team!
              </h1>
              <Form
                schema={this.state.formSchema}
                uiSchema={uiSchema}
                onChange={log("changed")}
                onSubmit={(e) => this.submitForm(e)}
                onError={log("errors")}
              />
              {this.state.redirect && <Redirect to="/" />}
            </div>
          )}
        </>
      );
    }
  }
}

export default MeetForm;
