import React, { useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const calcularCostos = (productData, clientType, materialesPublico, materialesVIP, costosAcabados, costosEnvio) => {
  const numCantidadPiezas = parseFloat(productData.cantidadPiezas);
  const numPiezasPorPliego = parseFloat(productData.piezasPorPliego);
  const numMerma = parseFloat(productData.merma);
  const numOtroCosto = parseFloat(productData.otroCosto);

  if (isNaN(numCantidadPiezas) || isNaN(numPiezasPorPliego) || numPiezasPorPliego === 0) {
    return { pliegosTotales: 0, costoTotal: 0 };
  }

  const pliegosBase = Math.ceil(numCantidadPiezas / numPiezasPorPliego);
  const totalPliegos = pliegosBase + (isNaN(numMerma) ? 0 : numMerma);

  const currentMateriales = clientType === 'VIP' ? materialesVIP : materialesPublico;

  let costoMaterial = 0;
  if (productData.material && currentMateriales[productData.material]) {
    costoMaterial = totalPliegos * currentMateriales[productData.material];
  }

  let costoLaminado = 0;
  if (productData.laminado === 'FTE') {
    costoLaminado = totalPliegos * 5;
  } else if (productData.laminado === 'FTE y VTA') {
    costoLaminado = totalPliegos * 9;
  } else if (productData.laminado === 'Minimo') {
    costoLaminado = 700;
  }

  let costoAcabadosSum = 0;
  if (productData.costoAcabado1) costoAcabadosSum += parseFloat(productData.costoAcabado1);
  if (productData.costoAcabado2) costoAcabadosSum += parseFloat(productData.costoAcabado2);
  if (productData.costoAcabado3) costoAcabadosSum += parseFloat(productData.costoAcabado3);

  let costoEnvioVal = 0;
  if (productData.envio && costosEnvio[productData.envio]) {
    costoEnvioVal = costosEnvio[productData.envio];
  }

  const totalCosto = costoMaterial + costoLaminado + costoAcabadosSum + costoEnvioVal + (isNaN(numOtroCosto) ? 0 : numOtroCosto);
  
  return { pliegosTotales: totalPliegos, costoTotal: totalCosto };
};

function ProductForm({ product, onProductChange, clientType, materialesPublico, materialesVIP, costosAcabados, costosEnvio }) {

  const handleChange = useCallback((updatedProductData) => {
    const { pliegosTotales, costoTotal } = calcularCostos(updatedProductData, clientType, materialesPublico, materialesVIP, costosAcabados, costosEnvio);
    onProductChange({
      ...updatedProductData,
      pliegosTotales,
      costoTotal,
    });
  }, [clientType, materialesPublico, materialesVIP, costosAcabados, costosEnvio, onProductChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange({ ...product, [name]: value });
  };

  const handleAcabadoTypeChange = (e, acabadoName, costoAcabadoName) => {
    const value = e.target.value;
    handleChange({ ...product, [acabadoName]: value, [costoAcabadoName]: '' });
  };

  return (
    <>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Cantidad de Piezas</Form.Label>
            <Form.Control type="number" name="cantidadPiezas" placeholder="Ingrese la cantidad de piezas" value={product.cantidadPiezas} onChange={handleInputChange} />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Piezas por Pliego</Form.Label>
            <Form.Control type="number" name="piezasPorPliego" placeholder="Ingrese piezas por pliego" value={product.piezasPorPliego} onChange={handleInputChange} />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Merma (Pliegos Extra)</Form.Label>
            <Form.Control type="number" name="merma" placeholder="Pliegos de merma" value={product.merma} onChange={handleInputChange} />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Material</Form.Label>
        <Form.Select name="material" value={product.material} onChange={handleInputChange}>
          <option value="">Seleccione un material</option>
          {Object.keys(clientType === 'VIP' ? materialesVIP : materialesPublico).map((mat) => (
            <option key={mat} value={mat}>{mat}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Laminado</Form.Label>
        <Form.Select name="laminado" value={product.laminado} onChange={handleInputChange}>
          <option value="">Sin laminado</option>
          <option value="FTE">Frente</option>
          <option value="FTE y VTA">Frente y Vuelta</option>
          <option value="Minimo">Mínimo</option>
        </Form.Select>
      </Form.Group>

      {[
        { name: 'acabado1', label: 'Acabado 1', value: product.acabado1, costoValue: product.costoAcabado1, costoName: 'costoAcabado1' },
        { name: 'acabado2', label: 'Acabado 2', value: product.acabado2, costoValue: product.costoAcabado2, costoName: 'costoAcabado2' },
        { name: 'acabado3', label: 'Acabado 3', value: product.acabado3, costoValue: product.costoAcabado3, costoName: 'costoAcabado3' },
      ].map((item, index) => (
        <Row className="mb-3" key={index}>
          <Col>
            <Form.Group>
              <Form.Label>{item.label}</Form.Label>
              <Form.Select name={item.name} value={item.value} onChange={(e) => handleAcabadoTypeChange(e, item.name, item.costoName)}>
                <option value="">Sin acabado</option>
                {Object.keys(costosAcabados).map((acab) => (
                  <option key={acab} value={acab}>{acab}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            {item.value && (
              <Form.Group>
                <Form.Label>Costo {item.label}</Form.Label>
                <Form.Control
                  type="number"
                  name={item.costoName}
                  placeholder="Costo"
                  value={item.costoValue}
                  onChange={handleInputChange}
                  className={item.value && item.costoValue === '' ? 'is-invalid' : ''} // Resaltar si se ha seleccionado un acabado pero el costo está vacío
                />
              </Form.Group>
            )}
          </Col>
        </Row>
      ))}

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Otro Costo (Descripción)</Form.Label>
            <Form.Control type="text" name="otroCostoDescripcion" placeholder="Descripción del costo" value={product.otroCostoDescripcion} onChange={handleInputChange} />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Otro Costo (Valor)</Form.Label>
            <Form.Control type="number" name="otroCosto" placeholder="Ingrese otro costo" value={product.otroCosto} onChange={handleInputChange} />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Envío</Form.Label>
        <Form.Select name="envio" value={product.envio} onChange={handleInputChange}>
          <option value="">Sin envío</option>
          <option value="Envío 1">Envío 1 ($100)</option>
          <option value="Envío 2">Envío 2 ($200)</option>
          <option value="Envío 3">Envío 3 ($500)</option>
        </Form.Select>
      </Form.Group>
    </>
  );
}

export default ProductForm;
