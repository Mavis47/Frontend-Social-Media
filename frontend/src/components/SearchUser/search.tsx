//@ts-nocheck

import "./search.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth.context";

export type User = {
  id: string;
  fullname: string;
  username: string;
  ProfilePic: string;
};

export default function Search() {
  const { auth } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.token) return;
    console.log("token being sent in Search", auth.token);

    const searchData = await axios.get(
      `https://social-media-kohl-psi.vercel.app/api/auth/searchAllUsers/${username}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    console.log("Search Results", searchData.data);
    setSearchResults([searchData.data]);
  };

  const fetchAllUsers = async () => {
    if (!auth.token) return;

    console.log("token being sent", auth.token);

    const usersData = await axios.get(
      `https://social-media-kohl-psi.vercel.app/api/auth/allUsers`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    console.log("All Users Data", usersData.data.data);
    setOtherUsers(usersData.data.data);
  };

  useEffect(() => {
    fetchAllUsers();
  }, [auth.token]);

  return (
    <div className="search-container">
      <form action="" onSubmit={handleSearch}>
        <div className="input-field">
          <input
            type="text"
            placeholder="Search a User..."
            id="Search-input"
            onChange={(e) => {
              setUsername(e.target.value);
              if (e.target.value === "") {
                setSearchResults([]);
              }
            }}
          />
        </div>
      </form>
      <div className="user-container">
        {searchResults.length > 0
          ? searchResults.map((user) => (
              <div key={user.id} className="user">
                <div className="search-box">
                  <div
                    className="chat-content"
                    style={{ width: "16vw !important", padding: "13px" }}
                  >
                    <img src={user.ProfilePic} alt="" className="photo" />
                    <div className="our-profile">
                      <span>{user.username}</span>
                      <span>{user.fullname}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          : otherUsers.map((user) => (
              <div key={user.id} className="user">
                <div className="search-box">
                  <div
                    className="chat-content"
                    style={{ width: "16vw !important", padding: "13px" }}
                  >
                    <img src={user.userProfilePic} alt="" className="photo" />
                    <div className="our-profile">
                      <span>{user.username}</span>
                      <span>{user.fullname}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
