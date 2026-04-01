const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors()); // Permitimos que el frontend de react conecte sin bardos de CORS
app.use(express.json()); // Entender JSON en el body de los requests

// ----------------================---------------- //
// ENDPOINTS DEL MOTORCITO
// ----------------================---------------- //

// Manda al frente a todos los barberos del local
app.get('/api/barberos', (req, res) => {
    db.all("SELECT * FROM barberos", [], (err, rows) => {
        if (err) return res.status(500).json({error: "Error leyendo barberos, capaz se durmieeron"});
        res.json(rows);
    });
});

// Trae los cortes y servicios que hacen
app.get('/api/servicios', (req, res) => {
    db.all("SELECT * FROM servicios", [], (err, rows) => {
        if (err) return res.status(500).json({error: "Error leyendo los servicios"});
        res.json(rows);
    });
});

// Chequea los turnos ya tomados de una fecha (onda, para saber qué horas tachar del sistema)
app.get('/api/turnos', (req, res) => {
    const { fecha, barbero_id } = req.query; // Esperamos algo como ?fecha=2024-05-15&barbero_id=1
    
    // Si querés traer todos sin filtro (no tan recomendado, pero bueh)
    let query = "SELECT * FROM turnos WHERE 1=1";
    let params = [];
    
    if (fecha) {
        query += " AND fecha_turno = ?";
        params.push(fecha);
    }
    
    if (barbero_id) {
        query += " AND barbero_id = ?";
        params.push(barbero_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({error: "Error trayendo la libretita de turnos"});
        res.json(rows);
    });
});

// Agrega un turno nuevo que pide el cliente (Post es como 'enviar formulario' en C)
app.post('/api/turnos', (req, res) => {
    const { nombre_cliente, celular_cliente, hora_turno, fecha_turno, barbero_id, servicio_id } = req.body;

    // Validación onda "si te falta un dato te pego un boleo"
    if (!nombre_cliente || !celular_cliente || !hora_turno || !fecha_turno || !barbero_id || !servicio_id) {
        return res.status(400).json({error: "Fiera, no me mandes campos vacíos, soy de sistema estricto."});
    }

    // Insertar en la base de datos
    db.run(
        'INSERT INTO turnos (nombre_cliente, celular_cliente, hora_turno, fecha_turno, barbero_id, servicio_id) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre_cliente, celular_cliente, hora_turno, fecha_turno, barbero_id, servicio_id],
        function(err) {
            if (err) {
                console.error("Bug insertando turno:", err);
                return res.status(500).json({error: "Falló la inscripción en la libretita de SQlite"});
            }
            res.status(201).json({ id: this.lastID, mensaje: "¡Turno anotado, nos vemos en la pelu!" });
        }
    );
});

// Prendemos el servidor y nos quedamos escuchando en el puerto
app.listen(PORT, () => {
    console.log(`Servidor andando en http://localhost:${PORT} papá. Listo para recibir clientes.`);
});
