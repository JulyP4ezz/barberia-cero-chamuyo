import React, { useState, useEffect } from 'react';

function ServiceSelector({ selectedService, onSelect, onNext, onBack }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/servicios')
      .then(res => res.json())
      .then(data => {
        setServicios(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("No pudimos traer los servicios", err);
        // Fallback local
        setServicios([
          { id: 1, nombre: 'Corte Clásico', duracion: 60 },
          { id: 2, nombre: 'Fade Alto', duracion: 60 },
          { id: 3, nombre: 'Corte + Barba', duracion: 60 }
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="step-container">
      <h2>Paso 2: ¿Qué te vas a hacer?</h2>
      
      {loading ? (
        <p style={{textAlign: 'center', padding: '1rem'}}>Consultando el menú mágico...</p>
      ) : (
        <div className="options-grid">
          {servicios.map(s => (
            <button
              key={s.id}
              className={"option-btn " + (selectedService?.id === s.id ? 'selected' : '')}
              onClick={() => onSelect(s)}
            >
              💈 {s.nombre} 
              <span style={{float: 'right', fontSize: '0.8em', opacity: 0.7}}>({s.duracion} min)</span>
            </button>
          ))}
        </div>
      )}

      <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
        <button className="option-btn" onClick={onBack} style={{flex: 1, marginTop: 0}}>
          Atrás
        </button>
        <button 
          className="primary-btn" 
          onClick={onNext} 
          disabled={!selectedService}
          style={{flex: 2, marginTop: 0}}
        >
          Confirmar servicio
        </button>
      </div>
    </div>
  );
}

export default ServiceSelector;
