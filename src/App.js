import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Pagination } from 'react-bootstrap';

function App() {
  // se inicializa las variasbles
  const [formData, setFormData] = useState({
    modalidad: '',
    numero_contrato: '',
    regimen: '',
    archivo: null,
  });
  const [error, setError] = useState('');
  const [datos, setDatos] = useState([]);
  
  const [paginaActual, setPaginaActual] = useState(1); // Página actual para la paginación
  const [totalPaginas, setTotalPaginas] = useState(0);

  // Se utiliza para revisar la pagina actual
  useEffect(() => {  
    console.log("Página actual:", paginaActual);     
    fetchDatos(paginaActual);
  }, [paginaActual]);
  
  // Se muestra los datos que existan en la BD 
  const fetchDatos = async (page) => {        
    try {
      const response = await axios.get(`http://localhost:8000/api/contratos?page=${page}`);      
      console.log(response.data.data)
      const { data, current_page, last_page } = response.data;
      setDatos(data || []); 
      setPaginaActual(current_page);
      setTotalPaginas(last_page); 
      console.log(1);
    } catch (err) {
      setError('Error al cargar los contratos');
      console.error(err);
      //alert(err.message.errors)
    }
  };

  // En caso de que no este los datos completos no se muestra el intut para el archvo
  const isVisible =
    formData.numero_contrato !== "" &&
    formData.modalidad !== "" &&
    formData.regimen !== "";


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Validar si existe un archivo
    if (!selectedFile) {
      setError("No ha selecionado el archivo.");
      return;
    }

    // Validar tipo de archivo
    if (selectedFile.type !== "text/plain") {
      setError("Solo esta permito archivos tipo .txt.");
      return;
    }

     // Validar tamaño del archivo (ejemplo: máximo 1MB)
     const maxSize = 1 * 1024 * 1024; 
     if (selectedFile.size > maxSize) {
       setError("El archvio esta muy pesado solo esta permitido menos de  1MB.");
       return;
     }

      setFormData({ ...formData, archivo: e.target.files[0] });
      setError("");
  };
  // boton enviar
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validar numeros
    if (!/^\d+$/.test(formData.numero_contrato)) {
      setError('El número de contrato debe ser numérico.');
      return;
    }
    //validar cantidad de numeros
    if (formData.numero_contrato.value < 3 && formData.numero_contrato.value > 10) {
      setError('El numero debe estar entre 3 y 10.');
      return;
    }

    if (!formData.modalidad || !formData.numero_contrato || !formData.regimen ) {      
      setError('Por favor, complete todos los campos.');
      return;
    }

    setError('');

    const formDataToSend = new FormData();
    formDataToSend.append('modalidad', formData.modalidad);
    formDataToSend.append('numero_contrato', formData.numero_contrato);
    formDataToSend.append('regimen', formData.regimen);
    formDataToSend.append('archivo', formData.archivo);

    try {
      await axios.post('http://localhost:8000/api/contratos', formDataToSend);
       console.log(1);
        alert('Información guardada exitosamente.');
        
    } catch (err) {
      console.error(err);
      alert('Hubo un error al guardar la información.'+err);
    }

    
  };  
  // Adelante
  const handleSiguiente = (event) => {
    event.preventDefault();
    if (paginaActual < totalPaginas) {
      setPaginaActual((prev) => prev + 1); // Incrementa la página actual
    }
  };
  // Adelante
  const handleAnterior = (event) => {
    event.preventDefault();
    if (paginaActual > 1) {
      setPaginaActual((prev) => prev - 1); // Decrementa la página actual
    }
  };

  //revisar la descarga
  const handleDownload = (fileUrl) => {
    const link = document.createElement("a");
    link.href = fileUrl; // Establece la URL del archivo
    link.download = ""; 
    document.body.appendChild(link); // Agrega el enlace al DOM
    link.click();
    document.body.removeChild(link); // Elimina el enlace del DOM
  };
  return (
    <div className="container mt-5">
      <h1>Formulario de Contratos</h1>
      <form onSubmit={handleSubmit} className="mt-4" enctype="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Modalidad de contrato</label>
          <select
            name="modalidad"
            className="form-select"
            value={formData.modalidad}
            onChange={handleInputChange}
          >
            <option value="">Seleccione una opción</option>
            <option value="Evento">Evento</option>
            <option value="Cápita">Cápita</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Número de contrato</label>
          <input
            type="text"
            name="numero_contrato"
            className="form-control"
            value={formData.numero_contrato}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Régimen</label>
          <select
            name="regimen"
            className="form-select"
            value={formData.regimen}
            onChange={handleInputChange}
          >
            <option value="">Seleccione una opción</option>
            <option value="Contributivo">Contributivo</option>
            <option value="Subsidiado">Subsidiado</option>
          </select>
        </div>
        {isVisible && (
        <div className="mb-3" >
          <label className="form-label">Archivo</label>
          <input
            type="file"
            name="archivo"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>

      <h2 className="mt-5">Registros</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Modalidad</th>
            <th>Número de Contrato</th>
            <th>Régimen</th>

          </tr>
        </thead>
        <tbody>
        {datos.length > 0 ? (
            datos.map((item, index) => (
              <tr key={index}>
              <td>{item.id}</td> 
              <td>{item.modalidad}</td>
              <td>{item.numero_contrato}</td>
              <td>{item.regimen}</td>
              {/*              
              <td>
              {
               item.archivo_path ? (
                <button 
                    className="btn btn-primary"
                    onClick={() => handleDownload(item.archivo_path)}
                  >
                    Descargar
                  </button>
                ):(
                  <span>Sin archivo</span>
                )}
              </td>
              */}
              
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Paginación con Bootstrap */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-primary"
          onClick={handleAnterior}
          disabled={paginaActual === 1}
        >
          Anterior
        </button>
        <span>Página {paginaActual} de {totalPaginas}</span>
        <button
          className="btn btn-primary"
          onClick={handleSiguiente}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </button>
      </div>
      
    </div>
  );
}

export default App;