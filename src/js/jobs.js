import React from "react";
import API from "@aws-amplify/api";
import Masonry from "react-masonry-component";
import Loading from "./loading";
import debounce from "lodash.debounce";
import Linkify from "react-linkify";
import ReactGA from 'react-ga';

// ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_TOKEN);
ReactGA.pageview(window.location.pathname + window.location.search);

const ENDPOINT_URL = process.env.REACT_APP_ENDPOINT_URL;
const colors = ["#FDEE6E", "#C490E8", "#F8806C"];

const LinkDecorator = (href, text, key) => {
    return <a href={href} key={key} target="_blank">
        {text}
    </a>;
}

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      user_json: [],
      results: []
    };
  }
  render() {
    let { results } = this.state;

    // EXAMPLE JSON FOR COMPANY INFO:
    // "facebook": {
    //     "name": "Facebook",
    //     "logo": "https://1000logos.net/wp-content/uploads/2016/11/Facebook-logo-500x350.png",
    //     "description": "Facebook is a website which allows users, who sign-up for free profiles, to connect with friends, work colleagues or people they don't know, online. It allows users to share pictures, music, videos, and articles, as well as their own thoughts and opinions with however many people they like.",
    //     "location": "Menlo Park, CA",
    //     "tags": ["AI", "social media", "website development"],
    //     "challenges": ["Civic Engagement", "Social Interconnectivity"],
    //     "contact": "https://www.google.com",
    //   },
    //   "google": {
    //     "name": "Google",
    //     "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/368px-Google_2015_logo.svg.png",
    //     "description": "Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, a search engine, cloud computing, software, and hardware.",
    //     "location": "New York, NY",
    //     "tags": ["big data", "design", "software engineering", "internships"],
    //     "contact": "https://www.google.com",
    //   }
    let companies = 
    {
      
    }

    const childElements = Object.values(companies).map(single_json => (
      <div className="entry-wrapper jobsPage">
        <Entry json={single_json} />
      </div>
    ));

    const style = {};
    if (companies.length == 0) {
    //if (false) {
      return <Loading />;
    } else if (childElements.length == 0) {
      return (
        <div id="table">
          <div className="content">
            <div className="header">
              <p>
                Check back later to see our awesome sponsors!
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div id="table">
          <div className="content">
            <div className="header">
              <p>
                Check out our awesome sponsors!
              </p>
            </div>
            <Masonry className={"gallery jobsPage"} options={style}>
              {childElements}
            </Masonry>
          </div>
        </div>
      );
    }
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
    let company = props.json["name"];
    let challenges = props.json["challenges"];
    let description = props.json["description"];
    let location = props.json["location"];
    let tags = props.json["tags"];
    let contact_url = props.json["contact"];
    let logo_url = props.json["logo"];

    return (
      <div className="entry jobListing">
        <div className="header">
          {logo_url && <img src={logo_url} alt="logo" />}
            <h3>
              {company}
            </h3>
            <span>
              {location}
            </span>
        </div>
        <div className="idea">
          <Linkify componentDecorator={LinkDecorator}>
            <p>{description}</p>
          </ Linkify>
          {challenges && <span>Challenges: {challenges.join(", ")}</span>}
        </div>
        <div className="tags">
          {tags &&
            tags.length > 0 &&
            tags.map(tags => (
              <div
                className="tag"
                key={tags}
                style={{ backgroundColor: colors[this.getColorNum(tags)] }}
              >
                {tags}
              </div>
            ))}
        </div>
        <div className="contact">
          <a href = {contact_url} target = "_blank">
            contact company
          </a>
        </div>
      </div>
    );
  }
}

export default Table;
