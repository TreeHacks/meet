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

  async getLists(usernameToFetch) {
    var meet_info = await API.get(
      "treehacks",
      `/users/${usernameToFetch}/forms/meet_info`,
      {}
    )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });

    const status = meet_info.response?.status ? meet_info.response.status : 200;
    this.setState({ loading: false });
    if (status !== 200) {
      this.setState({ error: "You have don't have access" });
      this.setState({
        dataFetched: true,
      });
      return;
    }

    var pendLis = meet_info.pendingList;
    var apprLis = meet_info.approvedList;

    console.log("pending and appr", pendLis);
    console.log(apprLis);

    return { pendLis ,  apprLis };
  }

  async componentDidMount() {
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
    const approved_list = Object.keys(team_info).filter((email) => team_info[email] === 1);

    if (pending_list){
      this.state.formSchema["properties"]["pendingList"]["default"] = pending_list.join(", ");
    }

    if (approved_list) {
      this.state.formSchema["properties"]["approvedList"]["default"] = approved_list.join(", ");
    }

    // TODO: This isn't the right spot for this
    this.setState({
        formSchema: this.state.formSchema,
        dataFetched: true,
    });
  }

  async add(caller, called) {
    const team_info_response = await API.get(
      "treehacks",
      `/users/${caller}/forms/team_info`,
      {}
    )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });

    const team_info = JSON.parse(team_info_response.teamList || "{}");

    // can't have more than four team requests
    if (Object.keys(team_info).length >= 4) {
      return;
    }
    
    // add email to user's team list
    team_info[called] = 0;

    // reupload team data
    const serialized = JSON.stringify(team_info);
    const payload = {
      body: { teamList: serialized },
    };

    await API.put(
      "treehacks",
      `/users/${caller}/forms/team_info`,
      payload
    )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  async submitForm(e) {
    console.log(e.formData);

    // Split the inputted string, eg. "add:username@gmail.com"
    var inputCombined = e.formData.action;
    var inputAction = inputCombined.split(":")[0];
    var inputId = inputCombined.split(":")[1];

    console.log("action", inputAction, inputId);

    if (inputAction == "add") {
      var { callerPending: newPending, callerApproved: newApproved } = await this.add(this.props.user.username, inputId);;
    } //else if (inputAction == "rem") {
    //  this.remove(this.props.user.username, inputId);
    //} else {
      // Say error
    //}

    console.log("new pending", newPending);
    console.log("new approved", newApproved);
    
    // TODO: So this is where all of the .add and .remove logic will come in. It'll be updating the payload!
    const payload = {
      body: { pendingList: newPending, approvedList: newApproved },
    };
    delete payload["body"]["userType"];
    console.log("pload", payload);

    // TODO: And here I'd be looping through the things that are in "approved" or "pending", and updating their lists accordingly
    const resp = await API.put(
        "treehacks",
        `/users/${this.props.user.username}/forms/meet_info`,
        payload
    );
    console.log(resp);
    this.setState({ redirect: true });
  }

  render() {
    //if (false) {
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
