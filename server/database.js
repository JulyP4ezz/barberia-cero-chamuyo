const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Nos conectamos al archivo de la base de datos (se crea solo si no existe)
const dbPath = path.resolve(__dirname, 'barberia.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error al abrir la base de datos", err.message);
    } else {
        console.log("Conectado a la base de datos SQLite 'barberia.db' fiera.");
        
        // Creamos las tablas necesarias
        db.serialize(() => {
            // Tabla de Barberos
            db.run(`CREATE TABLE IF NOT EXISTS barberos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL
            )`);

            // Tabla de Servicios
            db.run(`CREATE TABLE IF NOT EXISTS servicios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                duracion INTEGER DEFAULT 60
            )`);

            // Tabla de Turnos
            // FOREIGN KEY (barbero_id) REFERENCES barberos(id) para que no haya turnos de barberos fantasma
            db.run(`CREATE TABLE IF NOT EXISTS turnos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre_cliente TEXT NOT NULL,
                celular_cliente TEXT NOT NULL,
                hora_turno TEXT NOT NULL, /* Guardamos la hora onda '10:00' o un timestamp */
                fecha_turno TEXT NOT NULL, /* Guardamos la fecha onda 'YYYY-MM-DD' */
                barbero_id INTEGER NOT NULL,
                servicio_id INTEGER NOT NULL,
                FOREIGN KEY (barbero_id) REFERENCES barberos(id),
                FOREIGN KEY (servicio_id) REFERENCES servicios(id)
            )`);

            // Insertamos datos por defecto si la base está vacía
            db.get("SELECT COUNT(*) AS count FROM barberos", (err, row) => {
                if (row && row.count === 0) {
                    db.run("INSERT INTO barberos (nombre) VALUES ('El Brian'), ('Juancho')");
                }
            });

            db.get("SELECT COUNT(*) AS count FROM servicios", (err, row) => {
                if (row && row.count === 0) {
                    db.run("INSERT INTO servicios (nombre, duracion) VALUES ('Corte Clásico', 60), ('Fade Alto', 60), ('Corte + Barba', 60)");
                }
            });
        });
    }
});

module.exports = db;
