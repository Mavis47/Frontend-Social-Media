//@ts-nocheck

import { useEffect, useState } from "react";
import "./main.css";
import Photo from "../photos/mypic.jpg"; // Default photo or placeholder
import Photo2 from "../photos/watch.jpg";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import TurnedInNotOutlinedIcon from "@mui/icons-material/TurnedInNotOutlined";
import axios from "axios";
import { useAuth } from "../contexts/auth.context";
import PostModal from "./PostModal";
import DeleteIcon from "@mui/icons-material/Delete";

type Post = {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  media?: Array<{
    url: string;
    type: string;
  }>;
  comments?: Array<{
    id: number;
    comment_content: string;
    createdAt: string;
    userId: number;
    postId: number;
  }>;
  likes?: Array<{
    id: number;
    userId: number;
    postId: number;
    createdAt: string;
  }>;
  user?: {
    username: string;
    userProfilePic?: string;
  };
  likeCount?: number;
};

export default function Main() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { auth } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);


  const openPostModal = (post: Post) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  const showPosts = async () => {
    if (!auth.token) return;
    try {
      console.log("Authorization Token:", auth.token);
      const response = await axios.get(
        `https://social-media-kohl-psi.vercel.app/api/post/fetchAllPost`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      const postsData = response.data.postData;
      // Initialize likeCount for each post
      const updatedPosts = postsData.map((post: { likes: string | any[] }) => ({
        ...post,
        likeCount: post.likes ? post.likes.length : 0,
      }));
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await axios.post(
        `http://social-media-kohl-psi.vercel.app/api/post/likePost/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      console.log("response from handlelike", response);
      const updatedLikes = response.data.likes;

      // Update the specific post's like count
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: updatedLikes,
            likeCount: updatedLikes.length,
          };
        }
        return post;
      });

      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error liking post", error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    console.log("post id :-", postId);
    axios.delete(
      `http://social-media-kohl-psi.vercel.app/api/post/deletePost/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    const updatedPosts = posts.filter((post) => post.id !== postId);
    setPosts(updatedPosts);
    alert("Delete Post Successfully");
  };

  useEffect(() => {
    showPosts();
  }, [auth.token]);

  return (
    
      <div className="posts">
        <h1 className="alert-tag">
          Refresh The Page To See Your Uploaded Content...
        </h1>
        {posts.map((post) => (
          <div key={post.id} className="post">
            <div className="profile-header">
              <div className="profile-content">
                <img
                  src={post.user?.userProfilePic || Photo}
                  alt="profileImage"
                  className="profile-img"
                />
                <span>{post.user?.username || "Unknown User"}</span>
              </div>
              <div className="edit-profile">
                <DeleteIcon
                  margin-top="23px"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDeletePost(post.id)}
                />
              </div>
            </div>
            <div className="post-content">
              {post.media?.map((mediaItem, index) => (
                <div key={index}>
                  {mediaItem.type === "IMAGE" ? (
                    <img
                      src={mediaItem.url}
                      alt="Post Media"
                      className="full-size-media"
                    />
                  ) : (
                    <video controls className="full-size-video">
                      <source src={mediaItem.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))}
            </div>
            <div className="like-and-comment-save">
              <div className="like-comment">
                <FavoriteBorderIcon
                  fontSize="large"
                  onClick={() => handleLike(post.id)}
                />
                <ModeCommentOutlinedIcon
                  fontSize="large"
                  onClick={() => openPostModal(post)}
                />
              </div>
              <div className="save">
                <TurnedInNotOutlinedIcon fontSize="large" />
              </div>
            </div>
            <p>
              Liked by {post.likeCount || 0}{" "}
              {post.likeCount === 1 ? "person" : "people"}
            </p>
            <br />
            <p>
              <span>{post.user?.username || "Unknown User"}</span>{" "}
              {post.content.slice(0, 50)}...more
            </p>
            <br />
            <p onClick={() => openPostModal(post)}>
              View All {post.comments?.length || 0}{" "}
              {post.comments?.length === 1 ? "comment" : "comments"}
            </p>
          </div>
        ))}
      </div>

     
  );
}
