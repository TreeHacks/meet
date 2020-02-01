import React from "react";
import API from "@aws-amplify/api";
import Masonry from "react-masonry-component";
import Fuse from "fuse.js";
import debounce from "lodash.debounce";

const colors = ["#34b2cb", "#E51B5D", "#F46E20"];

const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      user_json: [],
      results: []
    };
    this._search = this._search.bind(this);
    this.search = debounce(this._search, 800);
  }

  async componentDidMount() {
    const body = await API.get("treehacks", "/users", {});
    let user_list = [];
    body["results"].map(
      user_json =>
        user_json.forms.meet_info &&
        user_json.forms.meet_info.showProfile &&
        user_list.push(user_json)
    );
    console.log(user_list);

    // For testing with many users
    // for (let i = 1; user_list.length < 500; i++) {
    //   user_list = user_list.concat(
    //     user_list.map(e => ({ ...e, _id: e._id + i }))
    //   );
    // }

    var fuse = new Fuse(user_list, {
      keys: [
        "forms.meet_info.idea",
        "forms.meet_info.verticals",
        "forms.application_info.first_name"
      ]
    });
    this.setState({ user_json: user_list, fuse }, () => this._search());
  }

  _search() {
    let results;
    if (this.state.query) {
      results = this.state.fuse.search(this.state.query);
    } else {
      results = this.state.user_json;
      shuffle(results);
    }
    this.setState({ results });
  }

  render() {
    let { results } = this.state;

    const childElements = results.map(single_json => (
      <div className="entry-wrapper" key={single_json._id}>
        <Entry json={single_json} />
      </div>
    ));

    const style = {};
    return (
      <div id="table">
        <div className="content">
          <div className="header">
            <p>
              Welcome to TreeHacks Meet! Use this page to find potential
              teammates. To add yourself, use the “profile” link above.
            </p>
          </div>
          <div className="search">
            <input
              type="text"
              value={this.state.query || ""}
              onChange={e =>
                this.setState({ query: e.target.value }, () => this.search())
              }
              placeholder="Search for anything..."
            />
          </div>
          <Masonry className={"gallery"} options={style}>
            {childElements}
          </Masonry>
        </div>
      </div>
    );
  }
}

class Entry extends React.Component {
  getColorNum(vertical) {
    if (vertical.charAt(0) < "f") {
      return 0;
    } else if (vertical.charAt(0) < "j") {
      return 1;
    }
    return 2;
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.json !== this.props.json;
  }

  render() {
    const props = this.props;
    let first_name_orig =
      props.json["forms"]["application_info"]["first_name"] || "";
    var firstLetter = first_name_orig.charAt(0);
    let first_name = firstLetter.toUpperCase() + first_name_orig.substring(1);
    let last_letter = (
      props.json["forms"]["application_info"]["last_name"] || ""
    )
      .charAt(0)
      .toUpperCase();
    let idea = props.json["forms"]["meet_info"]["idea"];
    let verticals = props.json["forms"]["meet_info"]["verticals"];
    let id = props.json["user"]["id"];
    let pronouns = props.json["forms"]["meet_info"]["pronouns"];
    let contact_url =
      "https://root.dev.treehacks.com/api/users/" + id + "/contact";
    return (
      <div className="entry">
        <div className="name">
          <h3>
            {first_name} {last_letter} {pronouns && "(" + pronouns + ")"}
          </h3>
        </div>
        <div className="idea">
          <p>{idea}</p>
        </div>
        <div className="tags">
          {verticals &&
            verticals.length &&
            verticals.map(vertical => (
              <div
                className="tag"
                key={vertical}
                style={{ backgroundColor: colors[this.getColorNum(vertical)] }}
              >
                {vertical}
              </div>
            ))}
        </div>
        <div className="contact">
          <a href={contact_url}>contact</a>
        </div>
      </div>
    );
  }
}

export default Table;
