import { db } from "../js/firebase.js";

import {

    collection,
    getDocs,
    query,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(){

    const contenido = document.getElementById("contenido");

    const snapshot = await getDocs(

        query(

            collection(db,"actividad"),

            orderBy("fecha","desc")

        )

    );

let html = `

<h1>

📋 Actividad del Sistema

</h1>

<div class="barraActividad">

<input
    type="text"
    id="buscarActividad"
    placeholder="🔍 Buscar actividad...">

</div>

<div class="panelActividad">

<table class="tablaActividad">

<thead>

<tr>

<th>Fecha</th>

<th>Hora</th>

<th>Usuario</th>

<th>Módulo</th>

<th>Acción</th>

<th>Descripción</th>

<th>Detalle</th>

</tr>

</thead>

<tbody>

`;

    snapshot.forEach(documento=>{

        const actividad = documento.data();

        const fecha = actividad.fecha?.toDate
            ? actividad.fecha.toDate()
            : null;

        html += `

<tr>

<td class="colFecha">

${fecha
    ? fecha.toLocaleDateString("es-AR")
    : "-"}

</td>

<td class="colHora">

${fecha
    ? fecha.toLocaleTimeString("es-AR",{
        hour:"2-digit",
        minute:"2-digit"
    })
    : "-"}

</td>

<td class="colUsuario">

${actividad.usuario || "-"}

</td>

<td class="colModulo">

${actividad.modulo || "-"}

</td>

<td class="colAccion">

${actividad.accion || "-"}

</td>

<td>

${actividad.descripcion || "-"}

</td>

<td>

${
    actividad.modulo === "Cobro"

    ? `<button
            class="btnAzul btnDetalleVenta"

            data-id="${actividad.pedidoId || ""}">

            👁

       </button>`

    : "-"

}

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

</div>

`;

    contenido.innerHTML = html;

    const buscador = document.getElementById("buscarActividad");

buscador.oninput = () => {

    const texto = buscador.value.toLowerCase();

    document
        .querySelectorAll(".tablaActividad tbody tr")
        .forEach(fila=>{

            fila.style.display =
                fila.textContent
                    .toLowerCase()
                    .includes(texto)

                ? ""

                : "none";

        });

};

}