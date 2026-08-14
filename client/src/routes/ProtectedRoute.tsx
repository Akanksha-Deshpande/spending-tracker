import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

interface IProtectedRouteProps{
    children: ReactNode
}

function ProtectedRoute({children}: IProtectedRouteProps){
    
    const {isAuthenticated} = useAuth();

    if(!isAuthenticated){
        return <Navigate to="/login" replace />;
    }

    return children;

}

export default ProtectedRoute;