const axios = require("axios");
const db = require("../db");

exports.getNearbyPlaces = async (req, res) => {
    const { lat, lng } = req.query;
    console.log("Request received:", lat, lng);
    try {
        const response = await axios.get(
            "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
            {
                params: {
                    location: `${lat},${lng}`,
                    radius: 1000,
                    type: "restaurant",
                    key: process.env.GOOGLE_API_KEY
                }
            }
        );
        console.log("Google API Response:", response.data);
        const places = response.data.results;

        for (let place of places) {
            console.log("Processing place:", place.name);
            const details = await axios.get(
                "https://maps.googleapis.com/maps/api/place/details/json",
                {
                    params: {
                        place_id: place.place_id,
                        fields: "name,formatted_address,formatted_phone_number,rating,geometry",
                        key: process.env.GOOGLE_API_KEY
                    }
                }
            );

            const p = details.data.result;

            if (p && p.name) {
                db.query(
                    `INSERT INTO businesses (name, address, phone, rating, lat, lng)
         VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        p.name,
                        p.formatted_address || "",
                        p.formatted_phone_number || "",
                        p.rating || 0,
                        p.geometry.location.lat,
                        p.geometry.location.lng
                    ],
                    (err) => {
                        if (err) console.log("Insert error:", err);
                        else console.log("Inserted:", p.name);
                    }
                );
            }
        }

        res.json({ message: "Data saved successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};