import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Plans from "./pages/Plans";
import Actuals from "./pages/Actuals";
import Reports from "./pages/Reports";

function App() {
    const { loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute> }>
                <Route index element={<Navigate to="/dashboard" replace />}/>
                    <Route path="dashboard" element={<Dashboard/>}/>
                    <Route path="categories" element={<Categories/>}/>
                    <Route path="plans" element={<Plans/>}/>
                    <Route path="actuals" element={<Actuals/>}/>
                    <Route path="reports" element={<Reports/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;