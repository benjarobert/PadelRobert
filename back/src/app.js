require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/canchas", require("./routes/canchas.routes"));
app.use("/api/reservas", require("./routes/reservas.routes"));
app.use("/api/reportes", require("./routes/reportes.routes"));

app.get("/", (_req, res) => {
  res.json({ mensaje: "API de reservas de pádel" });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
