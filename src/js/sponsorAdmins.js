import React from "react";
import API from "@aws-amplify/api";

import Loading from "./loading";

const ADMIN_LOGIN_URL = `${process.env.REACT_APP_LOGIN_URL}?redirect=${window.location.origin}${window.location.pathname}`;

function AdminRegister() {
  const [email, setEmail] = React.useState("");
  const [registered, setRegistered] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const token = new URLSearchParams(window.location.search).get("tkn");

  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("treehacks", "/sponsor/admin", {
        body: {
          token,
          email,
        },
      });
      setRegistered(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {registered ? (
        <p>Successfully registered! Please check your email</p>
      ) : (
        <div
          style={{
            display: "flex",
            width: "100vw",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading ? (
            <Loading />
          ) : (
            <form
              style={{
                marginTop: 50,
                display: "flex",
                flexDirection: "column",
                width: "250px",
                border: "1px solid rgba(12, 176, 138, 0.75)",
                borderRadius: 5,
                padding: 20,
              }}
              onSubmit={handleRegistration}
            >
              <h3 style={{ fontSize: 24 }}>Create an Account</h3>
              <input
                style={{
                  padding: 5,
                  border: "1px solid rgba(12, 176, 138, 0.75)",
                  fontSize: 17,
                }}
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email"
              />
              <div style={{ width: "100%", display: "flex", justifyContent: "right" }}>
                <button
                  style={{
                    marginTop: 10,
                    width: 70,
                    backgroundColor: "whitespace",
                    border: "none",
                    borderRadius: 5,
                    padding: 5,
                    cursor: "pointer",
                    fontSize: 15,
                  }}
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!loading && (
        <p>
          Already have an account? Login <a href={ADMIN_LOGIN_URL}>here</a>
        </p>
      )}
    </>
  );
}

function SponsorPrize() {
  return (
    <form>
      <input type="text" placeholder="prize name" />
      <input type="text" placeholder="prize description" />
      <input type="text" placeholder="prize image" />
      <input type="text" placeholder="prize value" />
      <input type="text" placeholder="prize quantity" />
      <input type="text" placeholder="prize sponsor" />
      <input type="text" placeholder="prize sponsor description" />
      <input type="text" placeholder="prize sponsor logo" />
    </form>
  );
}

function SponsorUpdate({ user }) {
  const [attributes, setAttributes] = React.useState({
    name: "",
    description: "",
    logo_url: "",
    website_url: "",
    prizes: [],
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [file, setFile] = React.useState();

  React.useEffect(() => {
    setLoading(true);
    const getSponsor = async () => {
      const { data } = await API.get(
        "treehacks",
        `/sponsor?email=${user.attributes.email}`,
        {}
      );
      setAttributes(data);
      setLoading(false);
    };
    getSponsor();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put("treehacks", "/sponsor", {
        body: {
          updated_by: user.attributes.email,
          ...attributes,
        },
      });

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `http://localhost:9000/api/sponsor/logo?e=${user.attributes.email}`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `${localStorage.getItem("jwt")}`,
            },
          }
        );

        const { data } = await res.json();
        setAttributes(data);
      }
    } catch (err) {
      setError();
    } finally {
      setLoading(false);
    }
  };

  console.log("a", attributes);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form
            style={{
              marginTop: 50,
              display: "flex",
              flexDirection: "column",
              width: "250px",
              border: "1px solid rgba(12, 176, 138, 0.75)",
              borderRadius: 5,
              padding: 20,
              gap: 10,
            }}
            onSubmit={handleSubmit}
          >
            <h3 style={{ fontSize: 24 }}>Update Sponsor Profile</h3>
            {attributes?.logo_url && (
              <img
                src={attributes.logo_url}
                alt="company logo"
                width="100%"
                height="100%"
              />
            )}
            <input
              type="file"
              title="logo"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <input
              style={{
                padding: 5,
                border: "1px solid rgba(12, 176, 138, 0.75)",
                fontSize: 17,
              }}
              onChange={(e) => setAttributes({ ...attributes, name: e.target.value })}
              value={attributes?.name}
              type="text"
              placeholder="company name"
            />
            <input
              style={{
                padding: 5,
                border: "1px solid rgba(12, 176, 138, 0.75)",
                fontSize: 17,
              }}
              onChange={(e) =>
                setAttributes({ ...attributes, description: e.target.value })
              }
              value={attributes?.description}
              type="text"
              placeholder="description"
            />
            <input
              style={{
                padding: 5,
                border: "1px solid rgba(12, 176, 138, 0.75)",
                fontSize: 17,
              }}
              onChange={(e) =>
                setAttributes({ ...attributes, website_url: e.target.value })
              }
              value={attributes?.website_url}
              type="text"
              placeholder="website url"
            />
            <div style={{ width: "100%", display: "flex", justifyContent: "right" }}>
              <button
                style={{
                  marginTop: 10,
                  width: 70,
                  backgroundColor: "whitespace",
                  border: "none",
                  borderRadius: 5,
                  padding: 5,
                  cursor: "pointer",
                  fontSize: 15,
                }}
                type="submit"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function HackerInterest({ user }) {
  const [hackers, setHackers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const getSponsor = async () => {
      setLoading(true);
      const { data } = await API.get(
        "treehacks",
        `/sponsor/hackers?email=${user.attributes.email}`,
        {}
      );
      setHackers(data);
      setLoading(false);
    };
    getSponsor();
  }, []);

  return (
    <>
      <h1>Hackers</h1>
      {loading ? (
        <Loading />
      ) : (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ul
            style={{
              display: "flex",
              flexWrap: "wrap",
              width: "80%",
              justifyContent: "space-around",
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {hackers.map((hacker) => (
              <li key={`hacker-${hacker._id}`} style={{ width: 300 }}>
                <p>
                  <b>
                    {" "}
                    {hacker.forms.application_info.first_name}{" "}
                    {hacker.forms.application_info.last_name}
                  </b>
                </p>
                <p>
                  <a href={`mailto:${hacker.user.email}`}>{hacker.user.email}</a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function AdminDashboard({ user }) {
  const [sponsorUpdate, setUpdatePage] = React.useState(true);
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          style={{
            padding: 5,
            fontSize: 20,
            cursor: "pointer",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: sponsorUpdate ? "1px solid rgba(12, 176, 138, 0.75)" : "none",
          }}
          onClick={() => setUpdatePage(true)}
        >
          Sponsor Account
        </button>
        <button
          style={{
            padding: 5,
            fontSize: 20,
            cursor: "pointer",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: !sponsorUpdate ? "1px solid rgba(12, 176, 138, 0.75)" : "none",
          }}
          onClick={() => setUpdatePage(false)}
        >
          Hacker Interest
        </button>
      </div>

      {sponsorUpdate ? <SponsorUpdate user={user} /> : <HackerInterest user={user} />}
    </>
  );
}

export default function SponsorAdminPage({ user }) {
  return (
    <div>
      <h1>Sponsor Admin Page</h1>
      {user ? <AdminDashboard user={user} /> : <AdminRegister />}
    </div>
  );
}
