import Grupo from "./Grupo.js";
import {
  Grid,
  html,
  h,
} from "../lib/gridjs/unpkg.com_gridjs@6.0.6_dist_gridjs.module.js";
const guardarGrupo = document.getElementById("guardarGrupo");
const modal = document.getElementById("modalGuardarGrupo");
const modalGuardarGrupo = new bootstrap.Modal(modal);

modal.addEventListener("hide.bs.modal", () => {
const formulario = document.getElementById("formularioGrupo");
document.getElementById("idGrupo").value = 0;
formulario.reset();
});

let tableGrupos = new Grid({
    columns: [
      {
        id: "nombre",
        name: "Nombre",
        sort: true,
      },
      {
        id: "acciones",
        name: "Acciones",
        width: "10%",
        sort: false,
        formatter: (cell, row) => {
          return h(
            "button",
            {
              className: "btn",
              onClick: () => {
                document.getElementById("nombre").value = row._cells[0].data; //le asigno la propiedad data al value
                document.getElementById("idGrupo").value = cell;
                modalGuardarGrupo.show();
              },
            },
            html('<i class="fa-regular fa-pen-to-square"></i>')
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
  }).render(document.getElementById("tablaGrupos"));


function loadTable(grupos) {
    grupos = grupos.map((grupo) => {
      return {
        nombre: grupo.nombre,
        acciones: grupo.id,
      };
    });
    tableGrupos.updateConfig({ data: grupos }).forceRender();
  }

document.addEventListener("DOMContentLoaded", function () {
    let gruposString = localStorage.getItem("grupos");
    if (gruposString) {
      let grupos = JSON.parse(gruposString);
      loadTable(grupos);
    }
  });

guardarGrupo.addEventListener("click", () => {
  let nombre = document.getElementById("nombre").value;
  let idGrupo = parseInt(document.getElementById("idGrupo").value);
  let gruposString = localStorage.getItem("grupos");
  let grupos = [];
  let grupo = new Grupo(idGrupo, nombre);
  let semillaGrupoString = localStorage.getItem("semillaGrupo"); //obtengo todos los id de mis alumnos
  if (gruposString) {
    grupos = JSON.parse(gruposString);
    if (grupo.id == 0) {
      let semillaGrupo = parseInt(semillaGrupoString) + 1;
      localStorage.setItem("semillaGrupo", semillaGrupo);
      grupo.id = semillaGrupo;
      grupos.push(grupo); //lo añado a mi arreglo
    } else {
      grupo = grupos.find((x) => x.id === idGrupo); //encuentro la primera coindidencia por ids, con nombre, apellido y edad
      grupo.nombre = nombre;
    }
  } else {
    if (semillaGrupoString) {
      //identifico si ya existe algo
      let semillaGrupo = parseInt(semillaGrupoString) + 1;
      localStorage.setItem("semillaGrupo", semillaGrupo);
      grupo.id = semillaGrupo;
      grupos.push(grupo);
    } else {
      //identifico si es por primera vez
      localStorage.setItem("semillaGrupo", 1);
      grupo.id = 1;
      grupos.push(grupo);
    }
  }
  localStorage.setItem("grupos", JSON.stringify(grupos));
  loadTable(grupos); //
  modalGuardarGrupo.hide();
});
