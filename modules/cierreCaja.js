import { db } from "../js/firebase.js";

import {

    collection,

    getDocs,

    getDoc,

    doc,

    query,

    where,

    addDoc,

    updateDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(){

    const contenido = document.getElementById("contenido");

    contenido.innerHTML = "<h1>Cierre de Caja</h1>";



    // ==========================
    // JORNADA ACTUAL
    // ==========================

    const caja = await getDoc(

        doc(db,"caja","actual")

    );

    const jornada = caja.data().fechaJornada;

    // ==========================
    // VENTAS DEL DÍA
    // ==========================

    const ventas = await getDocs(

        query(

            collection(db,"ventas"),

            where("jornada","==",jornada)

        )

    );

    let total = 0;

    let efectivo = 0;

    let debito = 0;

    let credito = 0;

    let transferencia = 0;

    let cuenta = 0;

    let otro = 0;

    let pendiente = 0;

    let cantidadVentas = 0;

    let productosVendidos = 0;

    ventas.forEach(documento=>{

        const venta = documento.data();

        cantidadVentas++;

        total += venta.totalCobrado;

        venta.productos.forEach(producto=>{

            productosVendidos += producto.cantidad;

        });

        switch(venta.medioPago){

            case "Efectivo":

                efectivo += venta.totalCobrado;

                break;

            case "Débito":

                debito += venta.totalCobrado;

                break;

            case "Crédito":

                credito += venta.totalCobrado;

                break;

            case "Transferencia":

                transferencia += venta.totalCobrado;

                break;

            case "Cuenta Corriente":

                cuenta += venta.totalCobrado;

                break;

            case "Otro":

                otro += venta.totalCobrado;

                break;

            case "Pendiente":

                pendiente += venta.totalCobrado;

                break;

        }

    });

    const ticketPromedio =

        cantidadVentas

        ?

        total / cantidadVentas

        :

        0;

    contenido.innerHTML = `

<h1 style="margin-bottom:5px;">

💰 Cierre de Caja

</h1>

<p style="color:#777;margin-bottom:25px;">

Jornada: <strong>${jornada}</strong>

</p>

<div class="resumenCaja">

    <div class="cardResumen">

        <div class="tituloResumen">

            💰 Total

        </div>

        <div class="valorResumen">

            $ ${total.toLocaleString()}

        </div>

    </div>

    <div class="cardResumen">

        <div class="tituloResumen">

            🧾 Ventas

        </div>

        <div class="valorResumen">

            ${cantidadVentas}

        </div>

    </div>

    <div class="cardResumen">

        <div class="tituloResumen">

            🍽 Productos

        </div>

        <div class="valorResumen">

            ${productosVendidos}

        </div>

    </div>

    <div class="cardResumen">

        <div class="tituloResumen">

            📈 Ticket Promedio

        </div>

        <div class="valorResumen">

            $ ${ticketPromedio.toLocaleString()}

        </div>

    </div>

</div>

<div class="cardCaja">

<h2>

💳 Medios de Pago

</h2>

<div class="filaCaja">

<span>💵 Efectivo</span>

<strong>$ ${efectivo.toLocaleString()}</strong>

</div>

<div class="filaCaja">

<span>💳 Débito</span>

<strong>$ ${debito.toLocaleString()}</strong>

</div>

<div class="filaCaja">

<span>💳 Crédito</span>

<strong>$ ${credito.toLocaleString()}</strong>

</div>

<div class="filaCaja">

<span>🏦 Transferencia</span>

<strong>$ ${transferencia.toLocaleString()}</strong>

</div>

<div class="filaCaja">

<span>📒 Cuenta Corriente</span>

<strong>$ ${cuenta.toLocaleString()}</strong>

</div>

<div class="filaCaja">

<span>📝 Otro</span>

<strong>$ ${otro.toLocaleString()}</strong>

</div>

<div class="filaCaja">

<span>⏳ Pendiente</span>

<strong>$ ${pendiente.toLocaleString()}</strong>

</div>

</div>

<button
    id="btnCerrarCaja"
    class="btnRojoGrande">

🔒 CERRAR CAJA

</button>

`;

    document.getElementById("btnCerrarCaja").onclick = async () => {

    const confirmar = confirm(

        `¿Cerrar la jornada ${jornada}?`

    );

    if(!confirmar) return;

    const boton = document.getElementById("btnCerrarCaja");

boton.disabled = true;

boton.textContent = "⏳ Cerrando...";

    // ==========================
    // GUARDAR CIERRE
    // ==========================
const cierreExistente = await getDocs(

    query(

        collection(db,"cierresCaja"),

        where("jornada","==",jornada)

    )

);

if(!cierreExistente.empty){

    alert("⚠️ Esta jornada ya fue cerrada.");

    boton.disabled = false;

    boton.textContent = "💾 Cerrar Caja";

    return;

}

    await addDoc(

        collection(db,"cierresCaja"),

        {

            jornada,
           
            estado: "Cerrada",

            apertura: caja.data().apertura,

            cierre: serverTimestamp(),

            usuario: caja.data().usuario,

            total,

            efectivo,

            debito,

            credito,

            transferencia,

            cuenta,

            otro,

            pendiente,

            cantidadVentas,

            productosVendidos,

            ticketPromedio,

            ventas: ventas.docs.map(doc=>doc.data())

        }

    );

    await updateDoc(

    doc(db,"caja","actual"),

    {

        abierta: false,

        cierre: serverTimestamp()

    }

);

console.log("Caja cerrada correctamente");

    alert("✅ Caja cerrada correctamente.");

};

}