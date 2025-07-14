import moment from "moment";
import { generatePredictions } from "./predictions.js";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// routes
const userRoutes = require("./routes/users");
const symptomRoutes = require("./routes/symptoms");
const intelligenceRoutes = require("./routes/intelligence");

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use((err, req, res, next) => {
  console.error("Error", err.stack);
  res.status(500).json({
    success: false,
    message: "Some error occurred",
  });
});

// routes
app.use("/api/users", userRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/intelligence", intelligenceRoutes);

// Welcome message
app.get("/", (req, res) => {
  res.json({
    message: "PCOS Health Tracker API",
    version: "1.0.0",
    endpoints: [
      "POST /api/users/register - Register new user",
      "GET /api/users/profile/:userId - Get user profile",
      "POST /api/symptoms/log - Log daily symptoms",
      "GET /api/symptoms/history/:userId - Get symptom history",
      "GET /api/symptoms/date/:userId/:date - Get symptoms for a specific date",
      "GET /api/intelligence/insights/:userId - Get pattern insights",
      "GET /api/intelligence/risk-score/:userId - Get PCOS risk score",
      "GET /api/intelligence/predict-period/:userId - Predict next period",
      "GET /api/intelligence/report/:userId - Get comprehensive health report",
    ],
  });
});

app.get("/api/cycle-predictions/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Obtener historial de ciclos desde la base de datos
    const cycles = await Cycle.find({ userId })
      .sort({ startDate: -1 })
      .limit(12);

    if (cycles.length < 3) {
      return res.status(200).json({
        status: "insufficient_data",
        message: "Se necesitan al menos 3 ciclos para generar predicciones",
      });
    }

    // Generar predicciones usando tu módulo
    const predictions = generatePredictions(
      cycles.map((c) => ({
        startDate: c.startDate,
        duration: c.duration,
      }))
    );

    res.json(predictions);
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ error: "Error generating predictions" });
  }
});

app.listen(PORT, () => {
  console.log(`PCOS Tracker API running on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`PCOS Tracker API running on port ${PORT}`);
});
