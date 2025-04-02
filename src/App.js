import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Reviewers from './components/reviewers';
import EditVideo from './components/editVideo';
import Restaurants from './components/restaurants';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Barra lateral */}
        <nav className="sidebar">
          <h2>Navegació</h2>
          <ul>
            <li><Link to="/">Reviewers</Link></li>
            <li><Link to="/edit-video">Edit Video</Link></li>
            <li><Link to="/restaurants">Restaurants</Link></li>
          </ul>
        </nav>

        {/* Contingut principal */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Reviewers />} />
            <Route path="/edit-video" element={<EditVideo />} />
            <Route path="/restaurants" element={<Restaurants />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
