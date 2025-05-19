import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import ReactPaginate from "react-paginate";
import "./restaurants.css"; // reutilitzem estils

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const restaurantsPerPage = 1;

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    const querySnapshot = await getDocs(collection(db, "Restaurants"));
    const list = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRestaurants(list);
  };

  const handleFieldChange = (field, value) => {
    setRestaurants((prev) => {
      const updated = [...prev];
      updated[currentPage][field] = value;
      return updated;
    });
  };

  const handleSaveChanges = async () => {
    try {
      const current = restaurants[currentPage];
      await updateDoc(doc(db, "Restaurants", current.id), { ...current });
      alert("Canvis desats correctament!");
    } catch (error) {
      console.error("Error desant:", error);
      alert("Error en desar els canvis.");
    }
  };

  const handleDeleteRestaurant = async () => {
    const current = restaurants[currentPage];
    if (!current?.id) return;
  
    const confirmDelete = window.confirm("Segur que vols eliminar aquest restaurant?");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "Restaurants", current.id));
      alert("Restaurant eliminat correctament.");
  
      // Actualitza la llista local
      setRestaurants((prev) => {
        const updated = prev.filter((_, index) => index !== currentPage);
        // Ajusta la pàgina actual si cal
        if (currentPage >= updated.length && updated.length > 0) {
          setCurrentPage(updated.length - 1);
        }
        return updated;
      });
    } catch (error) {
      console.error("Error en eliminar:", error);
      alert("Hi ha hagut un error en eliminar el restaurant.");
    }
  };
  

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const currentRestaurant = restaurants[currentPage];

  return (
    <div>
      <h2>Pàgina de Restaurants</h2>

      {currentRestaurant ? (
        <div className="restaurant-form">
        {currentRestaurant.CoverImageURL && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img className="Restaurant"
            src={currentRestaurant.CoverImageURL}
            alt="Restaurant"
            style={{maxWidth: "100%", maxHeight: "300px", borderRadius: "10px" }}
            />
        </div>
        )}
          {Object.entries(currentRestaurant).map(([key, value]) => {
            if (key === "id") return null;
            if (typeof value === "object") {
              return (
                <div key={key} className="form-row">
                  <label>{key}:</label>
                  <textarea
                    value={JSON.stringify(value, null, 2)}
                    onChange={(e) =>
                      handleFieldChange(key, JSON.parse(e.target.value))
                    }
                    rows={4}
                  />
                </div>
              );
            }
            return (
              <div key={key} className="form-row">
                <label>{key}:</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                />
              </div>
            );
          })}

          <button onClick={handleSaveChanges}>Desar canvis</button>

          <button 
            onClick={handleDeleteRestaurant} 
            style={{ backgroundColor: "red", color: "white", marginLeft: "10px" }}
            >
            Eliminar restaurant
            </button>
        </div>
      ) : (
        <p>No s'ha trobat cap restaurant.</p>
      )}

      <ReactPaginate
        previousLabel={"← Anterior"}
        nextLabel={"Següent →"}
        pageCount={Math.ceil(restaurants.length / restaurantsPerPage)}
        onPageChange={handlePageChange}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
    </div>
  );
};

export default Restaurants;