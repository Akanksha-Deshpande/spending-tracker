import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/layout.css";

function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="sidebar">
            {/* =========================
                Brand
            ========================= */}

            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    ₹
                </div>

                <div>
                    <h1 className="sidebar-title">
                        Spending Tracker
                    </h1>

                    <p className="sidebar-subtitle">
                        Manage your spending
                    </p>
                </div>
            </div>

            {/* =========================
                Navigation
            ========================= */}

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ▦
                    </span>

                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/categories"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ◈
                    </span>

                    <span>Categories</span>
                </NavLink>

                <NavLink
                    to="/plans"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ◎
                    </span>

                    <span>Plans</span>
                </NavLink>

                <NavLink
                    to="/actuals"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ✓
                    </span>

                    <span>Actuals</span>
                </NavLink>

                <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ▥
                    </span>

                    <span>Reports</span>
                </NavLink>
            </nav>

            {/* =========================
                User
            ========================= */}

            <div className="sidebar-user">
                <div className="sidebar-user-info">
                    <div className="sidebar-avatar">
                        {user?.email
                            ?.charAt(0)
                            .toUpperCase() ?? "U"}
                    </div>

                    <div className="sidebar-user-details">
                        <span className="sidebar-user-label">
                            Signed in as
                        </span>

                        <p className="sidebar-email">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <button
                    className="sidebar-logout"
                    type="button"
                    onClick={logout}
                >
                    <span>↪</span>
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;