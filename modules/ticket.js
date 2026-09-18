import { db } from "../js/firebase.js";

import {

    doc,

    getDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const parametros = new URLSearchParams(window.location.search);

const ventaId = parametros.get("venta");

const esPreview =
    parametros.get("preview") === "true";

let venta;


// ==========================
// TICKET DE VENTA COBRADA
// ==========================

if(ventaId){

    console.log("Venta recibida:", ventaId);

    const documento = await getDoc(

        doc(db, "ventas", ventaId)

    );

    if(!documento.exists()){

        alert("No se encontró la venta.");

        throw new Error("Venta inexistente");

    }

    venta = documento.data();

}


// ==========================
// TICKET PREVIO AL COBRO
// ==========================

else if(esPreview){

    const datosPreview =
        sessionStorage.getItem("ticketPreview");

    if(!datosPreview){

        alert("No se encontraron los datos del ticket.");

        throw new Error(
            "Datos de ticket preview inexistentes"
        );

    }

    venta = JSON.parse(datosPreview);

}


// ==========================
// SIN DATOS
// ==========================

else{

    alert("No se indicó ninguna venta.");

    throw new Error(
        "Ticket sin venta ni preview"
    );

}

console.log("TICKET:", venta);

let fechaVenta;

if (venta.fecha && typeof venta.fecha.toDate === "function") {

    // Venta ya cobrada desde Firebase
    fechaVenta = venta.fecha.toDate();

} else {

    // Ticket previo al cobro
    fechaVenta = new Date(venta.fecha);

}

const datos = {

    mesa: venta.mesa,

    mozo: venta.mozo,

    fecha: fechaVenta.toLocaleDateString("es-AR"),

    hora: fechaVenta.toLocaleTimeString("es-AR", {

        hour: "2-digit",

        minute: "2-digit"

    })

};

console.log("VENTA:", venta);

let descuentoProductos = 0;

venta.productos.forEach(producto => {

const subtotalProducto =
    producto.precio * producto.cantidad;

let descuentoProducto = 0;

// Producto NO COBRADO
if (producto.invitado === true) {

    const cantidadNoCobrar =
        Number(producto.cantidadNoCobrar) || producto.cantidad;

    descuentoProducto =
        producto.precio * cantidadNoCobrar;

}
// Descuento aplicado al producto
else if (Number(producto.descuento) > 0) {

    descuentoProducto =
        subtotalProducto *
        Number(producto.descuento) /
        100;

}

});

const descuentoGeneralPorcentaje =
    Number(venta.descuentoGeneral) || 0;

const subtotalDespuesProductos =
    venta.subtotal - descuentoProductos;

const descuentoGeneralImporte =
    subtotalDespuesProductos *
    descuentoGeneralPorcentaje / 100;

const descuentoCuentaCorriente =
    Number(
        venta.descuentoCuentaCorriente
    ) || 0;

const descuentoReal =
    descuentoProductos +
    descuentoGeneralImporte +
    descuentoCuentaCorriente;

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

    const subtotalProducto =
        producto.precio * producto.cantidad;

    let descuentoProducto = 0;

    // Producto NO COBRADO
    if (producto.invitado === true) {

        descuentoProducto =
            subtotalProducto;

    }
    // Descuento aplicado al producto
    else if (Number(producto.descuento) > 0) {

        descuentoProducto =
            subtotalProducto *
            Number(producto.descuento) /
            100;

    }

    const cobradoProducto =
        subtotalProducto -
        descuentoProducto;

let porcentajeDescuento = "—";

if (producto.invitado === true) {

    const cantidadNoCobrar =
        Number(producto.cantidadNoCobrar) || producto.cantidad;

    const porcentajeInvitado =
        (cantidadNoCobrar / producto.cantidad) * 100;

    porcentajeDescuento =
        Math.round(porcentajeInvitado) + "%";

}
else if (Number(producto.descuento) > 0) {

    porcentajeDescuento =
        Number(producto.descuento) + "%";

}

    filasProductos += `
        <tr>

            <td>
                ${producto.cantidad}
            </td>

            <td>
                ${producto.nombre}
            </td>

            <td>
                $${producto.precio.toLocaleString("es-AR")}
            </td>

<td>
    ${porcentajeDescuento}
</td>

            <td>
                ${
                    cobradoProducto === 0
                    ? "$0"
                    : "$" +
                      cobradoProducto.toLocaleString("es-AR")
                }
            </td>

        </tr>
    `;
});

document.getElementById("ticketProductos").innerHTML = `

<table class="tablaTicket">

    <thead>

        <tr>

<th style="width:9%">Cant</th>
<th style="width:43%">Producto</th>
<th style="width:16%">P.Unit</th>
<th style="width:14%">Desc.</th>
<th style="width:18%">Cobrado</th>

        </tr>

    </thead>

    <tbody>

        ${filasProductos}

    </tbody>

</table>

`;

// ==========================
// TOTAL DEL TICKET
// ==========================

// Si la venta es Cuenta Corriente
// y tiene descuento de empleado,
// usamos el importe final de CC.

const esCuentaCorriente =
    venta.medioPago === "Cuenta Corriente";

const tieneDescuentoCC =
    esCuentaCorriente &&
    venta.importeCuentaCorriente !== undefined;

const descuentoMostrar =
    tieneDescuentoCC
        ? Number(venta.descuentoCuentaCorriente) || 0
        : descuentoReal;

const totalMostrar =
    tieneDescuentoCC
        ? Number(venta.importeCuentaCorriente)
        : Number(venta.totalCobrado);


document.getElementById("ticketTotales").innerHTML = `

${
    descuentoMostrar > 0
        ? `
            <div class="lineaTotal">

                <span>Subtotal</span>

                <strong>
                    $${Number(venta.subtotal).toLocaleString("es-AR")}
                </strong>

            </div>
        `
        : ""
}


${
    descuentoMostrar > 0
        ? `
            <div class="lineaTotal">

                <span>
                    ${
                        tieneDescuentoCC
                            ? "Descuento empleado"
                            : Number(venta.descuentoGeneral) > 0
                                ? `Descuento (${Number(venta.descuentoGeneral)}%)`
                                : "Descuento"
                    }
                </span>

                <strong>
                    $${descuentoMostrar.toLocaleString("es-AR")}
                </strong>

            </div>
        `
        : ""
}


<div class="lineaTotal totalFinal">

    <span>TOTAL</span>

    <strong>
        $${totalMostrar.toLocaleString("es-AR")}
    </strong>

</div>

`;

let pagosHTML = "";


// ==========================
// MEDIO DE PAGO ACTUAL
// ==========================

// Si la venta fue modificada después
// del cobro, usamos el medio actual
// guardado en venta.medioPago.

if (venta.ultimaEdicion) {

    const importePago =
        esCuentaCorriente &&
        venta.importeCuentaCorriente !== undefined

            ? Number(venta.importeCuentaCorriente)

            : Number(venta.totalCobrado);


    pagosHTML = `

        <div class="filaPagoTicket">

            <span>${venta.medioPago}</span>

            <strong>
                $${importePago.toLocaleString("es-AR")}
            </strong>

        </div>

    `;

}


// ==========================
// VENTA ORIGINAL
// ==========================

else if (
    venta.mediosPago &&
    venta.mediosPago.length > 0
) {

    venta.mediosPago.forEach(pago => {

        pagosHTML += `

            <div class="filaPagoTicket">

                <span>${pago.medio}</span>

                <strong>
                    $${Number(pago.importe).toLocaleString("es-AR")}
                </strong>

            </div>

        `;

    });

}

else {

    pagosHTML = `

        <div class="filaPagoTicket">

            <span>${venta.medioPago}</span>

            <strong>
                $${Number(venta.totalCobrado).toLocaleString("es-AR")}
            </strong>

        </div>

    `;

}

document.getElementById("ticketPago").innerHTML = `

<div class="medioPago">

    <strong>MEDIOS DE PAGO</strong>

    ${pagosHTML}

</div>

`;

document.getElementById("btnImprimirTicket").onclick = () => {

    window.print();

};