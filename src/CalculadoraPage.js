import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const CalculadoraPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button
        variant="primary"
        onClick={() => navigate('/')}
        style={{ margin: '10px' }}
      >
        ← Regresar a la Página Principal
      </Button>
      <iframe
        src="/calculadora_app/calculadora.html"
        title="Calculadora de Precios"
        style={{ width: '100%', height: '100%', border: 'none' }}
      ></iframe>
    </div>
  );
};

export default CalculadoraPage;
