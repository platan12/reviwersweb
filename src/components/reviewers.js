import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
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
      });
      alert("Reviewer afegit correctament!");
      setName("");
      setAvatarURL("");
      setLastVideoIDChecked("");
      setWeb("");
      window.location.reload();
    } catch (error) {
      console.error("Error afegint reviewer: ", error);
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
        <input type="text" placeholder="Web" value={web} onChange={(e) => setWeb(e.target.value)} /><br />
        <button onClick={handleAddReviewer}>Afegir</button>
      </div>
    </div>
  );
};

export default Reviewers;
