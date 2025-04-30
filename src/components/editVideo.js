import React, { useState, useEffect } from "react";
import { collection, addDoc, getDoc, getDocs, doc, deleteDoc, updateDoc, query, where, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { YOUTUBE_API_KEY } from "../utils/apiKeys"; // 🔹 Importem la API Key
import ReactPaginate from "react-paginate";
import "./editVideo.css";

const EditVideo = () => {
    const [VideosToEdit, setVideosToEdit] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const videosPerPage = 1;
    const [editableVideos, setEditableVideos] = useState([]);
    const [activeReviewIndex, setActiveReviewIndex] = useState(0);
    
    const [name, setName] = useState("");

    useEffect(() => {
        fetchVideos();
      }, []);
    
      const fetchVideos = async () => {
        const querySnapshot = await getDocs(collection(db, "VideosToEdit"));
        
        const videosList = await Promise.all(
            querySnapshot.docs.map(async (videoDoc) => {
                const videoData = videoDoc.data();
                const ReviewerId = videoData.ReviewerID;
    
                let Name = "";
                let AvatarURL = "";
              
                // Si hi ha reviewerID, intentem recuperar el Name i URL
                if (ReviewerId) {
                   
                    const reviewerRef = doc(db, "Reviewers", ReviewerId);
                    const reviewerSnap = await getDoc(reviewerRef);
                    if (reviewerSnap.exists()) {
                        
                        const reviewerData = reviewerSnap.data();
                        Name = reviewerData.Name || "";
                        AvatarURL = reviewerData.AvatarURL || "";
                    }
                }
    
                return {
                    id: videoDoc.id,
                    ...videoData,
                    Name, // afegim al vídeo
                    AvatarURL,
                };
            })
        );
        
        setVideosToEdit(videosList);
        setEditableVideos(videosList); // per editar separadament sense perdre dades originals
    };
    
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const updateReviewField = (reviewIndex, field, value) => {
      setEditableVideos((prev) => {
        const newVideos = [...prev];
        newVideos[currentPage].Reviews[reviewIndex][field] = value;
        return newVideos;
      });
    };
    
    const updateGeoPoint = (reviewIndex, coord, value) => {
      setEditableVideos((prev) => {
        const newVideos = [...prev];
        if (!newVideos[currentPage].Reviews[reviewIndex].Geopoint) {
          newVideos[currentPage].Reviews[reviewIndex].Geopoint = { latitude: 0, longitude: 0 };
        }
        newVideos[currentPage].Reviews[reviewIndex].Geopoint[coord] = value;
        return newVideos;
      });
    };

    const handleSaveChanges = async () => {
      const videoToUpdate = editableVideos[currentPage];
      const videoRef = doc(db, "VideosToEdit", videoToUpdate.id);
    
      try {
        await updateDoc(videoRef, {
          Reviews: videoToUpdate.Reviews
        });
        alert("Canvis desats correctament!");
      } catch (error) {
        console.error("Error al desar:", error);
        alert("Error al desar els canvis.");
      }
    };

    const handleAddReview = () => {
      setEditableVideos((prev) => {
        const updated = [...prev];
        const currentVideo = updated[currentPage];
    
        const newReview = {
          Name: "",
          Adress: "",
          BusinessStatus: "",
          CoverImageURL: "",
          Geopoint: { latitude: 0, longitude: 0 },
          Phone: "",
          PlaceID: "",
          PriceLevel: "",
          Rating: 0,
          StartReviewAtSeconds: 0,
          TropAdvidorURL: "",
          UserRatingTotal: 0,
          Web: ""
        };
    
        // Asegura que hi ha un array
        if (!currentVideo.Reviews) {
          currentVideo.Reviews = [];
        }
    
        currentVideo.Reviews.push(newReview);
    
        // Calcula nou índex fora del setState (no dins)
        const newReviewIndex = currentVideo.Reviews.length - 1;
    
        // Assigna el nou índex activament fora
        setTimeout(() => setActiveReviewIndex(newReviewIndex), 0);
    
        return updated;
      });
    };
    
    const handleDumpReviews = async () => {
      const video = editableVideos[currentPage];
    
      try {
        // 1. Crear un document nou a la col·lecció "Reviews"
        await addDoc(collection(db, "Reviews"), {
          PublishDate: video.PublishDate,
          ReviewerID: video.ReviewerID,
          Title: video.Title,
        });
    
        // 2. Iterar per cada review
        for (const review of video.Reviews) {
          const restaurantsRef = collection(db, "Restaurants");
          const q = query(restaurantsRef, where("Name", "==", review.Name));
          const querySnapshot = await getDocs(q);
    
          if (querySnapshot.empty) {
            // No existeix => crear el document nou
            const newDocRef = doc(collection(db, "Restaurants")); // crea amb ID aleatòria
            await setDoc(newDocRef, {
              ...review,
              Reviews: [review.StartReviewAtSeconds]
            });
          } else {
            // Existeix => actualitzar el document existent
            const existingDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, "Restaurants", existingDoc.id), {
              Reviews: arrayUnion(review.StartReviewAtSeconds)
            });
          }
        }
    
        alert("Volcat de reviews completat!");
      } catch (error) {
        console.error("Error en volcar reviews:", error);
        alert("Hi ha hagut un error durant el volcat.");
      }
    };
    

    const renderEditableFields = (review, index) => (
      <>
        <div className="form-row">
            <label>Name:</label>
            <input
              type="text"
              value={review.Name}
              onChange={(e) => updateReviewField(index, "Name", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Adress:</label>
          <input
            type="text"
            value={review.Adress}
            onChange={(e) => updateReviewField(index, "Adress", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Restaurant Foto:</label>
          <input
            type="text"
            value={review.CoverImageURL}
            onChange={(e) => updateReviewField(index, "CoverImageURL", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Business Status:</label>
          <input
            type="text"
            value={review.BusinessStatus}
            onChange={(e) => updateReviewField(index, "BusinessStatus", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Phone:</label>
          <input
            type="text"
            value={review.Phone}
            onChange={(e) => updateReviewField(index, "Phone", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>PlaceID:</label>
          <input
            type="text"
            value={review.PlaceID}
            onChange={(e) => updateReviewField(index, "PlaceID", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Price Level:</label>
          <input
            type="text"
            value={review.PriceLevel                          }
            onChange={(e) => updateReviewField(index, "PriceLevel", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Rating:</label>
          <input
            type="text"
            value={review.Rating}
            onChange={(e) => updateReviewField(index, "Rating", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Total User Rating:</label>
          <input
            type="text"
            value={review.UserRatingTotal}
            onChange={(e) => updateReviewField(index, "UserRatingTotal", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Start Review At Seconds:</label>
          <input
            type="text"
            value={review.StartReviewAtSeconds}
            onChange={(e) => updateReviewField(index, "StartReviewAtSeconds", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>TropAdvidorURL:</label>
          <input
            type="text"
            value={review.TropAdvidorURL}
            onChange={(e) => updateReviewField(index, "TropAdvidorURL", e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Web:</label>
          <input
            type="text"
            value={review.Web}
            onChange={(e) => updateReviewField(index, "Web", e.target.value)}
            />
          </div>
          {/* Exemples per geopunt */}
          <input
            type="number"
            value={review.Geopoint?.latitude || ""}
            onChange={(e) => updateGeoPoint(index, "latitude", parseFloat(e.target.value))}
            placeholder="Latitud"
          />
          <input
            type="number"
            value={review.Geopoint?.longitude || ""}
            onChange={(e) => updateGeoPoint(index, "longitude", parseFloat(e.target.value))}
            placeholder="Longitud"
          />
      </>
    );
    

    const currentVideo = VideosToEdit.slice(currentPage * videosPerPage, (currentPage + 1) * videosPerPage);

    return (
        <div>
          <h2>Pàgina de EditVideos</h2>
          <div>
            {currentVideo.map((VideoToEdit) => (
              <div key={VideoToEdit.id} className="reviewer-card">
                <p>
                  <img src={VideoToEdit.AvatarURL} alt={VideoToEdit.Name} className="avatar" />
                  <h3>{VideoToEdit.Name ? `Canal: ${VideoToEdit.Name}` : "Sense canal assignat"}</h3>
                </p>
                <h3>{VideoToEdit.PublishDate}</h3>
                <h2>{VideoToEdit.Title}</h2>
                <iframe 
                  width="560" 
                  height="315" 
                  src={`https://www.youtube.com/embed/${VideoToEdit.VideoID}`} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
                <div className="tabs-container">

                {editableVideos[currentPage]?.Reviews?.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveReviewIndex(idx)}
                    className={idx === activeReviewIndex ? "tab active-tab" : "tab"}
                  >
                    Resenya {idx + 1}
                  </button>
                ))}
                <button onClick={handleAddReview} className="tab new-tab">+ Nova</button>
                </div>

                {editableVideos[currentPage]?.Reviews?.[activeReviewIndex] ? (
                  <div className="review-card">
                    {renderEditableFields(editableVideos[currentPage].Reviews[activeReviewIndex], activeReviewIndex)}
                    <button onClick={handleSaveChanges}>Desar canvis</button>
                   
                    <button onClick={handleDumpReviews}>Volcar Reviews</button>
                  </div>
                ) : (
                  <p>No hi ha cap ressenya seleccionada.</p>
                )}


              </div>
              
              
            ))}
          </div>
          <ReactPaginate
            previousLabel={"← Anterior"}
            nextLabel={"Següent →"}
            pageCount={Math.ceil(VideosToEdit.length / videosPerPage)}
            onPageChange={handlePageChange}
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        </div>
    )
};

export default EditVideo;
