import React from "react";
import API from "@aws-amplify/api";

function SponsorsList({ sponsors }) {
  return (
    <>
      {sponsors.map((sponsor) => (
        <div>
          {sponsor.name}
          {sponsor.description}
          {sponsor.logo_url}
          {sponsor.website_url}
        </div>
      ))}
    </>
  );
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = React.useState([]);

  const getSponsors = async () => {
    const { data } = await API.get("treehacks", "/sponsors", {});
    setSponsors(data);
  };

  React.useEffect(() => {
    getSponsors();
  }, []);

  return <SponsorsList sponsors={sponsors} />;
}
