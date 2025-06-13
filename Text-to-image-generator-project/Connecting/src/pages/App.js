import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import Home from "./Home";
import Generate from "./Generate";
import Likes from "./Likes";
import Edit from "./Edit";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    console.log("Checking authentication...");
    const token = localStorage.getItem("token");
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={() => setAuthenticated(true)} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={authenticated ? <Home /> : <Login />} />
        <Route path="/generate" element={authenticated ? <Generate /> : <Login />} />
        <Route path="/likes" element={authenticated ? <Likes/> :<Login/>}/>
        <Route path="/edit" element={authenticated ? <Edit/> : <Login/>}/>
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
