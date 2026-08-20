import { db } from "../js/firebase.js";

import {

    doc,

    getDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const parametros = new URLSearchParams(window.location.search);

const ventaId = parametros.get("venta");

console.log("Venta recibida:", ventaId);

const documento = await getDoc(

    doc(db, "ventas", ventaId)

);

if(!documento.exists()){

    alert("No se encontró la venta.");

    throw new Error("Venta inexistente");

}

const venta = documento.data();

const fechaVenta = venta.fecha.toDate();

const datos = {

    mesa: venta.mesa,

    mozo: venta.mozo,

    fecha: fechaVenta.toLocaleDateString("es-AR"),

    hora: fechaVenta.toLocaleTimeString("es-AR",{

        hour:"2-digit",

        minute:"2-digit"

    })

};

console.log("VENTA:", venta);

let descuentoProductos = 0;

venta.productos.forEach(producto => {

    const subtotalProducto =
        producto.precio * producto.cantidad;

    // Producto marcado como NO COBRAR
    if (producto.invitado === true) {

        descuentoProductos += subtotalProducto;

        return;

    }

    // Descuento aplicado directamente al producto
    if (producto.descuento > 0) {

        descuentoProductos +=
            subtotalProducto *
            producto.descuento / 100;

    }

});

const descuentoGeneralPorcentaje =
    Number(venta.descuentoGeneral) || 0;

const subtotalDespuesProductos =
    venta.subtotal - descuentoProductos;

const descuentoGeneralImporte =
    subtotalDespuesProductos *
    descuentoGeneralPorcentaje / 100;

const descuentoReal =
    descuentoProductos +
    descuentoGeneralImporte;

console.log("Descuento productos:", descuentoProductos);

console.log(
    "Descuento general:",
    descuentoGeneralImporte
);

console.log(
    "DESCUENTO REAL DEL TICKET:",
    descuentoReal
);

document.getElementById("ticketDatos").innerHTML = `

<div class="filaDato">

    <span><strong>Mesa:</strong> ${datos.mesa}</span>

    <span><strong>Mozo:</strong> ${datos.mozo}</span>

</div>

<div class="filaDato">

    <span>${datos.fecha}</span>

    <span>${datos.hora}</span>

</div>

`;

let filasProductos = "";

venta.productos.forEach(producto => {

    filasProductos += `

        <tr>

            <td>${producto.cantidad}</td>

            <td>${producto.nombre}</td>

            <td>$${producto.precio.toLocaleString("es-AR")}</td>

            <td>$${(producto.precio * producto.cantidad).toLocaleString("es-AR")}</td>

        </tr>

    `;

});

document.getElementById("ticketProductos").innerHTML = `

<table class="tablaTicket">

    <thead>

        <tr>

<th style="width:10%">Cant</th>
<th style="width:50%">Producto</th>
<th style="width:20%">P.Unit</th>
<th style="width:20%">Total</th>

        </tr>

    </thead>

    <tbody>

        ${filasProductos}

    </tbody>

</table>

`;

document.getElementById("ticketTotales").innerHTML = `

<div class="lineaTotal">

    <span>Subtotal</span>

    <strong>
        $${venta.subtotal.toLocaleString("es-AR")}
    </strong>

</div>

<div class="lineaTotal">

    <span>Descuento</span>

<strong>
    $${descuentoReal.toLocaleString("es-AR")}
</strong>

</div>

<div class="lineaTotal totalFinal">

    <span>TOTAL</span>

    <strong>
        $${venta.totalCobrado.toLocaleString("es-AR")}
    </strong>

</div>

`;

let pagosHTML = "";

venta.mediosPago.forEach(pago => {

    pagosHTML += `

        <div class="filaPagoTicket">

            <span>${pago.medio}</span>

            <strong>
                $${pago.importe.toLocaleString("es-AR")}
            </strong>

        </div>

    `;

});

document.getElementById("ticketPago").innerHTML = `

<div class="medioPago">

    <strong>MEDIOS DE PAGO</strong>

    ${pagosHTML}

</div>

`;

document.getElementById("btnImprimirTicket").onclick = () => {

    window.print();

};