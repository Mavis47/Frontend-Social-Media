import "./RightSidebar.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/auth.context";

export type User = {
  userProfilePic: string | undefined;
  id: number;
  email: string;
  username: string;
  fullname: string;
  password: string;
};

export default function RightSidebar() {
  const [userdata, setUserData] = useState<User[] | null>(null);
  const { auth } = useAuth();
  const [followStatus, setFollowStatus] = useState<{ [key: number]: boolean }>(
    {}
  );

  const showUsers = async () => {
    if (!auth.token) return;

    const Usersdata = await axios.get(
      `http://social-media-kohl-psi.vercel.app/api/auth/allUsers`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    if (Usersdata.data.data) {
      setUserData(Usersdata.data.data);
    }
  };

  const SendFollowRequest = async (followingId: number) => {
    const followerId = auth.user;
    console.log("User Id ", followerId, "Following Id :-", followingId);
    if (!auth.token) return;
    const followData = await axios.post(
      `http://social-media-kohl-psi.vercel.app/api/follow/userToFollow`,
      { followerId, followingId },
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    if (followData.status === 201) {
      setFollowStatus((prev) => ({
        ...prev,
        [followingId]: true,
      }));
      alert("Follow Request Sent");
    }
    if (followData.status === 200) {
      setFollowStatus((prev) => ({
        ...prev,
        [followingId]: false,
      }));
      alert("UnFollowed User ");
    }
    console.log("Sending Follow Request", followData);
  };

  useEffect(() => {
    showUsers();
  }, [auth.token]);

  return (
    <div className="rightsidebar">
      <div className="title">
        <div className="suggested">
          <p>Suggested For You</p>
        </div>
        <div className="SeeAll">See All</div>
      </div>
      <div className="follow">
        {userdata?.map((profile) => (
          <div className="Follow-content" key={profile.id}>
            <img
              src={profile.userProfilePic}
              alt=""
              className="profile-photo"
            />
            <div className="profile-follow">
              <span>{profile.username}</span>
              <span>Suggested For You</span>
            </div>
            <button
              className="text-blue-500 follow-btn"
              onClick={() => SendFollowRequest(profile.id)}
            >
              {followStatus[profile.id] ? "Sent" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
