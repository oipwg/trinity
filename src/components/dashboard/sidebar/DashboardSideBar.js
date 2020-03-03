import React from 'react';
import { Link } from 'react-router-dom';
import './dashboardSidebar.css';

const DashboardSidebar = () => {
    return (
        <>
            <nav
                id="sidebar"
                className="nav flex-column sidebar sidebar-sticky"
            >
                <Link className="nav-link active center-link" to="/dashboard">
                    <i className="fas fa-home"></i>
                    <span>Home</span>
                </Link>
                <Link className="nav-link center-link" to="/dashboard/trending">
                    <i className="fas fa-fire"></i>
                    Trending
                </Link>
                <Link
                    className="nav-link center-link"
                    to="/dashboard/subscriptions"
                >
                    <i className="fas fa-bell"></i>
                    Subcriptions
                </Link>
                <Link className="nav-link center-link" to="/dashboard/history">
                    <i className="fas fa-clock"></i>
                    History
                </Link>
                <Link
                    className="nav-link center-link"
                    to="/dashboard/favorites"
                >
                    <i className="fas fa-heart"></i>
                    Favorites
                </Link>
                <Link
                    className="nav-link center-link"
                    to="/dashboard/artifacts"
                >
                    <i className="fas fa-industry"></i>
                    My Artifacts
                </Link>
            </nav>
        </>
    );
};

export default DashboardSidebar;
