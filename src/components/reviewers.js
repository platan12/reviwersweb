import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./reviewers.css";

const Reviewers = () => {
  const [name, setName] = useState("");
  const [avatarURL, setAvatarURL] = useState("");
  const [lastVideoIDChecked, setLastVideoIDChecked] = useState("");
  const [web, setWeb] = useState("");


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
    } catch (error) {
      console.error("Error afegint reviewer: ", error);
    }
  };

  return (
    <div>
      <h2>Pàgina de Reviewers</h2>
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

