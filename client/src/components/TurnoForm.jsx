import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function TurnoForm({ barber, service, onSuccess, onBack }) {
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    celular_cliente: '',
    fecha_turno: new Date().toISOString().split('T')[0], // Hoy por defecto
    hora_turno: '' // Arranca vacío para que el cliente elija
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para manejar los horarios ocupados
  const [occupiedHours, setOccupiedHours] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);

  // Generamos horas entre las 10:00 y las 19:00
  const availableHours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  // Cuando cambia la fecha (o es la primera vez), le preguntamos al backend qué horas están tomadas
  useEffect(() => {
    setLoadingHours(true);
    setOccupiedHours([]);
    // Si cambia el día, blanqueamos la hora porque capaz eligió una que mañana está ocupada
    setFormData(prev => ({ ...prev, hora_turno: '' }));

    fetch(`${API_URL}/api/turnos?fecha=${formData.fecha_turno}&barbero_id=${barber.id}`)
      .then(res => res.json())
      .then(data => {
        // 'data' trae todos los turnos de ese día para ese barbero. 
        // Solo nos interesa armar una listita con las horas ('10:00', '15:00', etc)
        const ocupadas = data.map(turno => turno.hora_turno);
        setOccupiedHours(ocupadas);
        setLoadingHours(false);
      })
      .catch(err => {
        console.error("Error checkeando la libretita:", err);
        setLoadingHours(false);
      });
  }, [formData.fecha_turno, barber.id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleHourSelect = (hora) => {
    setFormData({ ...formData, hora_turno: hora });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación de atolondrado: si no clickeó ninguna hora, le avisamos antes de pedirle al backend
    if (!formData.hora_turno) {
      setError("¡Ey fiera! Te olvidaste de elegir a qué hora venís. Seleccioná un horario.");
      return;
    }
    
    setLoading(true);
    setError('');

    // Preparamos el paquete de datos para mandarle al backend
    const payload = {
      ...formData,
      barbero_id: barber.id,
      servicio_id: service.id
    };

    fetch(`${API_URL}/api/turnos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Aflojale, hubo un bardo al guardar el turno.");
      }
      return data;
    })
    .then(data => {
      // Leemos los tickets que ya había guardados (o un array vacío si era la primera vez)
      const ticketsGuardados = JSON.parse(localStorage.getItem('misTurnos') || '[]');
      
      // Armamos el nuevo ticket con toda la info que vamos a necesitar para mostrarlo
      const nuevoTicket = {
        token_cliente: data.token_cliente,
        nombre_cliente: formData.nombre_cliente,
        fecha_turno: formData.fecha_turno,
        hora_turno: formData.hora_turno,
        barbero_nombre: barber.nombre,
        servicio_nombre: service.nombre,
      };
      
      // Lo sumamos a la lista y lo guardamos todo de vuelta (sin pisar nada)
      ticketsGuardados.push(nuevoTicket);
      localStorage.setItem('misTurnos', JSON.stringify(ticketsGuardados));
      setLoading(false);
      onSuccess(); // Éxito de verdad, brindamos con mate
    })
    .catch(err => {
      console.error("Bardo en el fetch:", err);
      setError(err.message); 
      setLoading(false);
    });
  };

  return (
    <div className="step-container">
      <h2>Paso 3: Poné la firma, capo</h2>
      
      <div style={{marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
        <p style={{margin: 0, fontSize: '0.9rem', color: '#ccc'}}>
          <strong>Estás pidiendo:</strong> {service.nombre} con {barber.nombre}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre_cliente">Nombre completo (Sin seudónimos raros)</label>
          <input 
            type="text" 
            id="nombre_cliente"
            name="nombre_cliente"
            required 
            placeholder="Ej: Marcos Pérez"
            value={formData.nombre_cliente}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="celular_cliente">Celular (Para mandarte un WhatsApp)</label>
          <input 
            type="tel" 
            id="celular_cliente"
            name="celular_cliente"
            required 
            placeholder="Ej: 1123456789"
            value={formData.celular_cliente}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fecha_turno">Día</label>
          <input 
            type="date" 
            id="fecha_turno"
            name="fecha_turno"
            required
            min={new Date().toISOString().split('T')[0]}
            value={formData.fecha_turno}
            onChange={handleChange}
            style={{width: '100%'}}
          />
        </div>

        <div className="form-group" style={{marginTop: '0.5rem'}}>
          <label>Horarios Disponibles</label>
          {loadingHours ? (
            <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Chusmeando la libretita de turnos...</p>
          ) : (
            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '0.5rem', 
              marginTop: '0.5rem'
            }}>
              {availableHours.map(h => {
                const isOccupied = occupiedHours.includes(h);
                const isSelected = formData.hora_turno === h;
                
                return (
                  <button
                    key={h}
                    type="button"
                    disabled={isOccupied}
                    onClick={() => handleHourSelect(h)}
                    style={{
                      padding: '0.75rem 0.5rem',
                      backgroundColor: isSelected ? 'var(--accent-color)' : 'transparent',
                      color: isSelected ? 'var(--bg-color)' : (isOccupied ? '#444' : 'var(--text-primary)'),
                      border: `1px solid ${isOccupied ? '#222' : (isSelected ? 'var(--accent-color)' : 'var(--border-color)')}`,
                      cursor: isOccupied ? 'not-allowed' : 'pointer',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      textDecoration: isOccupied ? 'line-through' : 'none',
                      fontFamily: 'var(--body-font)',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <div style={{color: 'var(--error-color)', marginTop: '1rem', fontSize: '0.9rem'}}>{error}</div>}

        <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
          <button type="button" className="option-btn" onClick={onBack} style={{flex: 1, marginTop: 0}}>
            Atrás
          </button>
          <button type="submit" className="primary-btn" disabled={loading || loadingHours} style={{flex: 2, marginTop: 0}}>
            {loading ? "Anotando..." : "Confirmar Turno"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TurnoForm;
