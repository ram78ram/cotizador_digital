import React, { useState, useRef, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Card, Row, Col, Image } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './App.css';

function App() {
  const [clientType, setClientType] = useState(''); // Nuevo estado para el tipo de cliente
  const [cliente, setCliente] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [cantidadPiezas, setCantidadPiezas] = useState('');
  const [piezasPorPliego, setPiezasPorPliego] = useState('');
  const [merma, setMerma] = useState('');
  const [material, setMaterial] = useState('');
  const [laminado, setLaminado] = useState('');
  const [acabado1, setAcabado1] = useState('');
  const [costoAcabado1, setCostoAcabado1] = useState('');
  const [acabado2, setAcabado2] = useState('');
  const [costoAcabado2, setCostoAcabado2] = useState('');
  const [acabado3, setAcabado3] = useState('');
  const [costoAcabado3, setCostoAcabado3] = useState('');
  const [otroCosto, setOtroCosto] = useState(''); // Estado para el valor numérico de 'Otro' costo
  const [otroCostoDescripcion, setOtroCostoDescripcion] = useState(''); // Nuevo estado para la descripción de 'Otro' costo
  const [envio, setEnvio] = useState('');

  const [pliegosTotales, setPliegosTotales] = useState(0);
  const [costoTotal, setCostoTotal] = useState(0);

  const cardRef = useRef(); // Referencia para la tarjeta que queremos convertir a PDF

  const materialesPublico = {
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
  };

  const materialesVIP = {
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
  };

  const costosAcabados = {
    'CORTE': [100, 200, 300],
    'PLECA': [100, 200, 300],
    'GRAPA': [200, 300, 500],
    'HOTMELT': [500, 800, 1200],
    'SUAJE': [400, 800, 1200],
  };

  const costosEnvio = {
    'Envío 1': 100,
    'Envío 2': 200,
    'Envío 3': 500,
  };

  const calcular = useCallback(() => {
    const numCantidadPiezas = parseFloat(cantidadPiezas);
    const numPiezasPorPliego = parseFloat(piezasPorPliego);
    const numMerma = parseFloat(merma);
    const numOtroCosto = parseFloat(otroCosto); // Obtener el valor de 'Otro' costo

    if (isNaN(numCantidadPiezas) || isNaN(numPiezasPorPliego) || numPiezasPorPliego === 0) {
      setPliegosTotales(0);
      setCostoTotal(0);
      return;
    }

    const pliegosBase = Math.ceil(numCantidadPiezas / numPiezasPorPliego);
    const totalPliegos = pliegosBase + (isNaN(numMerma) ? 0 : numMerma);
    setPliegosTotales(totalPliegos);

    // Seleccionar los precios de materiales según el tipo de cliente
    const currentMateriales = clientType === 'VIP' ? materialesVIP : materialesPublico;

    let costoMaterial = 0;
    if (material && currentMateriales[material]) {
      costoMaterial = totalPliegos * currentMateriales[material];
    }

    let costoLaminado = 0;
    if (laminado === 'FTE') {
      costoLaminado = totalPliegos * 5;
    } else if (laminado === 'FTE y VTA') {
      costoLaminado = totalPliegos * 9;
    } else if (laminado === 'Minimo') {
      costoLaminado = 700;
    }

    let costoAcabadosSum = 0;
    if (costoAcabado1) costoAcabadosSum += parseFloat(costoAcabado1);
    if (costoAcabado2) costoAcabadosSum += parseFloat(costoAcabado2);
    if (costoAcabado3) costoAcabadosSum += parseFloat(costoAcabado3);

    let costoEnvio = 0;
    if (envio && costosEnvio[envio]) {
      costoEnvio = costosEnvio[envio];
    }

    // Sumar el 'Otro' costo al total
    const totalCosto = costoMaterial + costoLaminado + costoAcabadosSum + costoEnvio + (isNaN(numOtroCosto) ? 0 : numOtroCosto);
    setCostoTotal(totalCosto);
  }, [cantidadPiezas, piezasPorPliego, merma, material, clientType, laminado, acabado1, costoAcabado1, acabado2, costoAcabado2, acabado3, costoAcabado3, otroCosto, envio]); // Dependencias de useCallback

  // useEffect para recalcular automáticamente cuando cambian las dependencias
  useEffect(() => {
    calcular();
  }, [calcular]); // Ahora solo depende de la función memorizada 'calcular'

  const handleDownloadPdf = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current, {
        scale: 2, // Aumenta la escala para mejor calidad
        useCORS: true, // Re-añadido para imágenes externas
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // Ancho A4 en mm
        const pageHeight = 297; // Alto A4 en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`cotizacion_${cliente || 'sin_cliente'}_${proyecto || 'sin_proyecto'}.pdf`);
      });
    } else {
      alert('No se pudo generar el PDF. Asegúrese de que la tarjeta de cotización esté visible.');
    }
  };

  return (
    <Container className="my-5">
      <Card ref={cardRef}> {/* Añadimos la referencia aquí */}
        <Card.Header className="text-center py-3 bg-primary text-white">
          <Image src="https://www.energrafica.com.mx/wp-content/uploads/2024/10/logo_energrafica.png" alt="Logo" fluid style={{ maxHeight: '80px', marginBottom: '10px' }} />
          <h3>Cotizador Digital</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Nuevo campo para Tipo de Cliente */}
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
                  <Form.Label>Cliente</Form.Label>
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
                  <Form.Label>Proyecto</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre del proyecto"
                    value={proyecto}
                    onChange={(e) => setProyecto(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Cantidad de Piezas</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Ingrese la cantidad de piezas"
                    value={cantidadPiezas}
                    onChange={(e) => setCantidadPiezas(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Piezas por Pliego</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Ingrese piezas por pliego"
                    value={piezasPorPliego}
                    onChange={(e) => setPiezasPorPliego(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Merma (Pliegos Extra)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Pliegos de merma"
                    value={merma}
                    onChange={(e) => setMerma(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Material</Form.Label>
              <Form.Select value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="">Seleccione un material</option>
                {/* Renderizar opciones de materiales según el tipo de cliente */}
                {Object.keys(clientType === 'VIP' ? materialesVIP : materialesPublico).map((mat) => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Laminado</Form.Label>
              <Form.Select value={laminado} onChange={(e) => setLaminado(e.target.value)}>
                <option value="">Sin laminado</option>
                <option value="FTE">Frente</option>
                <option value="FTE y VTA">Frente y Vuelta</option>
                <option value="Minimo">Mínimo</option>
              </Form.Select>
            </Form.Group>

            {[
              { acabado: acabado1, setAcabado: setAcabado1, costoAcabado: costoAcabado1, setCostoAcabado: setCostoAcabado1 },
              { acabado: acabado2, setAcabado: setAcabado2, costoAcabado: costoAcabado2, setCostoAcabado: setCostoAcabado2 },
              { acabado: acabado3, setAcabado: setAcabado3, costoAcabado: costoAcabado3, setCostoAcabado: setCostoAcabado3 },
            ].map((item, index) => (
              <Row className="mb-3" key={index}>
                <Col>
                  <Form.Group>
                    <Form.Label>Acabado {index + 1}</Form.Label>
                    <Form.Select
                      value={item.acabado}
                      onChange={(e) => {
                        item.setAcabado(e.target.value);
                        item.setCostoAcabado(''); // Reset cost when acabado type changes
                      }}
                    >
                      <option value="">Sin acabado</option>
                      {Object.keys(costosAcabados).map((acab) => (
                        <option key={acab} value={acab}>{acab}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  {item.acabado && costosAcabados[item.acabado] && (
                    <Form.Group>
                      <Form.Label>Costo Acabado {index + 1}</Form.Label>
                      <Form.Select
                        value={item.costoAcabado}
                        onChange={(e) => item.setCostoAcabado(e.target.value)}
                      >
                        <option value="">Seleccione costo</option>
                        {costosAcabados[item.acabado].map((costo) => (
                          <option key={costo} value={costo}>{costo}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}
                </Col>
              </Row>
            ))}

            {/* Nuevo campo para 'Otro' costo y su descripción */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Otro Costo (Valor)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Ingrese otro costo"
                    value={otroCosto}
                    onChange={(e) => setOtroCosto(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Otro Costo (Descripción)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Descripción del costo"
                    value={otroCostoDescripcion}
                    onChange={(e) => setOtroCostoDescripcion(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Envío</Form.Label>
              <Form.Select value={envio} onChange={(e) => setEnvio(e.target.value)}>
                <option value="">Sin envío</option>
                <option value="Envío 1">Envío 1 ($100)</option>
                <option value="Envío 2">Envío 2 ($200)</option>
                <option value="Envío 3">Envío 3 ($500)</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="secondary" onClick={handleDownloadPdf} className="mt-2">
                Descargar Cotización (PDF)
              </Button>
            </div>
          </Form>

          <div className="mt-4 text-center">
            <h5>Resultados:</h5>
            <p className="lead mb-1">Pliegos totales (incluyendo merma): <strong>{pliegosTotales.toFixed(0)}</strong></p>
            <p className="lead">Costo total estimado: <strong>${costoTotal.toFixed(2)}</strong></p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;