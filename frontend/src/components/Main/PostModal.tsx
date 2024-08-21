import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Photo from '../photos/mypic.jpg'; 
import "./PostModal.css";
import axios from 'axios';
import { useAuth } from '../contexts/auth.context';
import DeleteIcon from '@mui/icons-material/Delete';

type PostModalProps = {
  post: {
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
      user: {
        username: string;
      };
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
  onClose: () => void;
};

const PostModal: React.FC<PostModalProps> = ({ post, onClose }) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const { auth } = useAuth();

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5001/api/post/CommentPost/${post.id}`, 
        { comment_content: newComment },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
  
      if (response.status === 201) {
        // Extract the newly created comment from the response
        const newCreatedComment = response.data.comments.find((comment: { comment_content: string; }) => comment.comment_content === newComment);
  
        // Update the comments state with the new comment
        setComments([...comments, newCreatedComment]);
        setNewComment(""); // Clear the input field
      }
    } catch (error) {
      console.log("Error in Comment ", error);
    }
  };
  

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  const handleDeleteComment = async(commentId: number) => {
      console.log("Commentid :- ",commentId);
      try {
          await axios.delete(`http://localhost:5001/api/post/deletecomment/${commentId}`,{
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          })        
          setComments(comments.filter(comment => comment.id !== commentId));
      } catch (error) {
        console.log("Error in Delete Comment :-",error)
      }
  }


  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div className="modal-container-custom" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-custom" onClick={onClose}>
          <CloseIcon />
        </button>
        <div className="modal-header-custom">
          <img
            src={post.user?.userProfilePic || Photo}
            alt="profileImage"
            className="modal-profile-img-custom"
          />
          <span className="modal-username-custom">{post.user?.username || 'Unknown User'}</span>
        </div>
        <div className="modal-content-custom">
          <div className="modal-media-container-custom">
            {post.media?.map((mediaItem, index) => (
              <div key={index}>
                {mediaItem.type === 'IMAGE' ? (
                  <img
                    src={mediaItem.url}
                    alt="Post Media"
                    className="modal-media-img-custom"
                  />
                ) : (
                  <video controls className="modal-media-video-custom">
                    <source src={mediaItem.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ))}
          </div>
          <div className="modal-post-content-custom">
            <p className="modal-post-text-custom"><span>Caption :- {post.content}</span></p>
          </div>
          <div className="modal-comments-custom">
            {comments.map((comment) => (
              <div key={comment.id} className="modal-comment-custom" style={{ display: "flex" }}>
                <span className="text-black">{comment.user.username} :-</span> 
                <span className="modal-comment-text-custom">{comment.comment_content}</span>
                  <span><DeleteIcon className='text-black' onClick={() => handleDeleteComment(comment.id)}/></span> 
              </div>
            ))}
          </div>
          <form className="modal-comment-form-custom" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              value={newComment}
              onChange={handleCommentChange}
              placeholder="Add a comment..."
              className="modal-comment-input-custom"
            />
            <button type="submit" className="modal-comment-submit-custom">
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
