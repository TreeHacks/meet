import React from "react";
import API from "@aws-amplify/api";

function SponsorsList({ sponsors, user }) {
  const likeSponsor = (sponsorId) => {
    API.put("treehacks", `/sponsor/${sponsorId}/hacker`, {
      body: {
        email: user.attributes.email,
      },
    });
  };

  const removeLike = (sponsorId) => {
    API.delete("treehacks", `/sponsor/${sponsorId}/hacker`, {
      body: {
        email: user.attributes.email,
      },
    });
  };
  return (
    <>
      {sponsors.map((sponsor) => {
        const alreadyLiked = sponsor.users?.hacker_emails.includes(user.attributes.email);
        const isSponsor = user.attributes["cognito:groups"].includes("sponsor");

        return (
          <>
            <h1>{sponsor.name}</h1>
            <p>{sponsor.description}</p>
            <img src={sponsor.logo_url} />
            <a href={sponsor.website_url}>Website</a>
            {!isSponsor && (
              <>
                {alreadyLiked ? (
                  <button onClick={() => removeLike(sponsor._id)}>Remove Interest</button>
                ) : (
                  <button onClick={() => likeSponsor(sponsor._id)}>Show Interest</button>
                )}
              </>
            )}
          </>
        );
      })}
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

  return <SponsorsList sponsors={sponsors} user={user} />;
}
