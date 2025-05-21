import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
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
  const [editingId, setEditingId] = useState(null); // 🔹 Per identificar si estem editant un reviewer

  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    const querySnapshot = await getDocs(collection(db, "Reviewers"));
    const reviewersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setReviewers(reviewersList);
  };

  const handleAddOrUpdateReviewer = async () => {
    try {
      if (editingId) {
        
        // 🔹 Actualitzar reviewer existent a Firebase
        const reviewerRef = doc(db, "Reviewers", editingId);
        await updateDoc(reviewerRef, {
          Name: name,
          AvatarURL: avatarURL,
          LastVideoIDChecked: lastVideoIDChecked,
          Web: web,
          ChannelID: channelID,
        });
  
        alert("Reviewer actualitzat correctament!");
      } else {
        // 🔹 Afegir un nou reviewer
        await addDoc(collection(db, "Reviewers"), {
          Name: name,
          AvatarURL: avatarURL,
          LastVideoIDChecked: lastVideoIDChecked,
          Web: web,
          ChannelID: channelID,
        });
  
        alert("Reviewer afegit correctament!");
      }
  
      // 🔹 Netejar el formulari i recarregar la llista
      resetForm();
      fetchReviewers();
      document.getElementById("addReviewerForm").style.display = "none"; // Amagar el formulari
    } catch (error) {
      console.error("Error afegint/modificant reviewer: ", error);
    }
  };

  const fetchChannelID = async () => {
    if (!web) {
      alert("Si us plau, introdueix l'URL del canal primer!");
      return;
    }

    try {
      console.log("try");
      const urlParts = web.split("/");
      console.log(urlParts);
      const channelIdentifier = urlParts[urlParts.length - 1];
      
      console.log(channelIdentifier);
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

  const handleEditReviewer = (reviewer) => {
    // 🔹 Omplim els inputs amb les dades del reviewer seleccionat
    setName(reviewer.Name);
    setAvatarURL(reviewer.AvatarURL);
    setLastVideoIDChecked(reviewer.LastVideoIDChecked);
    setWeb(reviewer.Web);
    setChannelID(reviewer.ChannelID);
    setEditingId(reviewer.id);
    document.getElementById("addReviewerForm").style.display = "block"; // Mostrem el formulari
  };

  const resetForm = () => {
    setName("");
    setAvatarURL("");
    setLastVideoIDChecked("");
    setWeb("");
    setChannelID("");
    setEditingId(null);
  };

  const fetchLatestVideos = async (reviewerId, channelId) => {
    if (!channelId) {
      alert("Aquest reviewer no té Channel ID definit.");
      return;
    }
  
    try {
      let videos = [];
      let nextPageToken = "";
      const startDate = new Date("2025-03-10T00:00:00Z").toISOString(); // 🔹 Data fixa (hardcoded)
  
      do {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=50&type=video&publishedAfter=${startDate}&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`
        );
  
        const data = await response.json();
        
  
        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            const videoData = {
              Title: item.snippet.title,
              PublishDate: item.snippet.publishedAt,
              VideoID: item.id.videoId, // 🔹 Nou camp afegit
              
              ReviewerID: reviewerId // 🔹 Referència al document del reviewer
            };
            await addDoc(collection(db, "VideosToEdit"), videoData); // 🔹 Desa el vídeo a Firebase
          }
          videos = [...videos, ...data.items.map((item) => item.id.videoId)];
        }
  
        nextPageToken = data.nextPageToken;
      } while (nextPageToken);
  
      if (videos.length === 0) {
        alert("No s'han trobat vídeos per aquest canal des de la data especificada.");
        return;
      }
  
      alert("Vídeos desats correctament a la col·lecció VideosToEdit!");
    } catch (error) {
      console.error("Error obtenint els vídeos més recents: ", error);
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
            <p>
              <button onClick={() => fetchLatestVideos(reviewer.id, reviewer.ChannelID)} className="lastvideo-button">
              🔄 Cargar Videos per Editar
              </button>
            </p>
            <p>Channel ID: {reviewer.ChannelID || "No disponible"}</p>
            <a href={reviewer.Web} target="_blank" rel="noopener noreferrer">Link Canal</a>
            <br />
            <button onClick={() => handleEditReviewer(reviewer)} className="edit-button">
              Editar
            </button>
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
      
      <button onClick={() => document.getElementById("addReviewerForm").style.display = "block"}>
        {editingId ? "Editar Reviewer" : "Afegir Reviewer"}
      </button>
      <div id="addReviewerForm" style={{ display: "none", marginTop: "10px" }}>
        <input type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} /><br />
        <input type="text" placeholder="Avatar URL" value={avatarURL} onChange={(e) => setAvatarURL(e.target.value)} /><br />
        <input type="text" placeholder="video ID to get all videos by date" value={lastVideoIDChecked} onChange={(e) => setLastVideoIDChecked(e.target.value)} /><br />
        <input type="text" placeholder="Web (URL del canal)" value={web} onChange={(e) => setWeb(e.target.value)} /><br />
        <button onClick={fetchChannelID}>Obtenir ID Canal</button>
        <input type="text" placeholder="Channel ID" value={channelID} /><br />
        <button onClick={handleAddOrUpdateReviewer}>
          {editingId ? "Guardar Canvis" : "Afegir"}
        </button>
      </div>
    </div>
  );
};

export default Reviewers;
