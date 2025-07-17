import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const CalculadoraPrecios = () => {
    const [precios, setPrecios] = useState({ normal: {}, vip: {} });
    const [items, setItems] = useState([]);
    const [nombreCliente, setNombreCliente] = useState('');
    const [tipoCliente, setTipoCliente] = useState('normal');
    const [material, setMaterial] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [ancho, setAncho] = useState('');
    const [alto, setAlto] = useState('');
    const [subtotalActual, setSubtotalActual] = useState(0);

    useEffect(() => {
        loadCSVAndInitialize();
    }, []);

    useEffect(() => {
        calcularSubtotal();
    }, [tipoCliente, material, cantidad, ancho, alto, precios]);

    const loadCSVAndInitialize = async () => {
        try {
            const response = await fetch('/precios.csv');
            const csvData = await response.text();
            parseCSV(csvData);
        } catch (error) {
            console.error('Error al cargar o procesar el archivo CSV:', error);
            alert('No se pudieron cargar los precios. Por favor, revisa el archivo precios.csv y la consola para más detalles.');
        }
    };

    const parseCSV = (csvData) => {
        const newPrecios = { normal: {}, vip: {} };
        const lineas = csvData.trim().split(/\r?\n/).slice(2); // Compatible con Windows y Unix
        lineas.forEach(linea => {
            const valores = linea.split(',');
            if (valores[0] && valores[1]) newPrecios.normal[valores[0].trim()] = parseFloat(valores[1].replace('$', '')) || 0;
            if (valores[3] && valores[4]) newPrecios.vip[valores[3].trim()] = parseFloat(valores[4].replace('$', '')) || 0;
        });
        setPrecios(newPrecios);
        if (Object.keys(newPrecios.normal).length > 0) {
            setMaterial(Object.keys(newPrecios.normal)[0]);
        }
    };

    const getPrecioActual = () => {
        return precios[tipoCliente][material] || 0;
    };

    const calcularSubtotal = () => {
        const precioM2 = getPrecioActual();
        const anchoCm = parseFloat(ancho);
        const altoCm = parseFloat(alto);
        const cant = parseInt(cantidad);
        if (isNaN(anchoCm) || isNaN(altoCm) || isNaN(cant) || anchoCm <= 0 || altoCm <= 0 || cant <= 0) {
            setSubtotalActual(0);
            return;
        }
        const subtotal = (anchoCm / 100) * (altoCm / 100) * precioM2 * cant;
        setSubtotalActual(subtotal);
    };

    const agregarItem = () => {
        const precioM2 = getPrecioActual();
        const anchoCm = parseFloat(ancho);
        const altoCm = parseFloat(alto);
        const cant = parseInt(cantidad);

        if (isNaN(anchoCm) || isNaN(altoCm) || isNaN(cant) || anchoCm <= 0 || altoCm <= 0 || cant <= 0) {
            alert('Por favor, ingresa valores válidos.');
            return;
        }

        const subtotal = (anchoCm / 100) * (altoCm / 100) * precioM2 * cant;
        setItems([...items, { material: material, ancho: anchoCm, alto: altoCm, cantidad: cant, precio: subtotal }]);
        limpiarFormulario();
    };

    const limpiarFormulario = () => {
        setAncho('');
        setAlto('');
        setCantidad(1);
        setSubtotalActual(0);
    };

    const guardarPDF = () => {
        // La lógica de impresión se mantiene similar, pero React maneja el estado
        const printClientNameEl = document.getElementById('print-client-name');
        if (nombreCliente) {
            printClientNameEl.innerHTML = `<strong>Cliente:</strong> ${nombreCliente}`;
        } else {
            printClientNameEl.innerHTML = '';
        }
        window.print();
    };

    const totalGeneral = items.reduce((acc, item) => acc + item.precio, 0);

    return (
        <Container style={styles.container}>
            <div style={styles.header}>
                <img src="https://www.energrafica.com.mx/wp-content/uploads/2024/10/logo_energrafica.png" alt="Logotipo" style={styles.logo} />
            </div>

            <div id="print-client-name" style={styles.printClientName}></div>

            <h1 style={styles.h1}>Calculadora de Precios</h1>

            <Form.Group className="mb-3">
                <Form.Label>Nombre del Cliente:</Form.Label>
                <Form.Control type="text" placeholder="Escribe el nombre aquí" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Tipo de Cliente:</Form.Label>
                <div style={styles.radioGroup}>
                    <Form.Check
                        inline
                        type="radio"
                        label="Normal"
                        name="tipoCliente"
                        id="clienteNormal"
                        value="normal"
                        checked={tipoCliente === 'normal'}
                        onChange={(e) => setTipoCliente(e.target.value)}
                    />
                    <Form.Check
                        inline
                        type="radio"
                        label="VIP"
                        name="tipoCliente"
                        id="clienteVip"
                        value="vip"
                        checked={tipoCliente === 'vip'}
                        onChange={(e) => setTipoCliente(e.target.value)}
                    />
                </div>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Material:</Form.Label>
                <Form.Select value={material} onChange={(e) => setMaterial(e.target.value)}>
                    {Object.keys(precios.normal).map((mat) => (
                        <option key={mat} value={mat}>
                            {mat.charAt(0).toUpperCase() + mat.slice(1)}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Row className="mb-3">
                <Col>
                    <Form.Group>
                        <Form.Label>Cantidad:</Form.Label>
                        <Form.Control type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>Ancho (cm):</Form.Label>
                        <Form.Control type="number" placeholder="Ej: 50" value={ancho} onChange={(e) => setAncho(e.target.value)} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>Alto (cm):</Form.Label>
                        <Form.Control type="number" placeholder="Ej: 80" value={alto} onChange={(e) => setAlto(e.target.value)} />
                    </Form.Group>
                </Col>
            </Row>

            <div style={styles.currentResult}>
                {subtotalActual > 0 && `Subtotal: ${subtotalActual.toFixed(2)}`}
            </div>

            <div style={styles.controls}>
                <Button variant="primary" onClick={agregarItem}>Agregar +</Button>
                <Button variant="secondary" onClick={limpiarFormulario}>Limpiar</Button>
            </div>

            <div style={styles.itemsList}>
                {items.map((item, index) => (
                    <div key={index} style={styles.listItem}>
                        <div style={styles.itemDetails}>
                            <strong>{item.cantidad} x {item.material.charAt(0).toUpperCase() + item.material.slice(1)}</strong><br />
                            <small>{item.ancho}cm x {item.alto}cm</small>
                        </div>
                        <span>{item.precio.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div style={styles.grandTotal}>
                {items.length > 0 && `Total: ${totalGeneral.toFixed(2)}`}
            </div>

            <div style={styles.exportSection}>
                <h2 style={styles.exportSectionH2}>Exportar Cotización</h2>
                <div style={styles.exportButtons}>
                    <Button variant="info" onClick={guardarPDF}>Guardar como PDF</Button>
                </div>
            </div>
        </Container>
    );
};

const styles = {
    container: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '90%',
        maxWidth: '500px',
        transition: 'background-color 0.3s',
        margin: '2rem auto', // Centrar el contenedor
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    logo: {
        height: '50px',
    },
    h1: {
        color: '#1c1e21',
        textAlign: 'center',
        margin: '0',
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
    },
    printClientName: {
        display: 'none',
    },
    radioGroup: {
        display: 'flex',
        gap: '1rem',
        padding: '0.5rem',
        backgroundColor: '#f0f2f5',
        borderRadius: '6px',
    },
    currentResult: {
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#e7f3ff',
        borderRadius: '6px',
        textAlign: 'center',
        fontWeight: '500',
        minHeight: '20px',
    },
    controls: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    itemsList: {
        marginTop: '1.5rem',
        borderTop: '1px solid #dddfe2',
        paddingTop: '1rem',
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem',
        borderRadius: '4px',
    },
    itemDetails: {
        flexGrow: '1',
    },
    grandTotal: {
        marginTop: '1rem',
        textAlign: 'right',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1c1e21',
    },
    exportSection: {
        marginTop: '2rem',
        borderTop: '1px solid #dddfe2',
        paddingTop: '1.5rem',
    },
    exportSectionH2: {
        textAlign: 'center',
        marginBottom: '1rem',
        color: '#606770',
    },
    exportButtons: {
        display: 'flex',
        gap: '1rem',
    },
};

export default CalculadoraPrecios;
