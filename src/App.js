import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import CotizadorDigital from './CotizadorDigital';
import CalculadoraPage from './CalculadoraPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cotizador" element={<CotizadorDigital />} />
        <Route path="/calculadora" element={<CalculadoraPage />} />
      </Routes>
    </Router>
  );
}

export default App;
