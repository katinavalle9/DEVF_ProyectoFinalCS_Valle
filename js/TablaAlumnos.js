import Alumno from "./Alumno.js";
import {
  Grid,
  html,
  h,
} from "../lib/gridjs/unpkg.com_gridjs@6.0.6_dist_gridjs.module.js";
const guardarAlumno = document.getElementById("guardarAlumno");
const modal = document.getElementById("modalGuardarAlumno");
const modalGuardarAlumno = new bootstrap.Modal(modal);

modal.addEventListener("hide.bs.modal", () => {
  const formulario = document.getElementById("formularioAlumno");
  document.getElementById("idAlumno").value = 0;
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
              document.getElementById("idAlumno").value = cell;
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
                title: '¿Esta seguro que desea eliminar este alumno?',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar',
              }).then((result) => {
                if (result.isConfirmed) {
                  eliminarAlumno(cell);
                  Swal.fire('Se ha eliminado el alumno!', '', 'Elimanado')
                }
              })
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
}).render(document.getElementById("tablaAlumnos"));

function loadTable(alumnos) {
  alumnos = alumnos.map((alumno) => {
    return {
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      edad: alumno.edad,
      acciones: alumno.id,
    };
  });
  tableAlumnos.updateConfig({ data: alumnos }).forceRender();
}

document.addEventListener("DOMContentLoaded", function () {
  let alumnosString = localStorage.getItem("alumnos");
  if (alumnosString) {
    let alumnos = JSON.parse(alumnosString);
    loadTable(alumnos);
  }
});

function eliminarAlumno(id) {
  let alumnosString = localStorage.getItem("alumnos");
  let alumnos = JSON.parse(alumnosString);
  if(alumnos.length == 1){
    localStorage.removeItem("alumnos")
    tableAlumnos.updateConfig({ data: [] }).forceRender();
  }else{
    alumnos = alumnos.filter((alumno)=> alumno.id !== id);
    loadTable(alumnos);
  }
  localStorage.setItem("alumnos",JSON.stringify(alumnos))
  console.log(alumnos)
}

guardarAlumno.addEventListener("click", () => {
  let nombre = document.getElementById("nombre").value;
  let apellido = document.getElementById("apellido").value;
  let edad = document.getElementById("edad").value;
  let idAlumno = parseInt(document.getElementById("idAlumno").value);
  let alumnosString = localStorage.getItem("alumnos");
  let alumnos = [];
  let alumno = new Alumno(idAlumno, nombre, apellido, edad);
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
  loadTable(alumnos); //
  modalGuardarAlumno.hide();
});

