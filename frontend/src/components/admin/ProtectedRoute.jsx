import { useNavigate, Outlet,Navigate } from 'react-router-dom';

const AdminRoute=()=>{
    const navigate = useNavigate()
    const role=localStorage.getItem('role')
    const token=localStorage.getItem('access_token')

    if (!token){
        navigate('/login')
    }
    else if (role==='admin'){
        return <Outlet/>
    }
    return <Navigate to={'/' } replace/>
}
export default AdminRoute;
