import React from 'react';
import API from "@aws-amplify/api";
import Masonry from 'react-masonry-component';

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
      user_json["forms"]["meet_info"] && user_list.push(user_json["forms"])
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
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
      <div className="entry-wrapper">
        <Entry key={index} json={single_json} first_name="foo" last_name="bar"/>
      </div>
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
    this.first_name = props.json["application_info"]["first_name"];
    this.last_letter = props.json["application_info"]["last_name"].charAt(0);
    this.idea = props.json["meet_info"]["idea"];
    this.verticals = props.json["meet_info"]["verticals"];
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
          <p>relevant challenges:
          {this.verticals.map(vertical =>
            <> {vertical}</>
          )}
          </p>
        </div>
        <div className="contact">
          <p>contact: foobar</p>
        </div>
      </div>
    );
  }
}

export default Table;
