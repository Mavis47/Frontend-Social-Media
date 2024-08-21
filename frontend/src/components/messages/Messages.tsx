//@ts-nocheck

import "./Messages.css";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth.context";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { io, Socket } from "socket.io-client";

export type User = {
  userProfilePic: string | undefined;
  id: number;
  email: string;
  username: string;
  fullname: string;
  password: string;
};

export type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
};

export default function Messages() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userdata, setUserData] = useState<User[] | null>(null);
  const { auth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const newSocket = io("http://social-media-kohl-psi.vercel.app"); // Connect to the server
    setSocket(newSocket);

    // Cleanup the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const getloggedinUser = async () => {
    if (!auth.token) return;
    const loggedInUser = await axios.get(
      `http://social-media-kohl-psi.vercel.app/api/auth/getMe`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    console.log("LoggedIn user", loggedInUser.data.user);
    setUser(loggedInUser.data.user);
  };

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
    // console.log("USer Data :- ",Usersdata);
    if (Usersdata.data.data) {
      setUserData(Usersdata.data.data);
    }
  };

  const fetchMessages = async (receiverId: number) => {
    const messagesData = await axios.get(
      `http://social-media-kohl-psi.vercel.app/api/message/getMessage/${user.id}/${receiverId}`
    );
    setMessages(messagesData.data.data);
  };

  const sendMessage = async () => {
    if (!auth.token || !user || !selectedUser || !newMessage) return;

    const response = await axios.post(
      `http://social-media-kohl-psi.vercel.app/api/message/sendMessage`,
      {
        senderId: auth.user,
        receiverId: selectedUser.id,
        content: newMessage,
      }
    );
    setMessages((prevMessages) => [...prevMessages, response.data]);
    setNewMessage("");
    if (socket) {
      socket.emit("sendMessage", response.data.data); // Emiting message to server
    }
  };

  const handleDelete = async (messageId: number) => {
    const deletedata = await axios.delete(
      `http://social-media-kohl-psi.vercel.app/api/message/deleteMessage/${messageId}`
    );
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== messageId)
    );
    if (deletedata) {
      alert("Message Deleted");
    }
  };

  useEffect(() => {
    showUsers();
    getloggedinUser();
  }, [auth.user]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (message: Message) => {
        console.log("Received new message:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, [socket]);

  return (
    <div className="message-container">
      <div className="inbox">
        <div className="inbox-header">
          <div className="profile">
            <span>profilename</span>
          </div>
          <div className="search">
            <span>
              <EditNoteOutlinedIcon />
            </span>
          </div>
        </div>

        <div className="chat">
          {userdata?.map((data) => (
            <div
              className="chat-content"
              style={{ width: "16vw !important", cursor: "pointer" }}
              key={data.id}
              onClick={() => setSelectedUser(data)}
            >
              <img src={data.userProfilePic} alt="" className="profile-photo" />
              <div className="profile-follow">
                <span>{data.username}</span>
                <span>{data.fullname}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="messageContainer">
        <div className="container">
          <img
            src={user.userProfilePic}
            alt=""
            className="profile-picture ml-4"
          />
          <p className="ml-5">{user.username}</p>
        </div>

        {/* chat section */}
        <div className="messages">
          <div className="message-others">
            {messages
              .filter((message) => message.senderId !== user.id) // Filter messages from other users
              .map((message) => (
                <p key={message.id} id="paragraph-others">
                  {message.content}
                  <span onClick={() => handleDelete(message.id)}>
                    <DeleteIcon className="deleteIcon" />
                  </span>
                </p>
              ))}
          </div>

          <div className="message-self">
            {messages
              .filter((message) => message.senderId === user.id) // Filter messages from the current user
              .map((message) => (
                <p id="paragraph-self" key={message.id}>
                  {message.content}
                  <br />
                  <span onClick={() => handleDelete(message.id)}>
                    <DeleteIcon className="deleteIcon" />
                  </span>
                </p>
              ))}
          </div>
        </div>
        <input
          type="text"
          placeholder="Send a Message..."
          value={newMessage}
          id="message-text"
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
      </div>
    </div>
  );
}
