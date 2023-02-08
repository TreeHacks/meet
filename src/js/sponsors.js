import React from "react";
import API from "@aws-amplify/api";
import Loading from "./loading";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";

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
            hacker_emails: [
              ...sponsor.users.hacker_emails,
              user.attributes.email,
            ],
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
  const [open, setOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState({});
  const handleOpen = (data) => {
    console.log("eopened");
    setOpen(true);
    setModalData(data);
  };

  const handleClose = () => setOpen(false);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    overflowY: "scroll",
    transform: "translate(-50%, -50%)",
    width: 400,
    height: "80%",
    bgcolor: "background.paper",
    boxShadow: 24,
  };
  return (
    <>
      <div id="table">
        <div className="sponsorContent">
          {sponsors && sponsors.length === 0 && (
            <>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "20px",
                  margin: "0 auto",
                  padding: "20px",
                  border: "1px solid green",
                  width: "fit-content",
                  marginTop: "20px",
                }}
              >
                <p>No sponsors have registered yet</p>
              </div>
            </>
          )}
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={open}>
              <Box sx={style}>
                <div
                  className={"entry"}
                  style={{
                    padding: 20,
                    width: "auto",
                    position: "relative",
                    margin: 15,
                  }}
                >
                  <div className="header">
                    {modalData?.logo_url && (
                      <img
                        src={modalData.logo_url}
                        alt="sponsor logo"
                        style={{
                          objectFit: "contain",
                          width: 100,
                          marginBottom: "20px",
                        }}
                      />
                    )}
                    <h3
                      style={{
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {modalData.name}
                    </h3>
                  </div>
                  {modalData.description && (
                    <div style={{}}>{modalData.description}</div>
                  )}

                  {modalData.website_url && (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={
                        modalData.website_url.includes("http")
                          ? modalData.website_url
                          : `https://${modalData.website_url}`
                      }
                    >
                      website
                    </a>
                  )}

                  {modalData.prizes && modalData.prizes.length > 0 && (
                    <div>
                      {modalData.prizes.map((prize) => {
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
                            <h4 style={{ margin: 0, padding: 0 }}>
                              Prize: {prize.name}
                            </h4>
                            <p style={{ margin: 0, padding: 0 }}>
                              Description: {prize.description}
                            </p>
                            <p style={{ margin: 0, padding: 0 }}>
                              Reward: {prize.reward}
                            </p>
                            <p style={{ margin: 0, padding: 0 }}>
                              Type: {prize.type}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Box>
            </Fade>
          </Modal>
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
          >
            <Masonry>
              {sponsors.map((sponsor) => {
                const alreadyLiked = sponsor.users?.hacker_emails.includes(
                  user.attributes.email
                );

                const isSponsor =
                  user.attributes["cognito:groups"].includes("sponsor");

                return (
                  <div
                    className={"entry"}
                    style={{
                      padding: 20,
                      width: "auto",
                      position: "relative",
                      margin: 15,
                    }}
                  >
                    <div className="header">
                      {sponsor?.logo_url && (
                        <img
                          src={sponsor.logo_url}
                          alt="sponsor logo"
                          style={{ objectFit: "contain" }}
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
                    {sponsor.description && (
                      <div style={{}}>{sponsor.description}</div>
                    )}

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

                    {/* if you have prizes and its less than 2, we display all of them */}
                    {sponsor.prizes &&
                      sponsor.prizes.length > 0 &&
                      sponsor.prizes.length <= 2 &&
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
                            <h4 style={{ margin: 0, padding: 0 }}>
                              Prize: {prize.name}
                            </h4>
                            <p style={{ margin: 0, padding: 0 }}>
                              Description: {prize.description}
                            </p>
                            <p style={{ margin: 0, padding: 0 }}>
                              Reward: {prize.reward}
                            </p>
                            <p style={{ margin: 0, padding: 0 }}>
                              Type: {prize.type}
                            </p>
                          </div>
                        );
                      })}

                    {/* if you have prizes and its more than 2, we display only 2, and the rest will be shown in see more */}
                    {sponsor.prizes &&
                      sponsor.prizes.length > 0 &&
                      sponsor.prizes.length > 2 && (
                        <div>
                          {sponsor.prizes.slice(0, 2).map((prize) => {
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
                                <h4 style={{ margin: 0, padding: 0 }}>
                                  Prize: {prize.name}
                                </h4>
                                <p style={{ margin: 0, padding: 0 }}>
                                  Description: {prize.description}
                                </p>
                                <p style={{ margin: 0, padding: 0 }}>
                                  Reward: {prize.reward}
                                </p>
                                <p style={{ margin: 0, padding: 0 }}>
                                  Type: {prize.type}
                                </p>
                              </div>
                            );
                          })}
                          <Button
                            onClick={() => handleOpen(sponsor)}
                            style={{
                              backgroundColor: "#0CB08A",
                              color: "white",
                              marginTop: "5px",
                              borderRadius: "20px",
                              textTransform: "none",
                              paddingLeft: "10px",
                              paddingRight: "10px",
                            }}
                          >
                            See more
                          </Button>
                        </div>
                      )}

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
                        alreadyLiked
                          ? removeLike(sponsor._id)
                          : likeSponsor(sponsor._id)
                      }
                    >
                      <span
                        style={{
                          color: alreadyLiked
                            ? "rgba(12, 176, 138, 0.75)"
                            : "transparent",
                          WebkitTextStroke: "1px rgba(12, 176, 138, 0.75)",
                          fontSize: 20,
                        }}
                      >
                        &hearts;
                      </span>
                    </button>
                  </div>
                );
              })}
            </Masonry>
          </ResponsiveMasonry>
        </div>
      </div>
    </>
  );
}

export default function SponsorsPage({ user }) {
  const [sponsors, setSponsors] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(undefined);

  React.useEffect(() => {
    const getSponsors = async () => {
      setLoading(true);

      const body = await API.get("treehacks", "/sponsors", {})
        .then((response) => {
          return response;
        })
        .catch((error) => {
          // console.(error);
          // console.log(error.response.status);
          // console.log(error.response.data);
          return error;
        });

      const status = body.response?.status ? body.response.status : 200;

      if (status !== 200) {
        setError("You have don't have access");
        setLoading(false);
        return;
      }
      const data = body.data;

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
        <>
          {error ? (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                margin: "0 auto",
                padding: "20px",
                border: "1px solid green",
                width: "fit-content",
                marginTop: "20px",
              }}
            >
              Error: {error}
            </div>
          ) : (
            <SponsorsList
              sponsors={sponsors}
              user={user}
              setSponsors={setSponsors}
            />
          )}
        </>
      )}
    </>
  );
}
