import React from "react";

function Login(props) {
  return (
    <div className="login-container">
      <h1 className="welcome-message">
        Welcome to decentralized voting application
      </h1>
      <button className="login-button" onClick={props.connectAccount}>
        Login for Vote
      </button>
    </div>
  );
}

export default Login;
