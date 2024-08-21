import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth.context";

export default function EditProfile() {
  const [email, setEmail] = useState("");
  const [fullname, setfullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.token) return;
      try {
        const response = await axios.get(
          "http://social-media-kohl-psi.vercel.app/api/auth/getMe",
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        const { email, fullname, username, gender } = response.data.user;

        setEmail(email);
        setfullname(fullname);
        setUsername(username);
        setGender(gender);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth.token]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("email", email);
    formData.append("fullname", fullname);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("gender", gender);

    const data = {
      email,
      fullname,
      username,
      password,
      gender,
    };

    try {
      const response = await axios.put(
        "http://social-media-kohl-psi.vercel.app/api/auth/updateProfile",
        data,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Updated Data:", response.data);
      alert("Profile Updated");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleUpdate}
        id="update-form"
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-cyan-500">
          Update Profile
        </h1>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter Your Full Name"
            value={fullname}
            onChange={(e) => setfullname(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter Your Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
}
