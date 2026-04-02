import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import BarberSelector from './components/BarberSelector';
import ServiceSelector from './components/ServiceSelector';
import TurnoForm from './components/TurnoForm';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import MisTurnos from './components/MisTurnos';

// El Guardaespaldas de las Rutas
// Si hay token en localStorage, dejá pasar. Si no, mandaló de una patada al login.
function RutaProtegida({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ClientFlow() {
  const [step, setStep] = useState(1);
  const [barber, setBarber] = useState(null);
  const [service, setService] = useState(null);
  
  // Resetea cuando se tira para atrás
  useEffect(() => {
    if (step === 1) {
      setBarber(null);
      setService(null);
    }
  }, [step]);

  const handleBarberSelect = (b) => {
    setBarber(b);
  };

  const handleNextToService = () => {
    if (barber) setStep(2);
  };

  const handleServiceSelect = (s) => {
    setService(s);
  };

  const handleNextToForm = () => {
    if (service) setStep(3);
  };

  const handleTurnoSuccess = () => {
    setStep(4);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Cero Chamuyo</h1>
        <p>Reservá tu lugar sin dar tantas vueltas.</p>
      </header>

      {step === 1 && (
        <>
          <MisTurnos />
          <BarberSelector 
            selectedBarber={barber} 
            onSelect={handleBarberSelect} 
            onNext={handleNextToService} 
          />
        </>
      )}

      {step === 2 && (
        <ServiceSelector 
          selectedService={service} 
          onSelect={handleServiceSelect} 
          onNext={handleNextToForm} 
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <TurnoForm 
          barber={barber} 
          service={service} 
          onSuccess={handleTurnoSuccess}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <div className="step-container success-message">
          <span>🙌</span>
          <h2>¡Turno confirmado, fiera!</h2>
          <p>Te esperamos. No te cuelgues que te cobramos igual (mentira, pero vení).</p>
          <button className="primary-btn" onClick={() => setStep(1)} style={{marginTop: '2rem'}}>
            Sacar otro turno
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientFlow />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={
        <RutaProtegida>
          <AdminPanel />
        </RutaProtegida>
      } />
    </Routes>
  );
}

export default App;
