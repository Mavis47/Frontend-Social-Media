import Sidebar from "../sidebar/sidebar";
import "./ProfilePage.css";
import Photo from "../photos/mypic.jpg";
import mypic from "../photos/watch.jpg";
import { useAuth } from "../contexts/auth.context";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Media = {
  id: number;
  postId: number;
  url: string;
  type: "IMAGE" | "VIDEO"; // Adjust based on your actual data structure
};

type Post = {
  id: number;
  media: Media[];
};

type User = {
  username: string;
  email: string;
  fullname: string;
  followers: string; // Adjust based on your actual data structure
  following: string; // Adjust based on your actual data structure
  userProfilePic: string;
  posts: Post[];
};

export default function ProfilePage() {
  const { auth } = useAuth();
  const [profileData, setProfileData] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleGetMe = async () => {
    if (!auth.token) return;
    try {
      const { data } = await axios.get(
        `http://social-media-kohl-psi.vercel.app/api/auth/getMe`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setProfileData(data.user);
    } catch (error) {
      console.error("Error fetching profile data", error);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await axios.delete(
        `http://social-media-kohl-psi.vercel.app/api/auth/deleteProfile`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      alert("Profile Has Been Deleted");
      navigate("/");
    } catch (error) {
      console.log("Error In Deleting Profile", error);
    }
  };

  useEffect(() => {
    handleGetMe();
  }, [auth.token]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="Profile-Container">
        <div className="profile-inside-container">
          <div className="profilepic">
            <img src={profileData?.userProfilePic || Photo} alt="Profile" />
          </div>
          <div className="profileInfo">
            <div className="heading">
              <span>{profileData?.username || "MY ProfileName"}</span>
              <button className="profile-button">
                <a href="/edit-profile">Edit Profile</a>
              </button>
              <button className="profile-button" onClick={handleDeleteProfile}>
                Delete Profile
              </button>
            </div>
            <div className="mid-heading">
              <span>{profileData?.posts.length || 0} posts</span>
              <span>{profileData?.followers.length || 0} followers</span>
              <span>{profileData?.following.length || 0} following</span>
            </div>
            <h1>{profileData?.fullname || "My full Name"}</h1>
          </div>
        </div>
        <div className="All-posts">
          <div className="post-container">
            {profileData?.posts.flatMap((post) =>
              post.media.map((media) => (
                <div className="single-posts" key={media.id}>
                  {media.type === "IMAGE" ? (
                    <img src={media.url || mypic} alt="Post" />
                  ) : (
                    <video src={media.url} controls />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
