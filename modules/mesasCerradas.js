import { db } from "../js/firebase.js";

import {

    collection,

    getDocs,

    getDoc,

    doc,

    query,

    orderBy,

    updateDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let modoSoloLectura = false;

export default async function mostrarMesasCerradas(admin = null){

    if(admin !== null){

        modoSoloLectura = admin;

    }

    const contenido = document.getElementById("contenido");

    contenido.innerHTML = "<h1>Mesas Cerradas</h1>";

    const snapshot = await getDocs(

        query(

            collection(db,"ventas"),

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

<button id="btnVolverVentas" class="btnGris">

← Volver

</button>

<h1>

Mesa ${venta.mesa}

</h1>

<p>

<b>Mozo:</b> ${venta.mozo}

</p>

<p>

<b>Medio de pago:</b>

${venta.medioPago}

</p>

<p>

<b>Subtotal:</b>

$ ${venta.subtotal}

</p>

<p>

<b>Total:</b>

$ ${venta.totalCobrado}

</p>

<hr>

<h3>

Productos

</h3>

`;

    venta.productos.forEach(producto=>{

        html += `

<div class="cardUsuario">

    <div>

        <strong>

            ${producto.nombre}

        </strong>

        <br>

        Cantidad:

        ${producto.cantidad}

    </div>

    <div>

        $ ${producto.precio}

    </div>

</div>

`;

    });

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