// import { useEffect } from "react";

// function Home() {
//   useEffect(() => {
//     window.location.href = "/index.html"; // Redirects to backend-served HTML
//   }, []);

//   return <p>Loading...</p>;
// }

// export default Home;
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/generate"); // Redirect to the Generate page
  }, [navigate]);

  return <p>Redirecting...</p>;
}

export default Home;
