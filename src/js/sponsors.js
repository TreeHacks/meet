import React from "react";
import API from "@aws-amplify/api";
import Masonry from "react-masonry-component";

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
                <li
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    listStyle: "none",
                    gap: 15,
                    border: "1px solid rgba(12, 176, 138, 0.75)",
                    padding: 30,
                  }}
                  key={`sponsor-${sponsor._id}}`}
                >
                  {sponsor.name && (
                    <h1 style={{ padding: 0, margin: 0, marginBottom: 10 }}>
                      {sponsor.name}
                    </h1>
                  )}
                  {sponsor.description && (
                    <p style={{ padding: 0, margin: 0 }}>{sponsor.description}</p>
                  )}
                  {sponsor.logo_url && <img src={sponsor.logo_url} />}
                  <p style={{ padding: 0, margin: 0 }}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={sponsor.website_url}
                    >
                      Website
                    </a>
                  </p>
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
                </li>
              );
            })}{" "}
          </Masonry>
        </div>
      </div>
    </>
  );
}

export default function SponsorsPage({ user }) {
  const [sponsors, setSponsors] = React.useState([]);

  React.useEffect(() => {
    const getSponsors = async () => {
      const { data } = await API.get("treehacks", "/sponsors", {});
      setSponsors(data);
    };

    getSponsors();
  }, []);

  return <SponsorsList sponsors={sponsors} user={user} setSponsors={setSponsors} />;
}
