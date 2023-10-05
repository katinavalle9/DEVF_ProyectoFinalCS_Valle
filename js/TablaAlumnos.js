import Alumno from "./Alumno.js";
import Materia from "./Materia.js";
import AlumnoMateria from "./Alumno-Mat.js";
import {
  Grid,
  html,
  h,
  createElement,
} from "../lib/gridjs/unpkg.com_gridjs@6.0.6_dist_gridjs.module.js";

const guardarAlumno = document.getElementById("guardarAlumno");
const modal = document.getElementById("modalGuardarAlumno");
const selectElement = document.getElementById("grupo");
const modalGuardarAlumno = new bootstrap.Modal(modal);
let selectBox;
let selectMateria;
let selectMaterias = document.getElementById("materia");
let selectBoton = document.getElementById("selectMateriasAsignar");
let bntAgregar = document.getElementById("bntAgregar");

modal.addEventListener("hide.bs.modal", () => {
  const formulario = document.getElementById("formularioAlumno");
  let idAlumnoInput = document.getElementById("idAlumno");
  let alumnosMateriasString = localStorage.getItem("alumnoMateria");
  let semillaAlumnoString = localStorage.getItem("semillaAlumno");
  if (parseInt(idAlumnoInput.value) == 0 && alumnosMateriasString) {
    let idAlumno;
    if (semillaAlumnoString) {
      let semillaAlumno = parseInt(semillaAlumnoString);
      idAlumno = semillaAlumno + 1;
    } else {
      idAlumno = 1;
    }
    let alumnosMaterias = JSON.parse(alumnosMateriasString);
    alumnosMaterias = alumnosMaterias.filter(
      (x) => x.idAlumno != parseInt(idAlumno)
    );
    if (alumnosMaterias.length > 0) {
      localStorage.setItem("alumnoMateria", JSON.stringify(alumnosMaterias));
    } else {
      localStorage.removeItem("alumnoMateria");
    }
  }
  idAlumnoInput.value = 0;
  selectBox.setValue("");
  selectMateria.setValue("");
  loadTableMaterias(0);
  formulario.reset();
});

let tableAlumnos = new Grid({
  columns: [
    {
      id: "nombre",
      name: "Nombre",
      sort: true,
    },
    {
      id: "apellido",
      name: "Apellido",
      sort: true,
    },
    {
      id: "edad",
      name: "Edad",
      sort: true,
    },
    {
      id: "promedio",
      name: "Promedio",
      width: "10%",
      sort: true,
    },
    {
      id: "grupo",
      name: "Grupo",
      sort: true,
    },
    {
      id: "acciones",
      name: "Editar",
      width: "10%",
      sort: false,
      formatter: (cell, row) => {
        return h(
          "button",
          {
            className: "btn",
            onClick: () => {
              document.getElementById("nombre").value = row._cells[0].data; //le asigno la propiedad data al value
              document.getElementById("apellido").value = row._cells[1].data;
              document.getElementById("edad").value = row._cells[2].data;
              document.getElementById("grupo").value = row._cells[3].data;
              document.getElementById("idAlumno").value = cell;
              loadTableMaterias(cell);
              modalGuardarAlumno.show();
            },
          },
          html('<i class="fa-regular fa-pen-to-square"></i>')
        );
      },
    },
    {
      id: "acciones",
      name: "Eliminar",
      width: "10%",
      sort: false,
      formatter: (cell) => {
        return h(
          "button",
          {
            className: "btn",
            onClick: () => {
              Swal.fire({
                title: "¿Esta seguro que desea eliminar este alumno?",
                showCancelButton: true,
                confirmButtonText: "Eliminar",
                cancelButtonText: "Cancelar",
              }).then((result) => {
                if (result.isConfirmed) {
                  eliminarAlumno(cell);
                  Swal.fire("Se ha eliminado el alumno!", "", "Elimanado");
                }
              });
            },
          },
          html('<i class="fa-regular fa-trash-can"></i>')
        );
      },
    },
  ],
  data: [],
  search: true,
  pagination: {
    limit: 10,
    summary: false,
  },
  language: {
    search: {
      placeholder: "🔍 Buscar...",
    },
    pagination: {
      previous: "⬅️",
      next: "➡️",
    },
  },
}).render(document.getElementById("tablaAlumnos")); //termina de renderizar tabla alumno

function loadTable(alumnos) {
  let gruposString = localStorage.getItem("grupos");
  let grupos = JSON.parse(gruposString) || [];
  let alumnoMateriaString = localStorage.getItem("alumnoMateria");
  let alumnoMateria = JSON.parse(alumnoMateriaString) || [];
  alumnos = alumnos.map((alumno) => {
    let grupo = grupos.find((grupo) => grupo.id == alumno.idGrupo);
    let calificacionAlumno = alumnoMateria.find(
      (calificacion) => calificacion.idAlumno == alumno.id //pongo la calificacion por cada alumno
    );
    return {
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      edad: alumno.edad,
      promedio: 0,
      grupo: grupo != undefined ? grupo.nombre : "",
      acciones: alumno.id,
    };
  });
  alumnos.forEach((alumno) => {
    let calificaciones = alumnoMateria.filter(
      (calificacion) => calificacion.idAlumno == alumno.acciones
    );
    console.log(calificaciones);

    let calificacionesValidas = calificaciones.filter(
      (calificacion) =>
        calificacion.calificacion >= 0 && calificacion.calificacion <= 10
    );
    console.log(calificacionesValidas);

    let sumaCalificaciones = calificacionesValidas.reduce(
      (total, calificacion) => total + calificacion.calificacion,
      0
    );
    console.log(sumaCalificaciones);

    let promedio =
      calificacionesValidas.length > 0
        ? sumaCalificaciones / calificacionesValidas.length
        : 0;
    alumno.promedio = promedio;
  });
  tableAlumnos.updateConfig({ data: alumnos }).forceRender();
}

let tableMaterias = new Grid({
  columns: [
    {
      id: "nombre",
      name: "Materia",
    },
    {
      id: "calificacion",
      name: "Calificación",
      formatter: (cell) => {
        return html(
          `<input onchange="agregarCalificacion(this)" oninput="soloNumeros(this)" class="form-control" data-idAlumno="${cell.idAlumno}" data-idMateria="${cell.idMateria}" value="${cell.calificacion}"/>`
        );
      },
    },
  ],
  data: [],
  search: true,
  pagination: {
    limit: 5,
    summary: false,
  },
  language: {
    search: {
      placeholder: "🔍 Buscar...",
    },
    pagination: {
      previous: "⬅️",
      next: "➡️",
    },
  },
}).render(document.getElementById("tablaMaterias"));

function loadTableMaterias(id) {
  let alumnosMateriasString = localStorage.getItem("alumnoMateria");
  if (alumnosMateriasString) {
    let alumnosMaterias = JSON.parse(alumnosMateriasString);
    alumnosMaterias = alumnosMaterias.filter((x) => x.idAlumno == id);
    let materiasString = localStorage.getItem("materias");
    let materias = JSON.parse(materiasString);
    let materiasAlumnos = alumnosMaterias.map((alumnoMateria) => {
      return {
        nombre: materias.find((x) => x.id == alumnoMateria.idMateria).nombre,
        calificacion: {
          calificacion: alumnoMateria.calificacion,
          idAlumno: alumnoMateria.idAlumno,
          idMateria: alumnoMateria.idMateria,
        },
      };
    });
    tableMaterias.updateConfig({ data: materiasAlumnos }).forceRender();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  let alumnosString = localStorage.getItem("alumnos");
  if (alumnosString) {
    let alumnos = JSON.parse(alumnosString);
    loadTable(alumnos);
  }
  opcionesSelect();
  opcionesMateriasSelect();
});

function eliminarAlumno(id) {
  let alumnosString = localStorage.getItem("alumnos");
  let alumnos = JSON.parse(alumnosString);
  if (alumnos.length == 1) {
    localStorage.removeItem("alumnos");
    tableAlumnos.updateConfig({ data: [] }).forceRender();
  } else {
    alumnos = alumnos.filter((alumno) => alumno.id !== id);
    localStorage.setItem("alumnos", JSON.stringify(alumnos));
    loadTable(alumnos);
  }
}

guardarAlumno.addEventListener("click", () => {
  let nombre = document.getElementById("nombre").value;
  let apellido = document.getElementById("apellido").value;
  let edad = document.getElementById("edad").value;
  let idAlumno = parseInt(document.getElementById("idAlumno").value);
  let alumnosString = localStorage.getItem("alumnos");
  let idGrupo = selectBox.getResult()[0];
  let alumnos = [];
  let alumno = new Alumno(idAlumno, nombre, apellido, edad, idGrupo);
  let semillaAlumnoString = localStorage.getItem("semillaAlumno"); //obtengo todos los id de mis alumnos
  if (alumnosString) {
    alumnos = JSON.parse(alumnosString);
    if (alumno.id == 0) {
      let semillaAlumno = parseInt(semillaAlumnoString) + 1;
      localStorage.setItem("semillaAlumno", semillaAlumno);
      alumno.id = semillaAlumno;
      alumnos.push(alumno); //lo añado a mi ls
    } else {
      alumno = alumnos.find((x) => x.id === idAlumno); //encuentro la primera coindidencia por ids, con nombre, apellido y edad
      alumno.nombre = nombre;
      alumno.apellido = apellido;
      alumno.edad = edad;
    }
  } else {
    if (semillaAlumnoString) {
      //identifico si es una edicion
      let semillaAlumno = parseInt(semillaAlumnoString) + 1;
      localStorage.setItem("semillaAlumno", semillaAlumno);
      alumno.id = semillaAlumno;
      alumnos.push(alumno);
    } else {
      //identifico si es por primera vez
      localStorage.setItem("semillaAlumno", 1);
      alumno.id = 1;
      alumnos.push(alumno);
    }
  }
  localStorage.setItem("alumnos", JSON.stringify(alumnos));
  loadTable(alumnos);
  modalGuardarAlumno.hide();
});

function opcionesSelect() {
  let opciones = localStorage.getItem("grupos");
  if (opciones) {
    let grupos = JSON.parse(opciones);
    grupos.forEach((grupo) => {
      const nuevaOpcion = document.createElement("option");
      nuevaOpcion.value = grupo.id;
      nuevaOpcion.text = grupo.nombre;
      selectElement.appendChild(nuevaOpcion);
    });
  }
  selectBox = new vanillaSelectBox("#grupo", {
    maxHeight: 200,
    search: true,
  });
}

function opcionesMateriasSelect() {
  let opciones = localStorage.getItem("materias");
  if (opciones) {
    selectBoton.style.display = "block";
    let materias = JSON.parse(opciones);
    materias.forEach((materia) => {
      const nuevaOpcion = document.createElement("option");
      nuevaOpcion.value = materia.id;
      nuevaOpcion.text = materia.nombre;
      selectMaterias.appendChild(nuevaOpcion);
    });
  }
  selectMateria = new vanillaSelectBox("#materia", {
    maxHeight: 200,
    search: true,
  });
}

bntAgregar.addEventListener("click", () => {
  let alumnosMateriasString = localStorage.getItem("alumnoMateria");
  let semillaAlumnoMateriasString = localStorage.getItem(
    "semillaAlumnoMateria"
  );
  let idMateria = selectMateria.getResult()[0]; // obtener el id de la materia en el select
  let idAlumno = parseInt(document.getElementById("idAlumno").value);
  let semillaAlumnoString = localStorage.getItem("semillaAlumno");
  let alumnosMaterias = [];
  if (idAlumno == 0) {
    if (semillaAlumnoString) {
      let semillaAlumno = parseInt(semillaAlumnoString);
      idAlumno = semillaAlumno + 1;
    } else {
      idAlumno = 1;
    }
  }
  if (alumnosMateriasString && idMateria != "") {
    alumnosMaterias = JSON.parse(alumnosMateriasString);
    idMateria = parseInt(idMateria);
    let alumnoMateria = alumnosMaterias.find(
      (x) => x.idMateria == idMateria && x.idAlumno == idAlumno
    );
    if (alumnoMateria == undefined) {
      let semillaAlumnoMaterias = parseInt(semillaAlumnoMateriasString);
      alumnoMateria = new AlumnoMateria(
        semillaAlumnoMaterias,
        idAlumno,
        idMateria,
        0
      );
      alumnosMaterias.push(alumnoMateria);
      localStorage.setItem("alumnoMateria", JSON.stringify(alumnosMaterias));
    }
  } else if (idMateria != "") {
    idMateria = parseInt(idMateria);
    if (semillaAlumnoMateriasString) {
      let semillaAlumnoMateria = parseInt(semillaAlumnoMateriasString) + 1;
      let alumnoMateria = new AlumnoMateria(
        semillaAlumnoMateria,
        idAlumno,
        idMateria,
        0
      );
      alumnosMaterias.push(alumnoMateria);
      localStorage.setItem("alumnoMateria", JSON.stringify(alumnosMaterias));
      localStorage.setItem("semillaAlumnoMateria", semillaAlumnoMateria);
    } else {
      let alumnoMateria = new AlumnoMateria(1, idAlumno, idMateria, 0);
      alumnosMaterias.push(alumnoMateria);
      localStorage.setItem("alumnoMateria", JSON.stringify(alumnosMaterias));
      localStorage.setItem("semillaAlumnoMateria", 1);
    }
  }
  loadTableMaterias(idAlumno);
});
