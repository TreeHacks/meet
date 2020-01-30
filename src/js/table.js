import React from 'react';
import API from "@aws-amplify/api";
import Masonry from 'react-masonry-component';

const colors = ["#34b2cb", "#E51B5D", "#F46E20"];

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
      user_json["forms"]["meet_info"] && user_list.push(user_json)
    );
    console.log(user_list);
    this.setState({user_json: user_list});
  }

  render() {
    const childElements = this.state.user_json.map((single_json, index) =>
      <>
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
      </>
    );
    const style = {
    };
    return (
      <div id="table">
        <div className="content">
          <div className="header">
            <p>Welcome to TreeHacks Meet! Use this page to find potential teammates. To add yourself, use the “profile” link above.</p>
          </div>
          <Masonry
            className={'gallery'}
            options={style}
          >
            {childElements}
          </Masonry>
        </div>
      </div>
    );
  }
}

class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.first_name = props.json["forms"]["application_info"]["first_name"];
    var firstLetter = this.first_name.charAt(0);
    this.first_name = firstLetter.toUpperCase() + this.first_name.substring(1);
    this.last_letter = props.json["forms"]["application_info"]["last_name"].charAt(0).toUpperCase();
    this.idea = props.json["forms"]["meet_info"]["idea"];
    this.verticals = props.json["forms"]["meet_info"]["verticals"];
    this.id = props.json["user"]["id"];
    this.contact_url = "https://root.dev.treehacks.com/api/users/" + this.id + "/contact"
  }

  getColorNum(vertical) {
    if (vertical.charAt(0) < 'f') {
      return 0;
    } else if (vertical.charAt(0) < 'j') {
      return 1;
    }
    return 2;
  }

  render() {
    return (
      <div className="entry">
        <div className="name">
          <h3>{this.first_name} {this.last_letter}</h3>
        </div>
        <div className="idea">
           <p>{this.idea}</p>
        </div>
        <div className="tags">
          {this.verticals.map((vertical, index) =>
            <div className="tag" style={{backgroundColor: colors[this.getColorNum(vertical)]}}>
              {vertical}
            </div>
          )}
        </div>
        <div className="contact">
          <a href={this.contact_url}>contact</a>
        </div>
      </div>
    );
  }
}

export default Table;
