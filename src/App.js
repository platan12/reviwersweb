import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Reviewers from './components/reviewers';
import EditVideo from './components/editVideo';
import Restaurants from './components/restaurants';


function App() {
  return (
    <Router>
    
        <Routes>
          <Route path="/" element={<Reviewers />} />
          <Route path="/edit-video" element={<EditVideo />} />
          <Route path="/restaurants" element={<Restaurants />} />
        </Routes>
      
    </Router>
  );
}

export default App;
