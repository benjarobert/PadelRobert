const { sql, poolPromise } = require("../config/db");

const getAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute("usp_ListarReservas");
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const crear = async (req, res) => {
  try {
    const { cliente, idCancha, fecha, hora } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("IdCancha", sql.Int, idCancha)
      .input("Cliente", sql.NVarChar(100), cliente)
      .input("Fecha", sql.Date, fecha)
      .input("Hora", sql.NVarChar(5), hora)
      .execute("usp_CrearReserva");

    res.status(201).json({
      mensaje: "Reserva registrada",
      idReserva: result.recordset[0].IdReserva
    });
  } catch (error) {
    if (error.number === 50002)
      return res.status(404).json({ mensaje: error.message });
    if (error.number >= 50000)
      return res.status(400).json({ mensaje: error.message });
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const registrarPago = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ mensaje: "El id debe ser un número válido" });

    const pool = await poolPromise;
    await pool.request()
      .input("IdReserva", sql.Int, id)
      .execute("usp_RegistrarPago");

    res.json({ mensaje: "Pago registrado" });
  } catch (error) {
    if (error.number === 50002)
      return res.status(404).json({ mensaje: error.message });
    if (error.number === 50008)
      return res.status(400).json({ mensaje: error.message });
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = { getAll, crear, registrarPago };
