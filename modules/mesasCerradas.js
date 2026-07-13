import { obtenerJornadaActual } from "../js/services/cajaService.js";

import { db } from "../js/firebase.js";

import {

    collection,

    getDocs,

    getDoc,

    doc,

    query,

    where,

    orderBy,

    updateDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let modoSoloLectura = false;

export default async function mostrarMesasCerradas(admin = null){

    if(admin !== null){

        modoSoloLectura = admin;

    }

    const jornada = await obtenerJornadaActual();
    
    const contenido = document.getElementById("contenido");

    contenido.innerHTML = "<h1>Mesas Cerradas</h1>";

    const snapshot = await getDocs(

    query(

        collection(db,"ventas"),

        where("jornada","==",jornada),

        orderBy("fecha","desc")

    )

);

    snapshot.forEach(documento=>{

    const venta = documento.data();

    contenido.innerHTML += `

<div
    class="cardUsuario cardVenta"
    data-id="${documento.id}">

    <div style="flex:1;">

        <strong>

            Mesa ${venta.mesa}

        </strong>

        <br>

        ${venta.mozo}

        <br>

        ${venta.medioPago}

    </div>

    <div>

        <strong>

            $ ${venta.totalCobrado}

        </strong>

    </div>

</div>

`;

});

document.querySelectorAll(".cardVenta").forEach(card=>{

    card.onclick=()=>{

        abrirVenta(card.dataset.id);

    };

});

async function abrirVenta(id){

    const documento = await getDoc(

        doc(db,"ventas",id)

    );

    const venta = documento.data();

    const contenido = document.getElementById("contenido");

let html = `

<div class="detalleVenta">

<button id="btnVolverVentas" class="btnGris">

← Volver

</button>

<h1>

🧾 Detalle de Venta

</h1>

<div class="cardResumenVenta">

    <h2>

        Mesa ${venta.mesa}

    </h2>

    <p>

        👤 <strong>Mozo:</strong>

        ${venta.mozo}

    </p>

    <p>

        💳 <strong>Medio de Pago:</strong>

        ${venta.medioPago}

    </p>

    <p>

        💲 <strong>Subtotal:</strong>

        $ ${Number(venta.subtotal).toLocaleString()}

    </p>

    <p class="totalVenta">

        Total Cobrado

        $ ${Number(venta.totalCobrado).toLocaleString()}

    </p>

</div>

<h2 class="tituloSeccion">

Productos

</h2>
`;

venta.productos.forEach(producto=>{

    html += `

<div class="cardProducto">

    <div style="width:100%;">

        <h3 style="margin-bottom:10px;">

            ${producto.nombre}

        </h3>

        <p>

            <strong>Cantidad:</strong>

            ${producto.cantidad}

        </p>

        <p>

            <strong>Precio:</strong>

            $ ${Number(producto.precio).toLocaleString()}

        </p>

        ${
            producto.descuento > 0

            ?

            `

            <p style="color:#d97706;">

                <strong>

                    🟠 Descuento: ${producto.descuento}%

                </strong>

            </p>

            <p>

                <strong>Motivo:</strong>

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

                <strong>

                    🔴 NO COBRADO

                </strong>

            </p>

            <p>

                <strong>Motivo:</strong>

                ${producto.motivoNoCobrar}

            </p>

            `

            : ""

        }

    </div>

</div>

`;

});

if(venta.descuentoGeneral > 0){

    html += `

<hr>

<h3>

🟢 Descuento General

</h3>

<p>

<strong>Descuento:</strong>

${venta.descuentoGeneral} %

</p>

<p>

<strong>Motivo:</strong>

${venta.motivo}

</p>

`;

}

    html += `

<hr>

<h3>

Medio de Pago

</h3>

<select id="medioPagoEditar">

    <option value="Efectivo">💵 Efectivo</option>

    <option value="Débito">💳 Débito</option>

    <option value="Crédito">💳 Crédito</option>

    <option value="Transferencia">🏦 Transferencia</option>

    <option value="Cuenta Corriente">📒 Cuenta Corriente</option>

    <option value="Otro">📝 Otro</option>

    <option value="Pendiente">🟡 Pendiente</option>

</select>

<br><br>

<h3>

Observaciones

</h3>

<textarea
    id="observacionesVenta"
    rows="4"
    style="width:100%;"></textarea>

<br><br>

<button
    id="btnGuardarVenta"
    class="btnPrincipal">

💾 Guardar Cambios

</button>

</div>

`;

    contenido.innerHTML = html;

    if (modoSoloLectura) {

    document.getElementById("medioPagoEditar").disabled = true;

    document.getElementById("observacionesVenta").disabled = true;

    document.getElementById("btnGuardarVenta").style.display = "none";

}

    document.getElementById("medioPagoEditar").value =
    venta.medioPago;

document.getElementById("observacionesVenta").value =
    venta.observaciones || "";

document.getElementById("btnVolverVentas").onclick = () => {

    mostrarMesasCerradas();

};

    document.getElementById("btnGuardarVenta").onclick = async () => {

    await updateDoc(

        doc(db,"ventas",id),

        {

            medioPago:
                document.getElementById("medioPagoEditar").value,

            observaciones:
                document.getElementById("observacionesVenta").value,

            ultimaEdicion:
                serverTimestamp()

        }

    );

  mostrarMesasCerradas();

};

}

}