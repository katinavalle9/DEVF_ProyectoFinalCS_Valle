import Materia from "./Materia.js";
import {
  Grid,
  html,
  h,
} from "../lib/gridjs/unpkg.com_gridjs@6.0.6_dist_gridjs.module.js";
const guardarMateria = document.getElementById("guardarMateria");
const modal = document.getElementById("modalGuardarMateria");
const modalGuardarMateria = new bootstrap.Modal(modal);

modal.addEventListener("hide.bs.modal", () => {
    const formulario = document.getElementById("formularioMateria");
    document.getElementById("idMateria").value = 0;
    formulario.reset();
    });

let tableMaterias = new Grid({
    columns: [
      {
        id: "nombre",
        name: "Nombre",
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
                document.getElementById("idMateria").value = cell;
                modalGuardarMateria.show();
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
                  title: "¿Esta seguro que desea eliminar esta materia?",
                  showCancelButton: true,
                  confirmButtonText: "Eliminar",
                  cancelButtonText: "Cancelar",
                }).then((result) => {
                  if (result.isConfirmed) {
                    eliminarMateria(cell);
                    Swal.fire("Se ha eliminado la materia!", "", "Elimanado");
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
      limit: 3,
      summary: false
    },
    language: {
      search: {
        placeholder: "🔍 Buscar...",
      },
      pagination: {
        previous: '⬅️',
        next: '➡️'
      }
    }
  }).render(document.getElementById("tablaMaterias"));

function loadTable(materias) {
  materias = materias.map((materia) => {
    return {
      nombre: materia.nombre,
      acciones: materia.id,
    };
  });
  tableMaterias.updateConfig({ data: materias }).forceRender();
}

document.addEventListener("DOMContentLoaded", function () {
  let materiasString = localStorage.getItem("materias");
  if (materiasString) {
    let materias = JSON.parse(materiasString);
    loadTable(materias);
  }
});

function eliminarMateria(id) {
  let materiasString = localStorage.getItem("materias");
  let materias = JSON.parse(materiasString);
  if (materias.length == 1) {
    localStorage.removeItem("materias");
    tableMaterias.updateConfig({ data: [] }).forceRender();
  } else {
    materias = materias.filter((materia) => materia.id !== id);
    localStorage.setItem("materias", JSON.stringify(materias));
    loadTable(materias);
  }
}


guardarMateria.addEventListener("click", () => {
  let nombre = document.getElementById("nombre").value;
  let idMateria = parseInt(document.getElementById("idMateria").value);
  let materiasString = localStorage.getItem("materias");
  let materias = [];
  let materia = new Materia(idMateria, nombre);
  let semillaMateriaString = localStorage.getItem("semillaMateria"); //obtengo todos los id de mis alumnos
  if (materiasString) {
    materias = JSON.parse(materiasString);
    if (materia.id == 0) {
      let semillaMateria = parseInt(semillaMateriaString) + 1;
      localStorage.setItem("semillaMateria", semillaMateria);
      materia.id = semillaMateria;
      materias.push(materia); //lo añado a mi arreglo
    } else {
      materia = materias.find((x) => x.id === idMateria); //encuentro la primera coindidencia por ids, con nombre, apellido y edad
      materia.nombre = nombre;
    }
  } else {
    if (semillaMateriaString) {
      //identifico si ya existe algo
      let semillaMateria = parseInt(semillaMateriaString) + 1;
      localStorage.setItem("semillaMateria", semillaMateria);
      materia.id = semillaMateria;
      materias.push(materia);
    } else {
      //identifico si es por primera vez
      localStorage.setItem("semillaMateria", 1);
      materia.id = 1;
      materias.push(materia);
    }
  }
  localStorage.setItem("materias", JSON.stringify(materias));
  loadTable(materias); //
  modalGuardarMateria.hide();
});
