import { obtenerItemsPedido } from "../js/services/pedidoService.js";

import { db } from "../js/firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let volverAMesa = null;

let actualizarSalon = null;

export async function abrirCobro(

    mesa,

    callbackVolver,

    callbackActualizarSalon

){

    volverAMesa = callbackVolver;

    actualizarSalon = callbackActualizarSalon;

    const items = await obtenerItemsPedido(

        mesa.pedidoId

    );

    let html = `


    <table
        border="1"
        cellpadding="8"
        style="width:100%;border-collapse:collapse;">

<tr>

    <th>Producto</th>

    <th>Cant.</th>

    <th>Precio</th>

    <th>Total</th>

    <th>No cobrar</th>

    <th>Desc %</th>

</tr>

    `;

    items.forEach(item=>{

        html += `

<tr>

    <td>${item.nombre}</td>

    <td>${item.cantidad}</td>

    <td>$ ${item.precio}</td>

    <td class="totalProducto">

        $ ${item.precio * item.cantidad}

    </td>

    <td style="text-align:center">

        <input
            type="checkbox"
            class="chkNoCobrar">

    </td>

    <td>

        <input

            type="number"

            class="txtDescuento"

            value="0"

            min="0"

            max="100"

            style="width:60px;">

    </td>

</tr>

<br>



        `;

    });

html += `

</table>

<br>

<hr>

<h3>

Descuento General %

</h3>

<input

    type="number"

    id="descuentoGeneral"

    value="0"

    min="0"

    max="100"

    style="width:80px;">

<br><br>

<div id="bloqueMotivo" style="display:none;">

<h3>

Motivo del descuento

</h3>

<textarea

    id="motivoDescuento"

    rows="3"

    style="width:100%;">

</textarea>

</div>

<h3>

Medio de pago

</h3>

<select id="medioPago">

    <option value="Efectivo">💵 Efectivo</option>

    <option value="Débito">💳 Débito</option>

    <option value="Crédito">💳 Crédito</option>

    <option value="Transferencia">🏦 Transferencia</option>

    <option value="Cuenta Corriente">📒 Cuenta Corriente</option>

    <option value="Otro">📝 Otro</option>

    <option value="Pendiente">⏳ Registrar después</option>

</select>

<br><br>

<hr>

<h2
    id="totalCuenta"
    style="text-align:right;">

    Total: $ ${mesa.total.toLocaleString()}

</h2>

<br>

<button id="btnConfirmarCobro">

    Cobrar

</button>

`;

document.getElementById("vistaMesa").classList.add("oculto");

document.getElementById("vistaCobro").classList.remove("oculto");

document.getElementById("vistaCobro").innerHTML = html;

document.getElementById("btnAgregarProducto").style.display = "none";

document.getElementById("btnEditarPedido").style.display = "none";

document.getElementById("btnCobrar").style.display = "none";

document.getElementById("datosMesa").style.display = "none";

document.querySelector(".totalMesa").style.display = "none";

document.getElementById("btnVolverSalon").textContent = "← Volver";

document.getElementById("btnVolverSalon").onclick = async () => {

    document.getElementById("vistaCobro").innerHTML = "";

    document.getElementById("vistaCobro").classList.add("oculto");

    document.getElementById("vistaMesa").classList.remove("oculto");

    document.getElementById("datosMesa").style.display = "";

    document.querySelector(".totalMesa").style.display = "";

    document.getElementById("btnAgregarProducto").style.display = "";

    document.getElementById("btnEditarPedido").style.display = "";

    document.getElementById("btnCobrar").style.display = "";

    if (volverAMesa) {

        await volverAMesa();

    }

};

document.getElementById("btnConfirmarCobro").onclick = async () => {

    const confirmar = confirm(

        `¿Desea cerrar la Mesa ${mesa.numero}?`

    );

    if(!confirmar) return;

    const items = await obtenerItemsPedido(

        mesa.pedidoId

    );

    await addDoc(

        collection(db,"ventas"),

        {

    pedidoId: mesa.pedidoId,

    mesa: mesa.numero,

    mozo: mesa.mozo,

    fecha: serverTimestamp(),

    subtotal: mesa.total,

    descuentoGeneral: Number(
        document.getElementById("descuentoGeneral").value
    ) || 0,

    motivo: document.getElementById("motivoDescuento").value,

    medioPago: document.getElementById("medioPago").value,

totalCobrado: parseFloat(
    document.getElementById("totalCuenta")
        .textContent
        .replace("Total: $", "")
        .trim()
),

    productos: items.map(item => ({

        ...item,

        descuento: Number(

            document.querySelectorAll(".txtDescuento")[

                items.indexOf(item)

            ].value

        ) || 0,

        invitado:

            document.querySelectorAll(".chkNoCobrar")[

                items.indexOf(item)

            ].checked

    }))

}

    );

    console.log("Pedido ID:", mesa.pedidoId);
console.log("Mesa:", mesa);

    await updateDoc(

        
    doc(db,"pedidos",mesa.pedidoId),

    {

        estado: "Cerrado",

        fechaCierre: serverTimestamp()

    }

);

await updateDoc(

    doc(db,"mesas",String(mesa.numero)),

    {

        estado: "Libre",

        personas: 0,

        mozo: "",

        pedidoId: "",

        total: 0

    }

);

await addDoc(

    collection(db,"actividad"),

    {

        fecha: serverTimestamp(),

        usuario: mesa.mozo,

        accion: "Cobro",

        descripcion:
            `Mesa ${mesa.numero} cerrada - Total: $${parseFloat(
                document.getElementById("totalCuenta")
                    .textContent
                    .replace("Total: $","")
                    .trim()
            )}`

    }

);

document.getElementById("modalMesa").classList.add("oculto");
if(actualizarSalon){

    await actualizarSalon();

}

// AQUÍ VAMOS A RECARGAR EL SALÓN

};

    calcularTotal();

document.querySelectorAll(".chkNoCobrar").forEach(control=>{

    control.onchange = calcularTotal;

});

document.querySelectorAll(".txtDescuento").forEach(control=>{

    control.oninput = calcularTotal;

});

document.getElementById("descuentoGeneral").oninput = () => {

    calcularTotal();

};

}

function calcularTotal(){

    let total = 0;

    const filas = document.querySelectorAll("table tr");

    filas.forEach((fila,index)=>{

        if(index===0) return;

        const columnas = fila.querySelectorAll("td");

        if(columnas.length===0) return;

        const subtotalTexto = columnas[3].textContent
            .replace("$","")
            .trim();

        const subtotal = Number(subtotalTexto);

        const noCobrar = columnas[4]
            .querySelector("input").checked;

        const descuento = Number(

            columnas[5]
                .querySelector("input").value

        ) || 0;

        if(noCobrar){

            return;

        }

        total += subtotal * (1-descuento/100);

    });

const descuentoGeneral = Number(

    document.getElementById("descuentoGeneral").value

) || 0;

total *= (1-descuentoGeneral/100);

document.getElementById("bloqueMotivo").style.display =

    descuentoGeneral > 0

        ? ""

        : "none";

    document.getElementById("totalCuenta").textContent =

        "Total: $ " + total.toFixed(2);

}