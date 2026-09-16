const { poolPromise } = require("../config/db");

const getAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute("usp_ListarCanchas");
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = { getAll };
