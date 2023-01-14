import React from "react";
import API from "@aws-amplify/api";
import Masonry from "react-masonry-component";
import Loading from "./loading";

function SponsorsList({ sponsors, setSponsors, user }) {
  const likeSponsor = (sponsorId) => {
    API.put("treehacks", `/sponsor/${sponsorId}/hacker`, {
      body: {
        email: user.attributes.email,
      },
    });

    const newSponsors = sponsors.map((sponsor) => {
      if (sponsor._id === sponsorId) {
        return {
          ...sponsor,
          users: {
            ...sponsor.users,
            hacker_emails: [...sponsor.users.hacker_emails, user.attributes.email],
          },
        };
      }
      return sponsor;
    });

    setSponsors(newSponsors);
  };

  const removeLike = (sponsorId) => {
    API.del("treehacks", `/sponsor/${sponsorId}/hacker`, {
      body: {
        email: user.attributes.email,
      },
    });

    const newSponsors = sponsors.map((sponsor) => {
      if (sponsor._id === sponsorId) {
        return {
          ...sponsor,
          users: {
            ...sponsor.users,
            hacker_emails: sponsor.users.hacker_emails.filter(
              (email) => email !== user.attributes.email
            ),
          },
        };
      }
      return sponsor;
    });

    setSponsors(newSponsors);
  };
  return (
    <>
      <div id="table">
        <div className="content">
          {/* <div className="search">
            <input
              type="text"
              value={this.state.query || ""}
              onChange={(e) =>
                this.setState({ query: e.target.value }, () => this.search())
              }
              placeholder="Search for ideas..."
            />
          </div> */}
          <Masonry className={"gallery"} options={{}}>
            {sponsors.map((sponsor) => {
              const alreadyLiked = sponsor.users?.hacker_emails.includes(
                user.attributes.email
              );
              const isSponsor = user.attributes["cognito:groups"].includes("sponsor");

              return (
                <div className={"entry"} style={{ width: 220, padding: 20 }}>
                  <div className="header">
                    {sponsor?.logo_url && (
                      <img
                        src={sponsor.logo_url}
                        alt="sponsor logo"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <h3>{sponsor.name}</h3>
                  </div>
                  <div className={"idea"}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={sponsor.website_url}
                    >
                      website
                    </a>
                  </div>
                  <div className="tags">
                    {sponsor.description && (
                      <div className="tag" style={{ backgroundColor: "#105E54" }}>
                        {sponsor.description}
                      </div>
                    )}
                    <button
                      style={{
                        cursor: "pointer",
                        background: "transparent",
                        border: "1px solid rgba(12, 176, 138, 0.75)",
                      }}
                      onClick={() =>
                        alreadyLiked ? removeLike(sponsor._id) : likeSponsor(sponsor._id)
                      }
                    >
                      {alreadyLiked ? "Remove Interest" : "Show Interest"}
                    </button>
                    {/* {verticals && // for prizes
                      verticals.length > 0 &&
                      verticals.map((vertical) => (
                        <div
                          className="tag"
                          key={vertical}
                          style={{
                            backgroundColor: colors[this.getColorNum(vertical)],
                          }}
                        >
                          {vertical}
                        </div>
                      ))} */}
                  </div>
                  {/* <div className="contact">
                    <ReactGA.OutboundLink
                      eventLabel="viewProfile"
                      to={`/view_profile/${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      view profile
                    </ReactGA.OutboundLink>
                  </div> */}
                </div>
              );
            })}
          </Masonry>
        </div>
      </div>
    </>
  );
}

export default function SponsorsPage({ user }) {
  const [sponsors, setSponsors] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const getSponsors = async () => {
      setLoading(true);
      const { data } = await API.get("treehacks", "/sponsors", {});
      setSponsors(data);
      setLoading(false);
    };

    getSponsors();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <SponsorsList sponsors={sponsors} user={user} setSponsors={setSponsors} />
      )}
    </>
  );
}
