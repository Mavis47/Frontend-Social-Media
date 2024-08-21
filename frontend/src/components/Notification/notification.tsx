import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/auth.context";
import "./notification.css";
import { io, Socket } from "socket.io-client";

type FollowRequest = {
  id: number;
  followerId: number;
  followingId: number;
  status: string;
  createdAt: string;
};

type Notification = {
  id: number;
  message: string;
};

export default function Notification() {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [receiveRequest, setreceiveRequest] = useState<FollowRequest[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  //getting all the Received Request

  useEffect(() => {
    const newSocket = io("https://social-media-kohl-psi.vercel.app"); // Adjust URL if needed
    setSocket(newSocket);

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const getRequest = async () => {
    const receivedData = await axios.get(
      `https://social-media-kohl-psi.vercel.app/api/follow/getAllRequest`
    );
    console.log("Getting Request...", receivedData.data);
    setreceiveRequest(receivedData.data);
  };

  useEffect(() => {
    getRequest();
  }, []);

  useEffect(() => {
    if (auth.user) {
      axios
        .get(`https://social-media-kohl-psi.vercel.app/api/notify/${auth.user}`)
        .then((response) => {
          console.log("Notifications Data:", response.data);
          setNotifications(response.data);
        })
        .catch((error) =>
          console.error("Error fetching notifications:", error)
        );
    }
  }, [auth.user]);

  useEffect(() => {
    if (socket) {
      socket.on("notification", (notification: Notification) => {
        console.log("Notification on client side :-", notification);
        setNotifications((prev) => [...prev, notification]);
      });
    }
  }, [socket]);

  const handleResponse = async (
    requestId: number,
    response: string,
    notificationId: number
  ) => {
    console.log("Request Id:", requestId, "Response", response);

    try {
      // Handle the follow request response
      await axios.post(
        `https://social-media-kohl-psi.vercel.app/api/follow/responseToRequest`,
        { requestId, response }
      );

      // After successfully handling the request, delete the notification
      await axios.delete(
        `https://social-media-kohl-psi.vercel.app/api/notify/notification/${notificationId}`
      );

      // Update the state to remove the notification from the UI
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== requestId)
      );
    } catch (error) {
      console.error(
        "Error handling follow request or deleting notification:",
        error
      );
    }
  };

  return (
    <div className="notify-container">
      <h1>Notifications</h1>
      <div className="notify">
        <ul className="text-container text-white">
          {notifications.map((notification) => (
            <li className="text text-white" key={notification.id}>
              <span>{notification.message}</span>
              {receiveRequest.map((request) => (
                <div key={request.id}>
                  <button
                    className="bg-blue-500"
                    onClick={() =>
                      handleResponse(request.id, "ACCEPTED", notification.id)
                    }
                  >
                    Accept
                  </button>
                  <button
                    className="bg-gray-600"
                    onClick={() =>
                      handleResponse(request.id, "REJECTED", notification.id)
                    }
                  >
                    Reject
                  </button>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
