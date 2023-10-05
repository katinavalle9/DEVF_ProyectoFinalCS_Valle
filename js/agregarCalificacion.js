function agregarCalificacion(input) {
  if (input.value != "") {
    const idAlumno = parseInt(input.dataset.idalumno);
    const idMateria = parseInt(input.dataset.idmateria);
    let datosString = localStorage.getItem("alumnoMateria");
    let datos = JSON.parse(datosString);
    let dato = datos.find(
      (x) => x.idAlumno == idAlumno && x.idMateria == idMateria
    );
    dato.calificacion = parseInt(input.value);
    localStorage.setItem("alumnoMateria", JSON.stringify(datos));
  }
}

function soloNumeros(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
  const valor = parseInt(input.value);
  if (isNaN(valor) || valor < 0 || valor > 10) {
    input.value = input.value.slice(0, -1);
  }
}
