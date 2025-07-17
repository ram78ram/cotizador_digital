import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Row, Col, Image } from 'react-bootstrap';

const Home = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row>
        <Col className="text-center">
          <Image src="https://www.energrafica.com.mx/wp-content/uploads/2024/10/logo_energrafica.png" alt="Logo Energráfica" fluid style={{ maxHeight: '120px', marginBottom: '30px' }} className="logo-fade-in" />
          <h1>Selecciona una aplicación</h1>
          <div className="mt-4">
            <Link to="/cotizador">
              <Button variant="primary" size="lg" className="mx-2 home-button btn-custom-red">
                Cotizador Digital
              </Button>
            </Link>
            <Link to="/calculadora">
              <Button variant="secondary" size="lg" className="mx-2 home-button btn-custom-black">
                Cotizador Plotter
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
