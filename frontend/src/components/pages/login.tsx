import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth.context";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://social-media-kohl-psi.vercel.app/api/auth/login`,
        { username, password }
      );
      console.log("loginData", response.data);
      if (response.status === 200) {
        alert("Logged-In Successfully");
        localStorage.setItem("auth", JSON.stringify(response.data));
        setAuth(response.data);
        navigate("/homepage");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.error || "Invalid Credentials");
      } else {
        alert("An error occurred. Please try again.");
      }
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        id="signup-form"
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-cyan-500">
          Login
        </h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter Your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4 text-center">
          <h3 className="text-black">
            <a href="/signup" className="text-blue-500 hover:underline">
              Don't Have an Account? Click here...
            </a>
          </h3>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
