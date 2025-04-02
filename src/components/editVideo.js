import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
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
        const videosList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
                <h3>{VideoToEdit.Title}</h3>
                <h3>{VideoToEdit.ChannelName}</h3>
                <h3>{VideoToEdit.PublishDate}</h3>
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
