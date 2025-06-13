// import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import { LoginLogo, IoLogInOutline } from "../SVG/index";
import { Input, Loader } from "../index";
import { REGISTER_USER, LOGIN_USER } from "../../Utils/index";

const Auth = () => {
  const navigate = useNavigate(); // Initialize navigation
  const [auth, setAuth] = useState(true);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(null);

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [signUp, setSignUp] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Debugging: Track auth state changes
  useEffect(() => {
    console.log("Auth state changed:", auth);
  }, [auth]);

  // Login API call
  const CALLING_LOGIN_USER = async () => {
    try {
      setLoader(true);
      const response = await LOGIN_USER(login);
      setLoader(false);

      if (response.success) {
        console.log("Login successful:", response);
        navigate("/generate"); // Redirect to Generate page
      } else {
        setError(response.error);
      }
    } catch (error) {
      setLoader(false);
      setError(error.response?.data?.error || "Login failed");
      console.log(error);
    }
  };

  // Signup API call
  const CALLING_REGISTER_USER = async () => {
    try {
      setLoader(true);
      const response = await REGISTER_USER(signUp);
      setLoader(false);

      if (response.success) {
        console.log("Signup successful:", response);
        setAuth(true); // Switch to login after signup
      } else {
        setError(response.error);
      }
    } catch (error) {
      setLoader(false);
      setError(error.response?.data?.error || "Signup failed");
      console.log(error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-zinc-900 bg-opacity-40 z-50" style={{ pointerEvents: "auto" }} />
      <div
        className="bg-zinc-800 items-center fixed shadow-xl rounded-2xl z-50 px-8 py-8 text-sm border-zinc-700"
        style={{
          top: "50%",
          transform: "translate(-50%,-50%)",
          left: "50%",
          maxWidth: "330px",
          width: "100%",
          maxHeight: "85vh",
        }}
      >
        <div>
          <div className="flex flex-col text-zinc-200 text-center items-center">
            <LoginLogo />

            {auth ? (
              <div style={{ marginTop: "1rem" }}>
                <Input
                  placeholder="Email Address"
                  type="email"
                  handleChange={(e) => setLogin({ ...login, email: e.target.value })}
                />

                <Input
                  placeholder="Password"
                  type="password"
                  handleChange={(e) => setLogin({ ...login, password: e.target.value })}
                  styleCss="1rem"
                />

                <button
                  onClick={CALLING_LOGIN_USER}
                  className="hover:brightness-110 bg-gradient-to-t from-indigo-800 via-indigo-800 to-indigo-700 border border-indigo-800 px-4 py-1.5 rounded-lg shadow h-9 w-64 drop-shadow flex items-center justify-center mt-3"
                >
                  Login {loader && <Loader />}
                </button>

                {error && (
                  <p style={{ color: "red", paddingTop: ".5rem" }}>
                    NOTICE: {error}
                  </p>
                )}

                <p
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: ".5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => setAuth(false)}
                >
                  Sign Up <IoLogInOutline />
                </p>
              </div>
            ) : (
              <div style={{ marginTop: "1rem" }}>
                <Input
                  placeholder="Name"
                  type="text"
                  handleChange={(e) => setSignUp({ ...signUp, name: e.target.value })}
                  styleCss="1rem"
                />
                <Input
                  placeholder="Email Address"
                  type="email"
                  handleChange={(e) => setSignUp({ ...signUp, email: e.target.value })}
                  styleCss="1rem"
                />
                <Input
                  placeholder="Password"
                  type="password"
                  handleChange={(e) => setSignUp({ ...signUp, password: e.target.value })}
                  styleCss="1rem"
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  handleChange={(e) => setSignUp({ ...signUp, confirmPassword: e.target.value })}
                  styleCss="1rem"
                />

                <button
                  onClick={CALLING_REGISTER_USER}
                  className="hover:brightness-110 bg-gradient-to-t from-indigo-800 via-indigo-800 to-indigo-700 border border-indigo-800 px-4 py-1.5 rounded-lg shadow h-9 w-64 drop-shadow flex items-center justify-center mt-3"
                >
                  Sign Up {loader && <Loader />}
                </button>

                {error && (
                  <p style={{ color: "red", paddingTop: ".5rem" }}>
                    NOTICE: {error}
                  </p>
                )}

                <p
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: ".5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => setAuth(true)}
                >
                  Login <IoLogInOutline />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
