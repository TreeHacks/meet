import React from 'react';

class Table extends React.Component {
  constructor(props) {
    super(props);
    fetch("https://api.treehacks.com/users", function(error, meta, body) {
      console.log(body.toString());
    });
  }

  render() {
    return (
      <div id="table">
        <div className="content">
          <Entry first_name="Foo" last_name="Bar"/>
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
