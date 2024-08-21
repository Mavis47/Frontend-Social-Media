import { ChangeEvent, useState } from "react";
import axios from "axios";
import "./Signup.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [fullname, setfullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [productImage, setProductImage] = useState<File | null>();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target!.files!.length > 0) {
      setProductImage(e.target?.files?.[0]);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("Profile_Image", productImage as File);
    formData.append("email", email);
    formData.append("fullname", fullname);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("gender", gender);

    const signupData = await axios.post(
      `http://localhost:5001/api/auth/signup`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/Form-data",
        },
      }
    );
    console.log("SignupData", signupData);
    if (signupData) {
      alert("Registration Successfull");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSignup} id="signup-form" className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-cyan-500">Signup</h1>
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
        <div className="mb-4">
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4 text-center">
          <h3 className="text-black">
            <a href="/" className="text-blue-500 hover:underline">Already Have an Account? Click here...</a>
          </h3>
        </div>
        <div className="text-center">
          <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
