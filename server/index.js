const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('./database');

const app = express();
const PORT = 3001;

// La clave secreta con la que firmamos los tokens. En producción esto va en una variable de entorno, no hardcodeada.
const JWT_SECRET = 'barberia_cero_chamuyo_super_secreto_2024';

// Credenciales del administrador (hardcodeadas por simplicidad, sin BD de usuarios)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'barbero123';

// Middlewares
app.use(cors()); // Permitimos que el frontend de react conecte sin bardos de CORS
app.use(express.json()); // Entender JSON en el body de los requests

// Ruta principal de bienvenida (para que no tire 'Cannot GET /')
app.get('/', (req, res) => {
    res.send("¡Hola fiera! Bienvenido al backend de la Barbería 'Cero Chamuyo'. Acá solo escupimos datos (JSON), no dibujitos.");
});

// ================== EL PATOVICA ==================
// Middleware que chequea si el token JWT en el header es válido.
// Si no pasa, devuelve 401 (No autorizado) y corta la cadena.
const verificarToken = (req, res, next) => {
    // El token viene en el header "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Agarramos solo el token, sin el "Bearer"

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Falta la pulserita VIP (token).' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o vencido. Volvé a loguearte, fiera.' });
        }
        req.user = user; // Guardamos la info del usuario en el request para usarla si se necesita
        next(); // Pasa para adentro, está todo bien
    });
};

// ================== ENDPOINT DE LOGIN ==================
// El cliente manda usuario y clave, el server le da el token si está bien
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;

    if (usuario !== ADMIN_USER || password !== ADMIN_PASS) {
        return res.status(401).json({ error: '¡Credenciales incorrectas! Ni en pedo te dejo pasar, fiera.' });
    }

    // Generamos el token: firmamos un payload con la clave secreta y le ponemos vencimiento de 8 horas.
    const token = jwt.sign({ usuario: ADMIN_USER }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, mensaje: '¡Bienvenido al Centro de Comando, jefe!' });
});

// ----------------================---------------- //
// ENDPOINTS DEL MOTORCITO
// ----------------================---------------- //

// Manda al frente a todos los barberos del local
app.get('/api/barberos', (req, res) => {
    db.all("SELECT * FROM barberos", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error leyendo barberos, capaz se durmieeron" });
        res.json(rows);
    });
});

// Trae los cortes y servicios que hacen
app.get('/api/servicios', (req, res) => {
    db.all("SELECT * FROM servicios", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error leyendo los servicios" });
        res.json(rows);
    });
});

// Chequea los turnos: el Admin Panel lo usa (requiere token), el TurnoForm también para disponibilidad (no requiere token)
// Si viene ?barbero_id es el cliente chequeando horas. Si solo viene ?fecha es el admin panel.
app.get('/api/turnos', (req, res, next) => {
    const { barbero_id } = req.query;
    // Si no viene barbero_id, es el admin panel → chequeamos token
    if (!barbero_id) {
        return verificarToken(req, res, next);
    }
    next(); // Es el cliente buscando disponibilidad, que pase
}, (req, res) => {
    const { fecha, barbero_id } = req.query; // Esperamos algo como ?fecha=2024-05-15&barbero_id=1

    // Hacemos un JOIN para que traiga los nombres y no solo los IDs (nada de andar adivinando)
    let query = `
        SELECT 
            turnos.*, 
            barberos.nombre AS barbero_nombre, 
            servicios.nombre AS servicio_nombre
        FROM turnos
        JOIN barberos ON turnos.barbero_id = barberos.id
        JOIN servicios ON turnos.servicio_id = servicios.id
        WHERE 1=1
    `;
    let params = [];

    if (fecha) {
        query += " AND turnos.fecha_turno = ?";
        params.push(fecha);
    }

    if (barbero_id) {
        query += " AND turnos.barbero_id = ?";
        params.push(barbero_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: "Error trayendo la libretita de turnos" });
        res.json(rows);
    });
});

// ================== ESCUDO 1: RATE LIMITER ==================
// Máximo 3 turnos por IP cada 24 horas. Frena bots y routers compinches.
const turnosLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 3,
    message: { error: '¡Epa! Ya creaste demasiados turnos desde esta conexión hoy. Volvé mañana o llamá al local.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Agrega un turno nuevo que pide el cliente (Post es como 'enviar formulario' en C)
app.post('/api/turnos', turnosLimiter, (req, res) => {
    const { nombre_cliente, celular_cliente, hora_turno, fecha_turno, barbero_id, servicio_id } = req.body;

    // Validación onda "si te falta un dato te pego un boleo"
    if (!nombre_cliente || !celular_cliente || !hora_turno || !fecha_turno || !barbero_id || !servicio_id) {
        return res.status(400).json({ error: "Fiera, no me mandes campos vacíos, soy de sistema estricto." });
    }

    // ================== ESCUDO 2: LIMITE POR CELULAR ==================
    // Máximo 2 turnos activos (a futuro) por número de celular. Frena a los chantas con números falsos.
    const hoy = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato YYYY-MM-DD
    db.get(
        'SELECT COUNT(*) as total FROM turnos WHERE celular_cliente = ? AND fecha_turno >= ?',
        [celular_cliente, hoy],
        (err, row) => {
            if (err) return res.status(500).json({ error: 'Error verificando los turnos del celular.' });
            
            if (row.total >= 2) {
                return res.status(429).json({ error: '¡Ya tenés 2 turnos reservados con ese celular! Cancélalos antes de sacar otro.' });
            }

    // El Patovica: Chequeamos que el barbero no esté ocupado en ese horario
    db.get(
        'SELECT id FROM turnos WHERE barbero_id = ? AND fecha_turno = ? AND hora_turno = ?',
        [barbero_id, fecha_turno, hora_turno],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Falló el chequeo de turnos duplicados." });
            }

            if (row) {
                // Si 'row' tiene algo, significa que ya existe un turno!
                return res.status(409).json({ error: "¡Opa! El barbero ya tiene a alguien en esa silla a esa hora. Elegí otro horario." });
            }

            // Si pasó el de seguridad, insertamos en la base de datos
            db.run(
                'INSERT INTO turnos (nombre_cliente, celular_cliente, hora_turno, fecha_turno, barbero_id, servicio_id) VALUES (?, ?, ?, ?, ?, ?)',
                [nombre_cliente, celular_cliente, hora_turno, fecha_turno, barbero_id, servicio_id],
                function (err) {
                    if (err) {
                        console.error("Bug insertando turno:", err);
                        return res.status(500).json({ error: "Falló la inscripción en la libretita de SQlite" });
                    }
                    
                    // Generamos el 'Ticket Secreto' del cliente con el ID del turno
                    // El cliente lo guarda en su celu y lo usa para cancelar únicamente el SUYO
                    const turnoId = this.lastID;
                    const token_cliente = jwt.sign(
                        { turno_id: turnoId },  // Lo que guardamos dentro del ticket
                        JWT_SECRET,              // Lo firmamos con el mismo secreto del server
                        { expiresIn: '30d' }     // Vence en 30 días, que es más que suficiente
                    );
                    
                    res.status(201).json({
                        id: turnoId,
                        token_cliente, // El ticket que el frontend va a guardar en localStorage
                        mensaje: "¡Turno anotado, nos vemos en la pelu!"
                    });
                });
            } // cierra validación de barbero ocupado
        ); // cierra db.get de barbero

        } // cierra validación de celular
    ); // cierra db.get de celular
});

// Cancelación del cliente usando su Ticket Secreto (NO requiere ser barbero)
app.delete('/api/mis-turnos', (req, res) => {
    const { token_cliente } = req.body;
    
    if (!token_cliente) {
        return res.status(400).json({ error: 'Falta el ticket de turno, fiera.' });
    }
    
    // Verificamos que el ticket es real y no fue inventado
    jwt.verify(token_cliente, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Ticket inválido o vencido. Hablá con el barbero para cancelar.' });
        }
        
        const turnoId = decoded.turno_id;
        
        db.run('DELETE FROM turnos WHERE id = ?', [turnoId], function(err) {
            if (err) {
                return res.status(500).json({ error: 'No se pudo cancelar el turno. Intentá de nuevo.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Ese turno ya no existe en la libretita. Puede que ya lo hayan cancelado.' });
            }
            res.json({ mensaje: 'Turno cancelado con éxito. ¡Hasta la próxima!' });
        });
    });
});

// La barredora: Borra un turno si el barbero lo cancela (REQUIERE TOKEN - solo admins)
app.delete('/api/turnos/:id', verificarToken, (req, res) => {
    const idParam = req.params.id; // Agarramos el ID que viene en la URL

    db.run("DELETE FROM turnos WHERE id = ?", [idParam], function (err) {
        if (err) {
            console.error("No se pudo borrar el turno:", err);
            return res.status(500).json({ error: "Fiera, la base de datos se trabó y no quiere soltar el turno." });
        }

        // this.changes nos dice cuántas filas afectó el DELETE. Si es 0, el turno no existía.
        if (this.changes === 0) {
            return res.status(404).json({ error: "No encontré ningún turno con ese ID, capo." });
        }

        res.status(200).json({ mensaje: "¡Turno borrado con éxito! A barrer el piso." });
    });
});

// Prendemos el servidor y nos quedamos escuchando en el puerto
app.listen(PORT, () => {
    console.log(`Servidor andando en http://localhost:${PORT} papá. Listo para recibir clientes.`);
});
