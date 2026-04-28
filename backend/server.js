// Punto de entrada
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.listen(PORT, function () {
    console.log("El servidor Node esta corriendo en en http://localhost:${PORT}");
});