import  { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth.context';

export default function PrivateRoute() {
    const [ok,setOk] = useState<boolean>(false);
    const {auth} = useAuth();

    useEffect(() => {
        if (auth.token) {
            setOk(true);
        } else {
            setOk(false);
        }
    }, [auth.token]);

    return ok ? <Outlet/> : <h1 className='font-serif text-cyan-400 font-medium text-center text-4xl pt-28'>Login To Access Social Media</h1>
}
