import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Card, Row, Col, Image } from 'react-bootstrap';
import jsPDF from 'jspdf';
import './App.css';
import ProductForm from './ProductForm'; // Importar el nuevo componente

function CotizadorDigital() {
  const navigate = useNavigate();
  const [clientType, setClientType] = useState('');
  const [cliente, setCliente] = useState('');
  const [proyecto, setProyecto] = useState('');
  
  // Estado para el producto actual que se está editando
  const [currentProduct, setCurrentProduct] = useState({
    id: 1, cantidadPiezas: '', piezasPorPliego: '', merma: '', material: '', laminado: '', 
    acabado1: '', costoAcabado1: '', acabado2: '', costoAcabado2: '', acabado3: '', costoAcabado3: '', 
    otroCosto: '', otroCostoDescripcion: '', envio: '', pliegosTotales: 0, costoTotal: 0
  });

  // Estado para los productos ya cotizados
  const [quotedProducts, setQuotedProducts] = useState([]);

  const [totalCostoGeneral, setTotalCostoGeneral] = useState(0);
  const [totalPliegosGeneral, setTotalPliegosGeneral] = useState(0);

  const cardRef = useRef();

  const materialesPublico = useMemo(() => ({
    'COUCHE 150 GRS FTE': 9.00,
    'COUCHE 150 GRS FTE Y VTA': 18.00,
    'COUCHE 200, 250 y 300 GRS FTE': 10.00,
    'COUCHE 200, 250 y 300 GRS FTE Y VTA': 20.00,
    'BOND 90 GRS FTE': 8.00,
    'BOND 90 GRS FTE Y VTA': 16.00,
    'SULFATADA 12 PUNTOS FTE': 11.00,
    'SULFATADA 12 PUNTOS FTE Y VTA': 22.00,
    'ADHESIVO': 11.00,
    'OPALINA 120 G. FTE': 9.00,
    'OPALINA 120 G. FTE Y VTA': 18.00,
    'OPALINA 225 G.FTE': 10.00,
    'OPALINA 225 G. FTE Y VTA': 20.00,
  }), []);

  const materialesVIP = useMemo(() => ({
    'COUCHE 150 GRS FTE': 8.00,
    'COUCHE 150 GRS FTE Y VTA': 16.00,
    'COUCHE 200, 250 y 300 GRS FTE': 9.00,
    'COUCHE 200, 250 y 300 GRS FTE Y VTA': 18.00,
    'BOND 90 GRS FTE': 7.00,
    'BOND 90 GRS FTE Y VTA': 14.00,
    'SULFATADA 12 PUNTOS FTE': 10.00,
    'SULFATADA 12 PUNTOS FTE Y VTA': 20.00,
    'ADHESIVO': 10.00,
    'OPALINA 120 G. FTE': 8.00,
    'OPALINA 120 G. FTE Y VTA': 16.00,
    'OPALINA 225 G.FTE': 9.00,
    'OPALINA 225 G. FTE Y VTA': 18.00,
  }), []);

  const costosAcabados = useMemo(() => ({
    'CORTE': [100, 200, 300],
    'PLECA': [100, 200, 300],
    'GRAPA': [200, 300, 500],
    'HOTMELT': [500, 800, 1200],
    'SUAJE': [400, 800, 1200],
    'DOBLEZ': [0],
  }), []);

  const costosEnvio = useMemo(() => ({
    'Envío 1': 100,
    'Envío 2': 200,
    'Envío 3': 500,
  }), []);

  // Función para añadir el producto actual a la lista de cotizados
  const handleAddProductToQuote = () => {
    if (currentProduct.cantidadPiezas && currentProduct.piezasPorPliego && currentProduct.material) {
      setQuotedProducts(prev => [...prev, {
        ...currentProduct,
        id: Date.now(),
        cliente: cliente, // Añadir el cliente actual
        proyecto: proyecto // Añadir el proyecto actual
      }]);
      // Resetear el formulario actual para una nueva entrada
      setCurrentProduct({
        id: 1, cantidadPiezas: '', piezasPorPliego: '', merma: '', material: '', laminado: '', 
        acabado1: '', costoAcabado1: '', acabado2: '', costoAcabado2: '', acabado3: '', costoAcabado3: '', 
        otroCosto: '', otroCostoDescripcion: '', envio: '', pliegosTotales: 0, costoTotal: 0
      });
    } else {
      alert("Por favor, complete al menos Cantidad de Piezas, Piezas por Pliego y Material para añadir a la cotización.");
    }
  };

  // Función para limpiar solo los campos del formulario actual
  const handleClearForm = () => {
    setCurrentProduct({
      id: 1, cantidadPiezas: '', piezasPorPliego: '', merma: '', material: '', laminado: '', 
      acabado1: '', costoAcabado1: '', acabado2: '', costoAcabado2: '', acabado3: '', costoAcabado3: '', 
      otroCosto: '', otroCostoDescripcion: '', envio: '', pliegosTotales: 0, costoTotal: 0
    });
  };

  // Función para actualizar el producto actual
  const handleCurrentProductChange = useCallback((updatedProduct) => {
    setCurrentProduct(updatedProduct);
  }, []);

  // Función para eliminar un producto de la cotización
  const handleDeleteProduct = useCallback((idToDelete) => {
    setQuotedProducts(prevProducts => prevProducts.filter(product => product.id !== idToDelete));
  }, []);

  // Calcular el costo total general y pliegos totales generales de los productos cotizados
  useEffect(() => {
    const newTotalCostoGeneral = quotedProducts.reduce((sum, product) => sum + product.costoTotal, 0);
    const newTotalPliegosGeneral = quotedProducts.reduce((sum, product) => sum + product.pliegosTotales, 0);
    setTotalCostoGeneral(newTotalCostoGeneral);
    setTotalPliegosGeneral(newTotalPliegosGeneral);
  }, [quotedProducts]);

  const handleDownloadPdf = () => {
    if (quotedProducts.length === 0) {
      alert("Agregue al menos un producto a la cotización para generar el PDF.");
      return;
    }

    const doc = new jsPDF();
    let yPos = 10; // Posición inicial Y

    // Productos Cotizados
    doc.setFontSize(14);
    doc.text("Productos Cotizados:", 10, yPos);
    yPos += 10;

    // Añadir la fecha de creación
    const today = new Date();
    const dateString = today.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10);
    doc.text(`Fecha de Creación: ${dateString}`, 10, yPos);
    yPos += 10; // Espacio después de la fecha

    quotedProducts.forEach((product, index) => {
      if (yPos > 280) { // Si se acerca al final de la página, añade una nueva
        doc.addPage();
        yPos = 10; // Reinicia la posición Y en la nueva página
      }

      doc.setFontSize(12);
      doc.text(`Producto ${index + 1}:`, 15, yPos);
      yPos += 7;
      // Añadir Cliente y Proyecto para cada producto
      if (product.cliente) {
        doc.setFontSize(10);
        doc.text(`  Cliente: ${product.cliente}`, 20, yPos);
        yPos += 5;
      }
      if (product.proyecto) {
        doc.setFontSize(10);
        doc.text(`  Proyecto: ${product.proyecto}`, 20, yPos);
        yPos += 5;
      }
      doc.setFontSize(10); // Asegurar que el tamaño de fuente sea 10 para los detalles del producto
      doc.text(`  Cantidad de Piezas: ${product.cantidadPiezas}`, 20, yPos);
      yPos += 5;
      doc.text(`  Piezas por Pliego: ${product.piezasPorPliego}`, 20, yPos);
      yPos += 5;
      doc.text(`  Merma: ${product.merma || '0'}`, 20, yPos);
      yPos += 5;
      doc.text(`  Material: ${product.material}`, 20, yPos);
      yPos += 5;
      if (product.laminado) {
        doc.text(`  Laminado: ${product.laminado}`, 20, yPos);
        yPos += 5;
      }
      if (product.acabado1) {
        doc.text(`  Acabado 1: ${product.acabado1} (${product.costoAcabado1})`, 20, yPos);
        yPos += 5;
      }
      if (product.acabado2) {
        doc.text(`  Acabado 2: ${product.acabado2} (${product.costoAcabado2})`, 20, yPos);
        yPos += 5;
      }
      if (product.acabado3) {
        doc.text(`  Acabado 3: ${product.acabado3} (${product.costoAcabado3})`, 20, yPos);
        yPos += 5;
      }
      if (product.otroCosto) {
        doc.text(`  Otro Costo: ${parseFloat(product.otroCosto).toFixed(2)} (${product.otroCostoDescripcion})`, 20, yPos);
        yPos += 5;
      }
      if (product.envio) {
        doc.text(`  Envío: ${product.envio}`, 20, yPos);
        yPos += 5;
      }
      doc.text(`  Pliegos Totales: ${product.pliegosTotales.toFixed(0)}`, 20, yPos);
      yPos += 5;
      doc.text(`  Costo Individual: ${product.costoTotal.toFixed(2)}`, 20, yPos);
      yPos += 10; // Espacio entre productos
    });

    // Totales Generales
    if (yPos > 270) { // Si se acerca al final de la página, añade una nueva
      doc.addPage();
      yPos = 10; // Reinicia la posición Y en la nueva página
    }
    doc.setFontSize(14);
    doc.text("Resumen General:", 10, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(`Pliegos totales (incluyendo merma): ${totalPliegosGeneral.toFixed(0)}`, 15, yPos);
    yPos += 7;
    doc.text(`Costo total estimado: $${totalCostoGeneral.toFixed(2)}`, 15, yPos);

    doc.save(`cotizacion_${cliente || 'sin_cliente'}_${proyecto || 'sin_proyecto'}.pdf`);
  };

  return (
    <Container className="my-5">
      <Card ref={cardRef}>
        <Card.Header className="text-center py-3 bg-danger text-white">
          <Button
            variant="light"
            onClick={() => navigate('/')}
            style={{ position: 'absolute', left: '15px', top: '15px' }}
          >
            ← Regresar
          </Button>
          <Image src="https://www.energrafica.com.mx/wp-content/uploads/2024/10/logo_energrafica.png" alt="Logo" fluid style={{ maxHeight: '80px', marginBottom: '10px' }} />
          <h3>Cotizador Digital</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Cliente</Form.Label>
              <Form.Select value={clientType} onChange={(e) => setClientType(e.target.value)}>
                <option value="">Seleccione tipo de cliente</option>
                <option value="Publico">Público</option>
                <option value="VIP">VIP</option>
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label as="strong" style={{ textTransform: 'uppercase' }}>Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre del cliente"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label as="strong" style={{ textTransform: 'uppercase' }}>Proyecto</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre del proyecto"
                    value={proyecto}
                    onChange={(e) => setProyecto(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Formulario para el producto actual */}
            <div className="mb-4 p-3 border rounded">
              <h4>Producto Actual</h4>
              <ProductForm
                product={currentProduct}
                onProductChange={handleCurrentProductChange}
                clientType={clientType}
                materialesPublico={materialesPublico}
                materialesVIP={materialesVIP}
                costosAcabados={costosAcabados}
                costosEnvio={costosEnvio}
              />
              <div className="mt-3 text-center">
                <p className="lead mb-1">Pliegos del Producto Actual: <strong>{currentProduct.pliegosTotales.toFixed(0)}</strong></p>
                <p className="lead">Costo del Producto Actual: <strong>${currentProduct.costoTotal.toFixed(2)}</strong></p>
              </div>
            </div>

            <div className="d-grid gap-2 mt-3">
              <Button variant="primary" onClick={handleAddProductToQuote}>
                Agregar Producto a Cotización
              </Button>
              <Button variant="danger" onClick={handleClearForm}>
                Limpiar
              </Button>
              <Button variant="secondary" onClick={handleDownloadPdf} className="mt-2">
                Descargar Cotización (PDF)
              </Button>
            </div>
          </Form>

          {/* Sección para mostrar productos cotizados */}
          {quotedProducts.length > 0 && (
            <div className="mt-4">
              <h4>Productos Cotizados:</h4>
              {quotedProducts.map((product, index) => (
                <Card key={product.id} className="mb-2 p-2">
                  <Card.Body>
                    <p><strong>Producto {index + 1}:</strong></p>
                    {product.cliente && <p className="mb-1"><strong>Cliente:</strong> {product.cliente}</p>}
                    {product.proyecto && <p className="mb-1"><strong>Proyecto:</strong> {product.proyecto}</p>}
                    <ul>
                      <li>Cantidad de Piezas: {product.cantidadPiezas}</li>
                      <li>Piezas por Pliego: {product.piezasPorPliego}</li>
                      <li>Merma: {product.merma || '0'}</li>
                      <li>Material: {product.material}</li>
                      <li>Laminado: {product.laminado || 'N/A'}</li>
                      {product.acabado1 && <li>Acabado 1: {product.acabado1} ({product.costoAcabado1})</li>}
                      {product.acabado2 && <li>Acabado 2: {product.acabado2} ({product.costoAcabado2})</li>}
                      {product.acabado3 && <li>Acabado 3: {product.acabado3} ({product.costoAcabado3})</li>}
                      {product.otroCosto && <li>Otro Costo: ${parseFloat(product.otroCosto).toFixed(2)} ({product.otroCostoDescripcion})</li>}
                      {product.envio && <li>Envío: {product.envio}</li>}
                      <li>Pliegos Totales: {product.pliegosTotales.toFixed(0)}</li>
                      <li>Costo Individual: <strong>${product.costoTotal.toFixed(2)}</strong></li>
                    </ul>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(product.id)} className="mt-2">Eliminar</Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-4 text-center">
            <h5>Resultados Generales de la Cotización:</h5>
            <p className="lead mb-1">Pliegos totales (incluyendo merma): <strong>{totalPliegosGeneral.toFixed(0)}</strong></p>
            <p className="lead">Costo total estimado: <strong>${totalCostoGeneral.toFixed(2)}</strong></p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CotizadorDigital;
