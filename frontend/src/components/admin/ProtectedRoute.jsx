import {Navigate,Outlet} from 'ract-rounter-dom';

const AdminRoute=({user,allowedRoles})=>{
    if (!user){
        return <Navigate to='/login'replace />;
    }
    if (!user.is_staff){
        return<Navigate to='/'replace />
    }
    return <Outlet/>
}
export default AdminRoute;
