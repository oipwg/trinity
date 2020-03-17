import React from 'react';
// import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// import DashboardSidebar from './sidebar/DashboardSideBar';
import Home from './home/Home';

const Dashboard = () => {
    return (
        <div>
        <Home />
        </div>
        //todo: currently not needed
        // <Router>
        //     <DashboardSidebar />
        //     <Switch>
        //         <Route path="/dashboard" exact component={Home} />
        //     </Switch>
        // </Router>
    );
};

export default Dashboard;
