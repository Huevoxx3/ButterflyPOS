import { db } from "../js/firebase.js";

import {

    collection,
    getDocs,
    query,
    orderBy,
    doc,
    getDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let cierreAbierto = null;

export default async function(){

    const contenido = document.getElementById("contenido");

    const snapshot = await getDocs(

        query(

            collection(db,"cierresCaja"),

            orderBy("cierre","desc")

        )

    );

    let html = `

<h1>

📒 Historial de Caja

</h1>

<div class="contenedorHistorial">

<div class="panelHistorial">

<table class="tablaHistorial">

<thead>

<tr>

<th>Jornada</th>

<th>Apertura</th>

<th>Cierre</th>

<th>Ventas</th>

<th>Total</th>

<th>Estado</th>

<th>Acción</th>

</tr>

</thead>

<tbody>

`;

    snapshot.forEach(documento => {

        const cierre = documento.data();

        const apertura = cierre.apertura?.toDate
            ? cierre.apertura.toDate().toLocaleTimeString("es-AR",{
                hour:"2-digit",
                minute:"2-digit"
            })
            : "-";

        const horaCierre = cierre.cierre?.toDate
            ? cierre.cierre.toDate().toLocaleTimeString("es-AR",{
                hour:"2-digit",
                minute:"2-digit"
            })
            : "-";

        html += `

<tr>

<td>

${cierre.jornada.split("-").reverse().join("/")}

</td>

<td>

${apertura}

</td>

<td>

${horaCierre}

</td>

<td>

${cierre.cantidadVentas}

</td>

<td>

$ ${Number(cierre.total).toLocaleString()}

</td>

<td>

<span class="estadoCerrada">

CERRADA

</span>

</td>

<td>

<button

class="btnAzul btnVerDetalle"

data-id="${documento.id}">

👁 Ver detalle

</button>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

</div>

<div

id="panelDetalleHistorial"

class="panelDetalle">

<h2>

Seleccione una jornada

</h2>

<p>

Presione <strong>👁 Ver detalle</strong>

para visualizar la información.

</p>

</div>

</div>

`;

    contenido.innerHTML = html;

    document.querySelectorAll(".btnVerDetalle").forEach(boton => {

        boton.onclick = async () => {

            if(cierreAbierto === boton.dataset.id){

    document.getElementById("panelDetalleHistorial").innerHTML = `

        <h2>

        Seleccione una jornada

        </h2>

        <p>

        Presione <strong>👁 Ver detalle</strong>
        para visualizar la información.

        </p>

    `;

    cierreAbierto = null;

    return;

}

cierreAbierto = boton.dataset.id;

            const documento = await getDoc(

                doc(db,"cierresCaja",boton.dataset.id)

            );

            const cierre = documento.data();

document.getElementById("panelDetalleHistorial").innerHTML = `

<h2>

📅 Jornada ${cierre.jornada.split("-").reverse().join("/")}

</h2>

<hr>

<div class="filaDetalle">

<span>💰 Total</span>

<strong>$ ${Number(cierre.total).toLocaleString()}</strong>

</div>

<div class="filaDetalle">

<span>🧾 Ventas</span>

<strong>${cierre.cantidadVentas}</strong>

</div>

<div class="filaDetalle">

<span>🍽 Productos</span>

<strong>${cierre.productosVendidos}</strong>

</div>

<div class="filaDetalle">

<span>📈 Ticket Promedio</span>

<strong>$ ${Number(cierre.ticketPromedio).toLocaleString()}</strong>

</div>

<hr>

<h3>

💳 Medios de Pago

</h3>

<div class="filaDetalle">

<span>💵 Efectivo</span>

<strong>$ ${Number(cierre.efectivo).toLocaleString()}</strong>

</div>

<div class="filaDetalle">

<span>💳 Débito</span>

<strong>$ ${Number(cierre.debito).toLocaleString()}</strong>

</div>

<div class="filaDetalle">

<span>💳 Crédito</span>

<strong>$ ${Number(cierre.credito).toLocaleString()}</strong>

</div>

<div class="filaDetalle">

<span>🏦 Transferencia</span>

<strong>$ ${Number(cierre.transferencia).toLocaleString()}</strong>

</div>

<div class="filaDetalle">

<span>📒 Cuenta Corriente</span>

<strong>$ ${Number(cierre.cuenta).toLocaleString()}</strong>

</div>

<div class="filaDetalle">

<span>📝 Otro</span>

<strong>$ ${Number(cierre.otro).toLocaleString()}</strong>

</div>

<div class="filaDetalle">

<span>⏳ Pendiente</span>

<strong>$ ${Number(cierre.pendiente).toLocaleString()}</strong>

</div>

`;

        };

    });

}