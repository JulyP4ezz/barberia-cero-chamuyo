import React, { useState } from 'react';
import { API_URL } from '../config';

function MisTurnos() {
  // Levantamos el ARRAY de tickets del localStorage
  const [misTurnos, setMisTurnos] = useState(() => {
    const guardado = localStorage.getItem('misTurnos');
    return guardado ? JSON.parse(guardado) : [];
  });
  const [loadingToken, setLoadingToken] = useState(null); // Guardamos el token que está cancelando
  const [errores, setErrores] = useState({}); // Errores indexados por token

  // Si no hay ningún turno guardado, no mostramos nada. Invisible, como buen componente.
  if (misTurnos.length === 0) return null;

  const handleCancelar = (ticket) => {
    if (!window.confirm(
      `¿Seguro que querés cancelar tu turno del ${ticket.fecha_turno.split('-').reverse().join('/')} a las ${ticket.hora_turno} con ${ticket.barbero_nombre}?`
    )) return;

    setLoadingToken(ticket.token_cliente);

    fetch(`${API_URL}/api/mis-turnos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_cliente: ticket.token_cliente })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo cancelar el turno.');
        return data;
      })
      .then(() => {
        // Sacamos solo ESE ticket de la lista (los demás quedan intactos)
        const nuevaLista = misTurnos.filter(t => t.token_cliente !== ticket.token_cliente);
        localStorage.setItem('misTurnos', JSON.stringify(nuevaLista));
        setMisTurnos(nuevaLista);
        setLoadingToken(null);
      })
      .catch(err => {
        // Guardamos el error específico de ese ticket para mostrarlo debajo de su card
        setErrores(prev => ({ ...prev, [ticket.token_cliente]: err.message }));
        setLoadingToken(null);
      });
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-color)', margin: '0 0 0.75rem' }}>
        🗓️ Tus turnos reservados
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {misTurnos.map((ticket) => (
          <div
            key={ticket.token_cliente}
            style={{
              border: '1px solid var(--accent-color)',
              borderRadius: '4px',
              padding: '0.75rem 1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>
                {ticket.servicio_nombre} con {ticket.barbero_nombre}
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {ticket.fecha_turno.split('-').reverse().join('/')} a las {ticket.hora_turno} hs
              </p>
              {errores[ticket.token_cliente] && (
                <p style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  ✖ {errores[ticket.token_cliente]}
                </p>
              )}
            </div>
            <button
              className="btn-delete"
              style={{ marginTop: 0, whiteSpace: 'nowrap', padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
              onClick={() => handleCancelar(ticket)}
              disabled={loadingToken === ticket.token_cliente}
            >
              {loadingToken === ticket.token_cliente ? 'Cancelando...' : '✖ Cancelar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MisTurnos;
