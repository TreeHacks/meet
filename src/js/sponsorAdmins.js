import React from "react";
import API from "@aws-amplify/api";

function AdminRegister({setUser}) {
  const [registerAttributes, setRegisterAttributes] = React.useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const token = new URLSearchParams(window.location.search).get("tkn")


  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("treehacks", "/sponsor/admin", {
        token,
        ...registerAttributes,
      });
      setUser(data)
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
          type="text"
          placeholder="Email"
        />
        <input
          onChange={(e) =>
            setRegisterAttributes({ ...registerAttributes, password: e.target.value })
          }
          type="password"
          placeholder="Password"
        />
        <button type="submit">Submit</button>
      </form>
      <p>
        Already have an account? Login <a>here</a>
      </p>
    </>
  );
}

function AdminDashboard() {
  return <div>test</div>;
}

export default function SponsorAdminPage({ user, setUser }) {
    console.log("user", user)
  return (
    <div>
      <h1>Sponsor Admin Page</h1>
      {user ? <AdminDashboard /> : <AdminRegister setUser={setUser}/>}
    </div>
  );
}
