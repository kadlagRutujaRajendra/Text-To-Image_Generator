// import { Link, useNavigate } from "react-router-dom";

// const Header = ({ setActiveTab }) => {
//   const navigate = useNavigate();

//   return (
//     <nav className="navbar">
//       <h1>AI Art Generator</h1>
//       <ul>
//         <li><button onClick={() => setActiveTab("generate")}>Home</button></li>
//         <li><button onClick={() => setActiveTab("likes")}>Likes</button></li>
//         <li><button onClick={() => setActiveTab("history")}>History</button></li>
//         <li><button onClick={() => navigate("/login")}>Profile</button></li>
//       </ul>
//     </nav>
//   );
// };

// export default Header;
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Cookies from "js-cookie";

const Header = ({ setActiveTab }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("login"); // Redirects to login if token is missing
    }
  }, []);

  return (
    <nav className="navbar">
      <h1>AI Art Generator</h1>
      <ul>
        <li><button onClick={() => setActiveTab("login")}>Home</button></li>
        <li><button onClick={() => setActiveTab("generate")}>Generate</button></li>
        <li><button onClick={() => setActiveTab("likes")}>Likes</button></li>
        <li><button onClick={() => setActiveTab("history")}>History</button></li>
        <li><button onClick={()=> setActiveTab("edit")}>Edit</button></li>
        <li><button onClick={() => navigate("/login")}>Profile</button></li>
      </ul>
    </nav>
  );
};

export default Header;
