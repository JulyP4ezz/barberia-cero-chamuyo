import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // El motorcito anda en el 3001, no en el 3000.
    fetch('http://localhost:3001/api/turnos')
      .then(res => res.json())
      .then(data => {
        setTurnos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fiera, falló la conexión con la DB:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="step-container" style={{maxWidth: '800px', width: '100%', margin: '0 auto'}}>
      <div className="admin-header">
        <h1>Centro de Comando</h1>
        <p style={{color: 'var(--accent-color)'}}>{turnos.length} turnos programados</p>
      </div>

      {loading ? (
        <p>Arrancando los motores, bancá un cacho...</p>
      ) : turnos.length === 0 ? (
        <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
          <p>La agenda está vacía. Es hora de hacer marketing, crack.</p>
        </div>
      ) : (
        <div className="options-grid">
          {turnos.map(turno => (
            <div key={turno.id} className="turno-card">
              <div className="turno-info">
                <h3>{turno.nombre_cliente}</h3>
                <p>📞 {turno.celular_cliente} | 🗓️ {turno.fecha_turno} (Barbero ID: {turno.barbero_id})</p>
              </div>
              <div className="turno-time">
                {turno.hora_turno.substring(0, 5)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
