import { obtenerJornadaActual } from "../js/services/cajaService.js";

import { obtenerItemsPedido } from "../js/services/pedidoService.js";

import { registrarActividad } from "../js/services/actividadService.js";

import { db } from "../js/firebase.js";

import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    serverTimestamp,
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let volverAMesa = null;

let actualizarSalon = null;

let motivosNoCobrar = {};

let motivosDescuento = {};

export async function abrirCobro(

    mesa,

    callbackVolver,

    callbackActualizarSalon

){

    volverAMesa = callbackVolver;

    actualizarSalon = callbackActualizarSalon;

    motivosNoCobrar = {};

    motivosDescuento = {};

const items = await obtenerItemsPedido(
    mesa.pedidoId
);

let html = `

<div class="contenedorTablaCobro">

<table class="tablaCobro">

<tr class="cabeceraCobro">

    <th>Producto</th>
    <th>Cant.</th>
    <th>Precio</th>
    <th>Total</th>
    <th>No cobrar</th>
    <th>Desc %</th>

</tr>

`;

items.forEach((item,index) => {

    html += `

<tr class="filaCobro">

    <td>${item.nombre}</td>

    <td>${item.cantidad}</td>

    <td>$ ${item.precio.toLocaleString()}</td>

    <td class="totalProducto">

        $ ${(item.precio * item.cantidad).toLocaleString()}

    </td>

    <td class="celdaCentro">

        <input
            type="checkbox"
            class="chkNoCobrar"
            data-index="${index}">

    </td>

    <td>

        <input
            type="number"
            class="txtDescuento"
            value="0"
            min="0"
            max="100"
            data-index="${index}">

    </td>

</tr>

`;

});

html += `

</table>

</div>

<div class="configuracionCobro">

    <div class="grupoCobro">

        <label>

            💸 Descuento General

        </label>

        <input
            type="number"
            id="descuentoGeneral"
            value="0"
            min="0"
            max="100">

    </div>

    <div id="bloqueMotivo" style="display:none;">

        <div class="grupoCobro">

            <label>

                📝 Motivo del descuento

            </label>

            <input
    type="text"
    id="motivoDescuento"
    maxlength="80"
    placeholder="Ingrese el motivo del descuento">

        </div>

    </div>

    <div class="grupoCobro">

        <label>

            💳 Medio de Pago

        </label>

        <select id="medioPago">

            <option value="Efectivo">💵 Efectivo</option>
            <option value="Débito">💳 Débito</option>
            <option value="Crédito">💳 Crédito</option>
            <option value="Transferencia">🏦 Transferencia</option>
            <option value="Cuenta Corriente">📒 Cuenta Corriente</option>
            <option value="Otro">📝 Otro</option>
            <option value="Pendiente">⏳ Registrar después</option>

        </select>

            <div
    id="grupoCuentaCorriente"
    class="grupoCobro"
    style="display:none;">

    <label>

        👤 Empleado

    </label>

    <select id="empleadoCuenta">

        <option value="">Seleccione un empleado</option>

    </select>

</div>

    </div>

</div>

<div class="pieCobro">

    <div class="totalCobro">

        <h1 id="totalCuenta">

            $ ${mesa.total.toLocaleString()}

        </h1>

    </div>

<div class="accionesCobro">

    <button
        id="btnVolverCobro"
        class="btnGris">

        ← Volver

    </button>

    <button
        id="btnConfirmarCobro"
        class="btnVerdeGrande">

        💳 Cobrar

    </button>

</div>

<p
id="mensajeValidacion"
style="display:none;color:red;font-weight:bold;margin-top:10px;">

⚠ Complete todos los motivos requeridos.

</p>

</div>

</div>

`;

document.getElementById("vistaMesa").classList.add("oculto");

document.getElementById("vistaCobro").classList.remove("oculto");

document.getElementById("vistaCobro").innerHTML = html;

await cargarEmpleados();

document.getElementById("medioPago").onchange = ()=>{

    document.getElementById("grupoCuentaCorriente").style.display =

        document.getElementById("medioPago").value === "Cuenta Corriente"

            ? ""

            : "none";

};

console.log(document.getElementById("btnConfirmarCobro"));

document.getElementById("btnAgregarProducto").style.display = "none";

document.getElementById("btnEditarPedido").style.display = "none";

document.getElementById("btnCobrar").style.display = "none";

document.querySelector(".accionesMesa").style.display = "none";

document.getElementById("btnVolverSalon").style.display = "";

document.getElementById("datosMesa").style.display = "none";

document.querySelector(".totalMesa").style.display = "none";

document.getElementById("btnVolverSalon").textContent = "← Volver";

async function volverDesdeCobro(){

    document.getElementById("vistaCobro").innerHTML = "";

    document.getElementById("vistaCobro").classList.add("oculto");

    document.getElementById("vistaMesa").classList.remove("oculto");

    document.getElementById("datosMesa").style.display = "";

    document.querySelector(".totalMesa").style.display = "";

    document.querySelector(".accionesMesa").style.display = "grid";

    document.getElementById("btnAgregarProducto").style.display = "";

    document.getElementById("btnEditarPedido").style.display = "";

    document.getElementById("btnCobrar").style.display = "";

    if(volverAMesa){

        await volverAMesa();

    }

}

document.getElementById("btnVolverSalon").onclick = volverDesdeCobro;

document.getElementById("btnVolverCobro").onclick = volverDesdeCobro;

document.getElementById("btnConfirmarCobro").onclick = async () => {

    const confirmar = confirm(

        `¿Desea cerrar la Mesa ${mesa.numero}?`

    );

    if(!confirmar) return;

    const items = await obtenerItemsPedido(

        mesa.pedidoId

    );

const jornada = await obtenerJornadaActual();

const ventaRef = await addDoc(

    collection(db,"ventas"),

    {

        pedidoId: mesa.pedidoId,

        mesa: mesa.numero,

        mozo: mesa.mozo,

        jornada: jornada,

        fecha: serverTimestamp(),

        subtotal: mesa.total,

        descuentoGeneral: Number(
            document.getElementById("descuentoGeneral").value
        ) || 0,

        motivo: document.getElementById("motivoDescuento").value,

        medioPago: document.getElementById("medioPago").value,

        totalCobrado: Number(
            document.getElementById("totalCuenta")
                .textContent
                .replace("$", "")
                .replace(/\./g, "")
                .replace(",", ".")
                .trim()
        ),

        productos: items.map(item => ({

            ...item,

            descuento: Number(

                document.querySelectorAll(".txtDescuento")[

                    items.indexOf(item)

                ].value

            ) || 0,

            motivoDescuento:

                motivosDescuento[items.indexOf(item)] || "",

            invitado:

                document.querySelectorAll(".chkNoCobrar")[

                    items.indexOf(item)

                ].checked,

            motivoNoCobrar:

                motivosNoCobrar[items.indexOf(item)] || ""

        }))

    }

);

if(document.getElementById("medioPago").value === "Cuenta Corriente"){

    const selector = document.getElementById("empleadoCuenta");

    await addDoc(

        collection(db,"cuentasCorrientes"),

        {

            empleadoId: selector.value,

            empleado: selector.selectedOptions[0].textContent,

            ventaId: ventaRef.id,

            pedidoId: mesa.pedidoId,

            mesa: mesa.numero,

            importe: Number(
                document.getElementById("totalCuenta")
                    .textContent
                    .replace("$","")
                    .replace(/\./g,"")
                    .replace(",",".")
                    .trim()
            ),

            fecha: serverTimestamp(),

            estado: "Pendiente",

            tipo: "Consumo"

        }

    );

}

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

await registrarActividad(

    mesa.mozo,

    "Cobro",

    "Cerrar Mesa",

    `Mesa ${mesa.numero} - Total: ${document.getElementById("totalCuenta").textContent} - ${document.getElementById("medioPago").value}`,

    {

        pedidoId: mesa.pedidoId,

        jornada: jornada

    }

);


document.getElementById("productosMesa").innerHTML = "";

document.getElementById("datosMesa").innerHTML = "";

document.getElementById("totalMesa").textContent = "$0";

document.getElementById("modalMesa").classList.add("oculto");

if(actualizarSalon){

    await actualizarSalon();

}

document.getElementById("vistaCobro").innerHTML = "";

document.getElementById("vistaCobro").classList.add("oculto");

document.getElementById("vistaMesa").classList.remove("oculto");

// AQUÍ VAMOS A RECARGAR EL SALÓN

};

    calcularTotal();

calcularTotal();

// ==========================
// EVENTOS DE NO COBRAR
// ==========================

document.querySelectorAll(".chkNoCobrar").forEach((control,index)=>{

    control.onchange = () => {

        if(control.checked){

            const motivo = prompt("Ingrese el motivo por el cual NO se cobrará este producto:");

            if(!motivo || motivo.trim() === ""){

                alert("Debe ingresar un motivo.");

                control.checked = false;

                delete motivosNoCobrar[index];

            }else{

                motivosNoCobrar[index] = motivo.trim();

            }

        }else{

            delete motivosNoCobrar[index];

        }

        calcularTotal();

        validarCobro();

    };

});

// ==========================
// EVENTOS DESCUENTO ITEM
// ==========================

document.querySelectorAll(".txtDescuento").forEach((control,index)=>{

    control.onchange = () => {

        const descuento = Number(control.value) || 0;

        if(descuento > 0){

            const motivo = prompt("Ingrese el motivo del descuento:");

            if(!motivo || motivo.trim() === ""){

                alert("Debe ingresar un motivo.");

                control.value = 0;

                delete motivosDescuento[index];

            }else{

                motivosDescuento[index] = motivo.trim();

            }

        }else{

            delete motivosDescuento[index];

        }

        calcularTotal();

        validarCobro();

    };

});
// ==========================
// EVENTO DESCUENTO GENERAL
// ==========================

document.getElementById("descuentoGeneral").oninput = () => {

    calcularTotal();

    validarCobro();

};

document.getElementById("motivoDescuento").oninput = validarCobro;
// ==========================
// MOSTRAR / OCULTAR MOTIVOS
// ==========================


}

function validarCobro(){

    let valido = true;

    // ==========================
    // DESCUENTO GENERAL
    // ==========================

    const descuentoGeneral = Number(
        document.getElementById("descuentoGeneral").value
    ) || 0;

    if(
        descuentoGeneral > 0 &&
        document.getElementById("motivoDescuento").value.trim() === ""
    ){
        valido = false;
    }

    // ==========================
    // NO COBRAR
    // ==========================

    document.querySelectorAll(".chkNoCobrar").forEach((check,index)=>{

        if(check.checked && !motivosNoCobrar[index]){

            valido = false;

        }

    });

    // ==========================
    // DESCUENTO POR PRODUCTO
    // ==========================

    document.querySelectorAll(".txtDescuento").forEach((txt,index)=>{

        if(
            Number(txt.value) > 0 &&
            !motivosDescuento[index]
        ){

            valido = false;

        }

    });

    // ==========================
    // BOTÓN
    // ==========================
    console.log("VALIDO =", valido);

    document.getElementById("btnConfirmarCobro").disabled = !valido;

    document.getElementById("mensajeValidacion").style.display =
        valido ? "none" : "block";

}
function calcularTotal(){

    let total = 0;

    const filas = document.querySelectorAll("table tr");

    filas.forEach((fila,index)=>{

        if(index===0) return;

        const columnas = fila.querySelectorAll("td");

        if(columnas.length===0) return;

const subtotalTexto = columnas[3].textContent
    .replace("$", "")
    .replace(/\./g, "")   // elimina los puntos de miles
    .replace(",", ".")    // por si alguna vez hay decimales
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
    "$ " + total.toLocaleString("es-AR");

}

async function cargarEmpleados(){

    const selector = document.getElementById("empleadoCuenta");

    const snapshot = await getDocs(

        collection(db,"usuarios")

    );

    snapshot.forEach(documento=>{

        const usuario = documento.data();

        if(!usuario.activo) return;

        const option = document.createElement("option");

        option.value = documento.id;

        option.textContent =

            usuario.nombre +

            " " +

            usuario.apellido;

        selector.appendChild(option);

    });

}