import React from "react";
import API from "@aws-amplify/api";

const ADMIN_LOGIN_URL = `${process.env.REACT_APP_LOGIN_URL}?redirect=${window.location.origin}${window.location.pathname}`;

function AdminRegister() {
  const [registerAttributes, setRegisterAttributes] = React.useState({
    email: "",
    password: "",
  });
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
          ...registerAttributes,
        },
      });
      window.location.href = ADMIN_LOGIN_URL;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleRegistration}>
        <input
          onChange={(e) =>
            setRegisterAttributes({ ...registerAttributes, email: e.target.value })
          }
          value={registerAttributes.email}
          type="text"
          placeholder="Email"
        />
        <input
          onChange={(e) =>
            setRegisterAttributes({ ...registerAttributes, password: e.target.value })
          }
          value={registerAttributes.password}
          type="password"
          placeholder="Password"
        />
        <button type="submit">Submit</button>
      </form>
      <p>
        Already have an account? Login <a href={ADMIN_LOGIN_URL}>here</a>
      </p>
    </>
  );
}

function AdminDashboard({user}) {
  return <div>test</div>;
}

export default function SponsorAdminPage({ user }) {
  console.log("user", user);
  return (
    <div>
      <h1>Sponsor Admin Page</h1>
      {user ? <AdminDashboard user={user}/> : <AdminRegister />}
    </div>
  );
}
