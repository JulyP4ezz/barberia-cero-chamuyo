import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

// Helper para sacar la fecha de hoy
const getHoy = () => new Date().toISOString().split('T')[0];

const AdminPanel = () => {

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Por defecto, queremos ver los de "Hoy"
  const [fechaFiltro, setFechaFiltro] = useState(getHoy());

  // Si cambia la fecha, el useEffect vuelve a correr
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/turnos?fecha=${fechaFiltro}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTurnos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fiera, falló la conexión con la DB:", err);
        setLoading(false);
      });
  }, [fechaFiltro]);

  const handleBorrarTurno = (id) => {
    if (!window.confirm("¿Estás seguro de que querés borrar este turno? Mirá que no se recupera, eh.")) return;

    fetch(`${API_URL}/api/turnos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) alert(data.error);
        else setTurnos(turnos.filter(turno => turno.id !== id));
      })
      .catch(err => {
        console.error("Error al borrar:", err);
        alert("Falló la barredora. Avisale al pibe de sistemas.");
      });
  };

  // Función mágica para viajar en el tiempo
  const cambiarDia = (dias) => {
    if (!fechaFiltro) {
        // Si estaba en 'Todos' y toca flechita, lo mandamos a HOY + los días
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + dias);
        setFechaFiltro(hoy.toISOString().split('T')[0]);
        return;
    }
    const nuevaFecha = new Date(fechaFiltro + 'T12:00:00'); // Evitamos zona horaria bardo
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaFiltro(nuevaFecha.toISOString().split('T')[0]);
  };

  // Titulo dinámico sin repetir fechas
  const tituloFecha = fechaFiltro ? 'encontrados para este día' : 'en todo el historial';

  return (
    <div className="step-container" style={{maxWidth: '800px', width: '100%', margin: '0 auto'}}>
      
      {/* HEADER CENTRADO Y CONTROLES PRO */}
      <div className="admin-header" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: 'none', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0' }}>Centro de Comando</h1>
          <button onClick={handleLogout} className="btn-delete" style={{ marginTop: 0, padding: '0.4rem 0.8rem' }}>⏻ Salir</button>
        </div>
        <p style={{ color: 'var(--accent-color)', marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
          {turnos.length} turnos {tituloFecha}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          
          {/* CONTROLADOR DE FECHA TIPO RELOJ DIGITAL */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '50px', border: '1px solid var(--border-color)' }}>
            <button 
              type="button" 
              className="option-btn" 
              style={{ padding: '0.4rem 1rem', margin: 0, fontSize: '1rem', border: 'none', borderRadius: '50px 0 0 50px' }} 
              onClick={() => cambiarDia(-1)}
            >
              ◀
            </button>
            
            <div style={{ fontFamily: 'var(--display-font)', fontSize: '1.5rem', minWidth: '90px', textAlign: 'center', color: 'var(--text-primary)', letterSpacing: '2px' }}>
              {fechaFiltro ? fechaFiltro.split('-').reverse().slice(0,2).join('/') : '--/--'}
            </div>
            
            <button 
              type="button" 
              className="option-btn" 
              style={{ padding: '0.4rem 1rem', margin: 0, fontSize: '1rem', border: 'none', borderRadius: '0 50px 50px 0' }} 
              onClick={() => cambiarDia(1)}
            >
              ▶
            </button>
          </div>

          {/* BOTONES SECUNDARIOS */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button" 
              className="option-btn" 
              style={{ padding: '0.5rem 1rem', margin: 0, fontSize: '0.8rem', opacity: fechaFiltro === getHoy() ? 0.3 : 1 }} 
              onClick={() => setFechaFiltro(getHoy())}
              disabled={fechaFiltro === getHoy()}
            >
              Ir a Hoy
            </button>
            <button 
               type="button" 
               className="option-btn" 
               style={{ 
                 padding: '0.5rem 1rem', 
                 margin: 0, 
                 fontSize: '0.8rem',
                 backgroundColor: !fechaFiltro ? 'var(--accent-color)' : 'transparent', 
                 color: !fechaFiltro ? 'var(--bg-color)' : 'var(--text-primary)',
                 borderColor: !fechaFiltro ? 'var(--accent-color)' : 'var(--border-color)'
               }} 
               onClick={() => setFechaFiltro('')}
            >
               Ver Todos
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ height: '4px', backgroundColor: 'var(--accent-color)', width: '100%', marginBottom: '2rem' }}></div>

      {loading ? (
        <p>Arrancando los motores, bancá un cacho...</p>
      ) : turnos.length === 0 ? (
        <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
          <p>La agenda está vacía. Es hora de hacer marketing, crack.</p>
        </div>
      ) : (
        <div className="options-grid">
          {turnos.map(turno => (
            <div key={turno.id} className="turno-card" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="turno-info" style={{ flexGrow: 1 }}>
                <h3>{turno.nombre_cliente}</h3>
                <p>📞 {turno.celular_cliente} | 🗓️ {turno.fecha_turno.split('-').reverse().join('/')}</p>
                <p style={{color: 'var(--accent-color)', fontSize: '0.8rem', marginTop: '0.5rem', textTransform: 'uppercase'}}>
                  ✂️ {turno.servicio_nombre} con <strong>{turno.barbero_nombre}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div className="turno-time">
                  {turno.hora_turno.substring(0, 5)}
                </div>
                <button 
                  onClick={() => handleBorrarTurno(turno.id)} 
                  className="btn-delete"
                >
                  ✖ Cancelar Turno
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
