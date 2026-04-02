import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function BarberSelector({ selectedBarber, onSelect, onNext }) {
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pedimos al backend quiénes cortan el pelo
  useEffect(() => {
    fetch(`${API_URL}/api/barberos`)
      .then(res => res.json())
      .then(data => {
        setBarberos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("No pudimos traer a los barberos", err);
        // Fallback local por si el backend se cuelga (demo mode)
        setBarberos([
          { id: 1, nombre: 'El Brian' },
          { id: 2, nombre: 'Juancho' }
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="step-container">
      <h2>Paso 1: ¿Con quién te querés cortar fiera?</h2>
      
      {loading ? (
        <p style={{textAlign: 'center', padding: '1rem'}}>Buscando barberos en el local...</p>
      ) : (
        <div className="options-grid">
          {barberos.map(b => (
            <button
              key={b.id}
              className={"option-btn " + (selectedBarber?.id === b.id ? 'selected' : '')}
              onClick={() => onSelect(b)}
            >
              ✂️ {b.nombre}
            </button>
          ))}
        </div>
      )}

      {selectedBarber && (
        <button className="primary-btn" onClick={onNext}>
          Siguiente paso
        </button>
      )}
    </div>
  );
}

export default BarberSelector;
