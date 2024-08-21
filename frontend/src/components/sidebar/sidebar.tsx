//@ts-nocheck

import "./sidebar.css";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth.context";
import { ChangeEvent, useEffect, useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";

// type User = {
//   id: number;
//   username: string;
//   fullname: string;
//   ProfilePic: string;
// }

export default function Sidebar() {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const [loginuserData, setloginuserData] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | "">("");

  const handleLogout = async () => {
    // e.preventDefault();
    await axios.post(
      `https://social-media-kohl-psi.vercel.app/api/auth/logout`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/");
  };

  const handleGetMe = async () => {
    if (!auth.token) return;
    const getLoginUserData = await axios.get(
      `https://social-media-kohl-psi.vercel.app/api/auth/getMe`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    console.log("User Pic :-", getLoginUserData.data.user);
    setloginuserData(getLoginUserData.data.user);
  };

  useEffect(() => {
    handleGetMe();
  }, [auth.token]);

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", content);
    if (selectedFile) {
      formData.append("media", selectedFile);
    }
    console.log("SElected File :- ", selectedFile);

    try {
      const createPostData = await axios.post(
        `https://social-media-kohl-psi.vercel.app/api/post/addPost`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Post Created", createPostData);
      if (createPostData) {
        navigate("/homepage");
        alert("Post Created");
      }
    } catch (error) {
      console.log("Error Creating Post", error);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      const type = file.type.startsWith("video") ? "video" : "image";
      setFileType(type);
    }
  };

  return (
    <section className="sidebar">
      <div className="instagramlogo">
        <a href="/Homepage">
          <h3 className="instagram-text p-5 font-medium">Instagram</h3>
        </a>
      </div>
      <ul className="ul">
        <a href="/Homepage">
          <li>
            <HomeIcon className="icon-margin" />
            <span className="text-margin">Home</span>
          </li>
        </a>
        <a href="/searchUser">
          <li>
            <SearchIcon className="icon-margin" />
            <span className="text-margin">Search</span>
          </li>
        </a>

        <li>
          <MessageOutlinedIcon className="icon-margin" />
          <span className="text-margin">
            <a href="/messages">Messages</a>
          </span>
        </li>
        <a href="/notification">
          <li>
            <FavoriteBorderOutlinedIcon className="icon-margin" />
            <span className="text-margin">Notifications</span>
          </li>
        </a>
        <button
          data-modal-target="static-modal"
          data-modal-toggle="static-modal"
          className="block text-white "
          type="button"
        >
          <li>
            <AddBoxOutlinedIcon className="icon-margin" />
            <span className="text-margin">Create</span>
          </li>
        </button>

        <li className="profile-item ">
          <a href="/profilePage" className="myprofile">
            <img
              src={loginuserData.userProfilePic}
              alt="profileImage"
              className="profile-image"
            />
            <span className="text-margin">{loginuserData.username}</span>
          </a>
        </li>
        <li onClick={handleLogout}>
          <LogoutIcon className="icon-margin" />
          <span className="text-margin">Logout</span>
        </li>
      </ul>

      {/* <!-- Main modal --> */}
      <div
        id="static-modal"
        data-modal-backdrop="static"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          {/* <!-- Modal content --> */}
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            {/* <!-- Modal header --> */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add A New Post
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="static-modal"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* <!-- Modal body --> */}
            <form action="" onSubmit={handleCreatePost}>
              <div className="p-4 md:p-5 space-y-4">
                <input
                  type="text"
                  placeholder="Enter Caption for Your Post"
                  style={{ width: "39vw" }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                <p>Hey! Press Enter To Upload Media....</p>
                <div
                  className="showfile"
                  style={{
                    height: "286px",
                    width: "100%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="file-container"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {fileType === "image" && selectedFile && (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        style={{
                          width: "36%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    {fileType === "video" && selectedFile && (
                      <video
                        controls
                        style={{
                          width: "36%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      >
                        <source
                          src={URL.createObjectURL(selectedFile)}
                          type={selectedFile.type}
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              </div>

              {/* <!-- Modal footer --> */}
              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  data-modal-hide="static-modal"
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
