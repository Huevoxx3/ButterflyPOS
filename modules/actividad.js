import { obtenerVentaPorPedido } from "../js/services/ventasService.js";

import { obtenerJornadaActual } from "../js/services/cajaService.js";

import { db } from "../js/firebase.js";

import {

    collection,
    getDocs,
    query,
    where,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(){

    const contenido = document.getElementById("contenido");

    const jornada = await obtenerJornadaActual();

    const snapshot = await getDocs(

    query(

        collection(db,"actividad"),

        where("jornada","==",jornada),

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

    // ==========================
// MODAL DETALLE DE VENTA
// ==========================

if(!document.getElementById("modalDetalleVenta")){

    document.body.insertAdjacentHTML("beforeend",`

<div id="modalDetalleVenta" class="modal oculto">

    <div class="modal-contenido">

        <div id="contenidoDetalleVenta"></div>

        <br>

        <button
            id="btnCerrarDetalleVenta"
            class="btnRojo">

            Cerrar

        </button>

    </div>

</div>

`);

}
document.getElementById("btnCerrarDetalleVenta").onclick = ()=>{

    document
        .getElementById("modalDetalleVenta")
        .classList.add("oculto");

};

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

document.querySelectorAll(".btnDetalleVenta").forEach(boton=>{

    boton.onclick = async()=>{

        const pedidoId = boton.dataset.id;

        const venta = await obtenerVentaPorPedido(pedidoId);

const modal = document.getElementById("modalDetalleVenta");

const contenido = document.getElementById("contenidoDetalleVenta");

contenido.innerHTML = `

<h2>🧾 Detalle de Venta</h2>

<hr>

<p><strong>Mesa:</strong> ${venta.mesa}</p>

<p><strong>Mozo:</strong> ${venta.mozo}</p>

<p><strong>Medio de Pago:</strong> ${venta.medioPago}</p>

<p><strong>Total Cobrado:</strong> $${venta.totalCobrado.toLocaleString()}</p>

`;

contenido.innerHTML += `

<hr>

<h3>Productos</h3>

`;

venta.productos.forEach(producto=>{

    contenido.innerHTML += `

    <div class="detalleProducto">

        <h4>${producto.nombre}</h4>

        <p>

            Cantidad: <strong>${producto.cantidad}</strong>

        </p>

        <p>

            Precio: <strong>$${producto.precio.toLocaleString()}</strong>

        </p>

        ${
            producto.descuento > 0

            ?

            `

            <p style="color:#d97706;">

                <strong>🟠 DESCUENTO ${producto.descuento}%</strong>

            </p>

            <p>

                Motivo:

                ${producto.motivoDescuento}

            </p>

            `

            : ""

        }

        ${
            producto.invitado

            ?

            `

            <p style="color:#dc2626;">

                <strong>🔴 NO COBRADO</strong>

            </p>

            <p>

                Motivo:

                ${producto.motivoNoCobrar}

            </p>

            `

            : ""

        }

    </div>

    <hr>

    `;

});

if(venta.descuentoGeneral>0){

    contenido.innerHTML += `

    <h3>

        🟢 Descuento General

    </h3>

    <p>

        ${venta.descuentoGeneral} %

    </p>

    <p>

        Motivo:

        ${venta.motivo}

    </p>

    <hr>

    `;

}

modal.classList.remove("oculto");

    };

});

}

