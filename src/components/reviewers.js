import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { YOUTUBE_API_KEY } from "../utils/apiKeys"; // 🔹 Importem la API Key
import ReactPaginate from "react-paginate";
import "./reviewers.css";

const Reviewers = () => {
  const [reviewers, setReviewers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const reviewersPerPage = 1;
  
  const [name, setName] = useState("");
  const [avatarURL, setAvatarURL] = useState("");
  const [lastVideoIDChecked, setLastVideoIDChecked] = useState("");
  const [web, setWeb] = useState("");
  const [channelID, setChannelID] = useState("");

  useEffect(() => {
    const fetchReviewers = async () => {
      const querySnapshot = await getDocs(collection(db, "Reviewers"));
      const reviewersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReviewers(reviewersList);
    };
    fetchReviewers();
  }, []);

  const handleAddReviewer = async () => {
    try {
      await addDoc(collection(db, "Reviewers"), {
        Name: name,
        AvatarURL: avatarURL,
        LastVideoIDChecked: lastVideoIDChecked,
        Web: web,
        ChannelID: channelID, // 🔹 Guardem la Channel ID
      });

      alert("Reviewer afegit correctament!");
      setName("");
      setAvatarURL("");
      setLastVideoIDChecked("");
      setWeb("");
      setChannelID(""); // 🔹 Netejar la Channel ID
    } catch (error) {
      console.error("Error afegint reviewer: ", error);
    }
  };

  // 🔹 Funció per obtenir la Channel ID automàticament
  const fetchChannelID = async () => {
    if (!web) {
      alert("Si us plau, introdueix l'URL del canal primer!");
      return;
    }

    try {
      // Extraiem el "username" del canal des de l'URL
      const urlParts = web.split("/");
      const channelIdentifier = urlParts[urlParts.length - 1];

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=id&type=channel&q=${channelIdentifier}&key=${YOUTUBE_API_KEY}`
      );

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        setChannelID(data.items[0].id.channelId);
        alert("Channel ID obtinguda correctament!");
      } else {
        alert("No s'ha trobat cap canal amb aquesta URL.");
      }
    } catch (error) {
      console.error("Error obtenint la Channel ID: ", error);
    }
  };

  const handleDeleteReviewer = async (id) => {
    try {
      await deleteDoc(doc(db, "Reviewers", id));
      setReviewers(reviewers.filter((reviewer) => reviewer.id !== id));
      alert("Reviewer eliminat correctament!");
    } catch (error) {
      console.error("Error eliminant reviewer: ", error);
    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const currentReviewer = reviewers.slice(currentPage * reviewersPerPage, (currentPage + 1) * reviewersPerPage);

  return (
    <div>
      <h2>Pàgina de Reviewers</h2>
      <div>
        {currentReviewer.map((reviewer) => (
          <div key={reviewer.id} className="reviewer-card">
            <img src={reviewer.AvatarURL} alt={reviewer.Name} className="avatar" />
            <h3>{reviewer.Name}</h3>
            <p>Últim Vídeo Vist: {reviewer.LastVideoIDChecked}</p>
            <p>Channel ID: {reviewer.ChannelID || "No disponible"}</p> {/* 🔹 Mostrem la Channel ID */}
            <a href={reviewer.Web} target="_blank" rel="noopener noreferrer">Link Canal</a>
            <br />
            <button onClick={() => handleDeleteReviewer(reviewer.id)} className="delete-button">
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <ReactPaginate
        previousLabel={"← Anterior"}
        nextLabel={"Següent →"}
        pageCount={Math.ceil(reviewers.length / reviewersPerPage)}
        onPageChange={handlePageChange}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
      
      <button onClick={() => document.getElementById("addReviewerForm").style.display = "block"}>Afegir Reviewer</button>
      <div id="addReviewerForm" style={{ display: "none", marginTop: "10px" }}>
        <input type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} /><br />
        <input type="text" placeholder="Avatar URL" value={avatarURL} onChange={(e) => setAvatarURL(e.target.value)} /><br />
        <input type="text" placeholder="Últim Vídeo ID Revisat" value={lastVideoIDChecked} onChange={(e) => setLastVideoIDChecked(e.target.value)} /><br />
        <input type="text" placeholder="Web (URL del canal)" value={web} onChange={(e) => setWeb(e.target.value)} /><br />
        <button onClick={fetchChannelID}>Obtenir ID Canal</button> {/* 🔹 Botó per obtenir la Channel ID */}
        <input type="text" placeholder="Channel ID" value={channelID} readOnly /><br />
        <button onClick={handleAddReviewer}>Afegir</button>
      </div>
    </div>
  );
};

export default Reviewers;
