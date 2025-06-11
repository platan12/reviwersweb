import express from "express";
import axios from "axios";
import cors from "cors";
import apiKeys from "../src/utils/apiKeys2.js"; // ⚠️ Modifica si el path és incorrecte

const { GOOGLE_CLOUD_API_KEY } = apiKeys;
const app = express();
const PORT = 3001;

// Permet peticions CORS des de qualsevol origen (frontend inclòs)
app.use(cors());
app.use(express.json());

app.post("/api/searchPlaces", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Falta el terme de cerca." });

    const response = await axios({
      method: "post",
      url: "https://places.googleapis.com/v1/places:searchText",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_CLOUD_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.id"
      },
      data: {
        textQuery: query
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error Google Places:", error.response?.data || error.message);
    res.status(500).json({ error: "Error en la cerca de Google Places." });
  }
});

app.get("/api/getPlaceDetails/:placeId", async (req, res) => {

  console.log("TEST!!!!!!!!")
  
  try {
    const { placeId } = req.params;

    

    if (!placeId) return res.status(400).json({ error: "Falta el Place ID" });

    const response = await axios.get(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_CLOUD_API_KEY,
        "X-Goog-FieldMask": "displayName,formattedAddress,internationalPhoneNumber,googleMapsUri,priceLevel,rating,userRatingCount,location,businessStatus"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error obtenint detalls del lloc:", error.response?.data || error.message);
    res.status(500).json({ error: "Error obtenint detalls del lloc." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend actiu a http://localhost:${PORT}`);
});
