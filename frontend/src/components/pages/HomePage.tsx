import RightSidebar from '../RightSidebar/RightSidebar';
import Sidebar from '../sidebar/sidebar'
import Main from './../Main/main';
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className='homepage'>
        <Sidebar />
        <Main/>
        <RightSidebar/>
    </div>
  )
}
