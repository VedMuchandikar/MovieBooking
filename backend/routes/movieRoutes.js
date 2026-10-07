const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM movies ORDER BY release_date DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching movies:", error.message);

        res.status(500).json({
            message: "Failed to fetch movies"
        });
    }
});

module.exports = router;