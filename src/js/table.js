import React from 'react';
import API from "@aws-amplify/api";

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {user_json: []};
  }

  async componentDidMount() {
    const body = await API.get("treehacks", '/users', {})
    console.log(body["results"]);
    var user_list = [];
    body["results"].map((user_json, index) =>
      user_json["forms"]["meet_info"] && user_list.push(user_json["forms"]["meet_info"])
    );
    console.log(user_list);
    this.setState({user_json: user_list});
  }

  render() {
    return (
      <div id="table">
        <div className="content">
          {this.state.user_json.map((single_json, index) =>
            <Entry key={index} json={single_json} first_name="Foo" last_name="Bar"/>
          )}
        </div>
      </div>
    );
  }
}

class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.first_name = props.json["first_name"];
    this.last_name = props.json["last_name"];
    this.response = props.json["q1"];
  }

  render() {
    return (
      <div className="entry">
        <h3>{this.first_name} {this.last_name}</h3>
        <p>{this.response}</p>
      </div>
    );
  }
}

export default Table;
