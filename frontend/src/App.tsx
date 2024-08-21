import './App.css'
import {Routes,Route} from "react-router-dom"
import HomePage from './components/pages/HomePage'
import Signup from './components/pages/Signup'
import Login from './components/pages/login';
import Messages from './components/messages/Messages';
import Search from './components/SearchUser/search';
import ProfilePage from './components/ProfilePage/ProfilePage';
import Notification from './components/Notification/notification';
import EditProfile from './components/EditProfile/EditProfile';
import PrivateRoute from './components/PrivateRoutes/PrivateRoute';

function App() {
  
  return (
    <>
      <Routes>
          <Route path='/signup' element={<Signup/>}/>
          <Route path="/" element={<Login/>} />
          <Route path="/" element={<PrivateRoute/>}>
            <Route path="/homepage" element={<HomePage/>} />
            <Route path="/messages" element={<Messages />} /> 
            <Route path="/searchUser" element={<Search/>}/>
            <Route path="/ProfilePage" element={<ProfilePage/>}/> 
            <Route path="/notification" element={<Notification/>}/>
            <Route path="/edit-profile" element={<EditProfile/>}/>
          </Route>         
      </Routes>
    </>
  )
}

export default App
