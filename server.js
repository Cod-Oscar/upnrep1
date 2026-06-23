const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');
const path    = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ===== POOL DE CONEXIÓN MYSQL =====
const pool = mysql.createPool({
    host:             process.env.DB_HOST     || 'localhost',
    user:             process.env.DB_USER     || 'colegio_app',
    password:         process.env.DB_PASSWORD || 'password123',
    database:         process.env.DB_NAME     || 'colegio_san_miguel',
    waitForConnections: true,
    connectionLimit:  10
});

// ===== RUTAS PÁGINAS =====
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, 'index.html')));

['nosotros','academico','estudiantes','padres','galeria','admision','contacto']
.forEach(p => {
    app.get(`/pages/${p}`, (req, res) =>
        res.sendFile(path.join(__dirname, 'pages', `${p}.html`)));
    app.get(`/pages/${p}.html`, (req, res) =>
        res.sendFile(path.join(__dirname, 'pages', `${p}.html`)));
});

// ===== API: CONTACTOS =====
app.post('/api/contactos', async (req, res) => {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    if (!nombre || !email || !asunto || !mensaje)
        return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    try {
        const conn = await pool.getConnection();
        const [result] = await conn.execute(
            'INSERT INTO contactos (nombre, email, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, telefono || null, asunto, mensaje]
        );
        conn.release();
        console.log(`✅ Contacto guardado: ${nombre}`);
        res.status(201).json({ success: true, message: 'Mensaje enviado correctamente', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/contactos', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT * FROM contactos ORDER BY fecha_creacion DESC LIMIT 50');
        conn.release();
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ===== API: ADMISIÓN =====
app.post('/api/solicitudes-admision', async (req, res) => {
    const { nombre_estudiante, apellido_estudiante, fecha_nacimiento, email_padre, telefono_padre, grado_interes } = req.body;
    if (!nombre_estudiante || !apellido_estudiante || !fecha_nacimiento || !email_padre || !telefono_padre || !grado_interes)
        return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    try {
        const conn = await pool.getConnection();
        const [result] = await conn.execute(
            `INSERT INTO solicitudes_admision
             (nombre_estudiante, apellido_estudiante, fecha_nacimiento, email_padre, telefono_padre, grado_interes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre_estudiante, apellido_estudiante, fecha_nacimiento, email_padre, telefono_padre, grado_interes]
        );
        conn.release();
        console.log(`✅ Admisión: ${nombre_estudiante} ${apellido_estudiante}`);
        res.status(201).json({
            success: true,
            message: 'Solicitud registrada. Te contactaremos en 24 horas.',
            numero_solicitud: `ADM-${result.insertId}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ===== API: COMUNICADOS =====
app.get('/api/comunicados', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query(
            'SELECT * FROM comunicados WHERE activo = TRUE ORDER BY fecha_publicacion DESC LIMIT 10'
        );
        conn.release();
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ===== API: HEALTH CHECK =====
app.get('/api/health', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        conn.release();
        res.json({ success: true, status: 'OK', database: 'Conectado', timestamp: new Date() });
    } catch (err) {
        res.status(500).json({ success: false, status: 'Error BD', error: err.message });
    }
});

// ===== 404 =====
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
        <title>404</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 80px;
                   background: linear-gradient(135deg,#1a56db,#0ea5e9); color: white; }
            h1 { font-size: 60px; } p { font-size: 18px; }
            a { color: white; font-weight: bold; }
        </style></head><body>
        <h1>404</h1><p>Página no encontrada.</p>
        <a href="/">← Volver al inicio</a>
        </body></html>
    `);
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   🎓 COLEGIO SAN MIGUEL - SERVIDOR ACTIVO   ║
╠══════════════════════════════════════════════╣
║  🌐 http://localhost:${PORT}
║  🗄️  BD: ${process.env.DB_NAME || 'colegio_san_miguel'}
║  📅 ${new Date().toLocaleString('es-PE')}
╚══════════════════════════════════════════════╝
    `);
});