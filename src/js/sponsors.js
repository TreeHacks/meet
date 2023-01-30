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
          {sponsors && sponsors.length === 0 && (
            <>
              <p>No sponsors have registered yet</p>
            </>
          )}
          <Masonry className={"gallery"} options={{}}>
            {sponsors.map((sponsor) => {
              const alreadyLiked = sponsor.users?.hacker_emails.includes(
                user.attributes.email
              );

              const isSponsor = user.attributes["cognito:groups"].includes("sponsor");

              return (
                <div
                  className={"entry"}
                  style={{ width: 220, padding: 20, position: "relative", margin: 30 }}
                >
                  <div className="header">
                    {sponsor?.logo_url && (
                      <img
                        src={sponsor.logo_url}
                        alt="sponsor logo"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <h3
                      style={{
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {sponsor.name}
                    </h3>
                  </div>
                  {sponsor.description && <div style={{}}>{sponsor.description}</div>}

                  {sponsor.website_url && (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={
                        sponsor.website_url.includes("http")
                          ? sponsor.website_url
                          : `https://${sponsor.website_url}`
                      }
                    >
                      website
                    </a>
                  )}

                  {sponsor.prizes &&
                    sponsor.prizes.length > 0 &&
                    sponsor.prizes.map((prize) => {
                      return (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 10,
                            paddingBottom: 10,
                          }}
                        >
                          <h4 style={{ margin: 0, padding: 0 }}>Prize: {prize.name}</h4>
                          <p style={{ margin: 0, padding: 0 }}>
                            Description: {prize.description}
                          </p>
                          <p style={{ margin: 0, padding: 0 }}>Reward: {prize.reward}</p>
                          <p style={{ margin: 0, padding: 0 }}>Type: {prize.type}</p>
                        </div>
                      );
                    })}

                  {/* {sponsor.prizes && // for prizes
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
                  <button
                    style={{
                      cursor: "pointer",
                      background: "transparent",
                      border: "none",
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                    }}
                    onClick={() =>
                      alreadyLiked ? removeLike(sponsor._id) : likeSponsor(sponsor._id)
                    }
                  >
                    <span
                      style={{
                        color: alreadyLiked ? "rgba(12, 176, 138, 0.75)" : "transparent",
                        WebkitTextStroke: "1px rgba(12, 176, 138, 0.75)",
                        fontSize: 20,
                      }}
                    >
                      &hearts;
                    </span>
                  </button>
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
