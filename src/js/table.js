import React from 'react';
import API from "@aws-amplify/api";

class Table extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    console.log("hi");
    const body = await API.get("treehacks", '/users', {})
    console.log(body);
    const meet_info = await API.get("treehacks", `/users/${this.props.user.username}/meet_info`, {});
    console.log(meet_info);

  }

  render() {
    return (
      <div id="table">
        <div className="content">
          <Entry first_name="Foo" last_name="Bar"/>
          user id is {this.props.user && this.props.user.username}
        </div>
      </div>
    );
  }
}

class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.first_name = props.first_name;
    this.last_name = props.last_name;
  }

  render() {
    return (
      <div className="entry">
        <h3>{this.first_name} {this.last_name}</h3>
      </div>
    );
  }
}

export default Table;
