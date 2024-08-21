import axios from "axios";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

export type User = {
    userProfilePic: string | undefined;
    id: number,
    email: string,
    username: string,
    fullname: string,
    password: string,
    gender: string,
};

export type AuthState = {
  user: User | null;
  token: string;
};

type AuthContextType = {
  auth: AuthState;
  setAuth: Dispatch<SetStateAction<AuthState>> | (() => void);
};

const AuthContext = createContext<AuthContextType>({
  auth: {
    user: null,
    token: "",
  },
  setAuth: () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({ user: null, token: "" });

  axios.defaults.headers.common["Authorization"] = auth.token;

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      const parseData = JSON.parse(data);
      setAuth({user: parseData.id, token: parseData.token,});
      
    }
  }, [auth.token]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
