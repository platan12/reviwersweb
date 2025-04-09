import React, { useState, useEffect } from "react";
import { collection, addDoc, getDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { YOUTUBE_API_KEY } from "../utils/apiKeys"; // 🔹 Importem la API Key
import ReactPaginate from "react-paginate";
import "./editVideo.css";

const EditVideo = () => {
    const [VideosToEdit, setVideosToEdit] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const videosPerPage = 1;
    
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
    };
    
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

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
