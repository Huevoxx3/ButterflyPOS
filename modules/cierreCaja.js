import { generarExcelCierre } from "../js/services/excelService.js";

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

    deleteDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

function imprimirResumenCaja({

    jornada,
    montoInicial,
    total,
    esperadoEnCaja,
    totalEgresos,
    efectivo,
    mercadoPago,
    bancoProvincia,
    cuenta,
    pendiente,
    cantidadVentas,
    productosVendidos,
    ticketPromedio

}){

    const ventana = window.open(
        "",
        "_blank",
        "width=800,height=900"
    );

    if(!ventana){

        alert(
            "⚠️ El navegador bloqueó la ventana de impresión."
        );

        return;

    }

    ventana.document.write(`

<!DOCTYPE html>

<html lang="es">

<head>

<meta charset="UTF-8">

<title>Cierre de Caja</title>

<style>

@page{

    size:A6 portrait;

    margin:5mm;

}

*{

    box-sizing:border-box;

}

html,
body{

    width:100%;

    margin:0;

    padding:0;

}

body{

    font-family:Arial,Helvetica,sans-serif;

    color:#202938;

    background:white;

    font-size:10px;

}

.contenedor{

    width:100%;

    max-width:95mm;

    margin:0 auto;

}


/* ==========================
   CABECERA
========================== */

.cabecera{

    text-align:center;

    border-bottom:2px solid #202938;

    padding-bottom:6px;

    margin-bottom:10px;

}

.logo{

    font-size:19px;

    font-weight:bold;

    letter-spacing:1px;

    margin-bottom:2px;

}

.titulo{

    font-size:14px;

    font-weight:bold;

}

.jornada{

    margin-top:4px;

    color:#555;

    font-size:9px;

}


/* ==========================
   SECCIONES
========================== */

.seccion{

    margin-bottom:11px;

}

.seccion h2{

    font-size:10px;

    margin:0 0 4px 0;

    padding-bottom:3px;

    border-bottom:1px solid #ccc;

}


/* ==========================
   FILAS
========================== */

.fila{

    display:flex;

    justify-content:space-between;

    align-items:center;

    gap:8px;

    padding:3px 0;

    border-bottom:1px solid #eee;

    font-size:9.5px;

}

.fila span{

    flex:1;

}

.fila strong{

    white-space:nowrap;

    font-size:9.5px;

}


/* ==========================
   EFECTIVO ESPERADO
========================== */

.destacado{

    font-size:11px;

    font-weight:bold;

    padding:5px 0;

    border-bottom:2px solid #202938;

}

.destacado strong{

    font-size:12px;

}


/* ==========================
   ESTADÍSTICAS
========================== */

.grid{

    display:grid;

    grid-template-columns:repeat(3,1fr);

    gap:5px;

}

.card{

    border:1px solid #ccc;

    border-radius:5px;

    padding:5px 2px;

    text-align:center;

}

.card .label{

    font-size:7.5px;

    color:#666;

    margin-bottom:3px;

}

.card .valor{

    font-size:10px;

    font-weight:bold;

}


/* ==========================
   PIE
========================== */

.total{

    margin-top:12px;

    padding-top:6px;

    border-top:1px solid #202938;

    text-align:center;

    font-size:7.5px;

    color:#666;

}


/* ==========================
   IMPRESIÓN
========================== */

@media print{

    body{

        background:white;

        width:100%;

        padding:0;

    }

    .contenedor{

        width:100%;

        max-width:95mm;

        margin:0 auto;

    }

    .seccion,
    .fila,
    .grid,
    .card,
    .cabecera,
    .total{

        break-inside:avoid;

        page-break-inside:avoid;

    }

}

</style>

</head>

<body>

<div class="contenedor">

    <div class="cabecera">

        <div class="logo">
            BUTTERFLY
        </div>

        <div class="titulo">
            CIERRE DE CAJA
        </div>

        <div class="jornada">
            Jornada: <strong>${jornada}</strong>
        </div>

    </div>


 <div class="seccion">

    <h2>💰 Resumen de Caja</h2>

    <div class="fila destacado">

        <span>💰 Dinero en caja</span>

        <strong>
            $ ${esperadoEnCaja.toLocaleString()}
        </strong>

    </div>

    <div class="fila">

        <span>💵 Caja inicial</span>

        <strong>
            $ ${montoInicial.toLocaleString()}
        </strong>

    </div>

    <div class="fila">

        <span>💸 Egresos</span>

        <strong>
            $ ${totalEgresos.toLocaleString()}
        </strong>

    </div>

    <div class="fila">

        <span>🧾 Ventas</span>

        <strong>
            ${cantidadVentas}
        </strong>

    </div>

    <div class="fila">

        <span>💰 Total</span>

        <strong>
            $ ${total.toLocaleString()}
        </strong>

    </div>

</div>




    <div class="seccion">

        <h2>💳 Medios de Pago</h2>

        <div class="fila">

            <span>💵 Efectivo</span>

            <strong>
                $ ${efectivo.toLocaleString()}
            </strong>

        </div>

        <div class="fila">

            <span>📱 MercadoPago</span>

            <strong>
                $ ${mercadoPago.toLocaleString()}
            </strong>

        </div>

        <div class="fila">

            <span>🏦 Banco Provincia</span>

            <strong>
                $ ${bancoProvincia.toLocaleString()}
            </strong>

        </div>

        <div class="fila">

            <span>📒 Cuenta Corriente</span>

            <strong>
                $ ${cuenta.toLocaleString()}
            </strong>

        </div>

        <div class="fila">

            <span>⏳ Pendiente</span>

            <strong>
                $ ${pendiente.toLocaleString()}
            </strong>

        </div>

    </div>


    <div class="total">

        Resumen generado desde el sistema Butterfly

    </div>

</div>

<script>

window.onload = function(){

    window.print();

};

<\/script>

</body>

</html>

`);

    ventana.document.close();

}

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

    const montoInicial = caja.data().montoInicial || 0;
    
    // ==========================
    // VENTAS DEL DÍA
    // ==========================

    const ventas = await getDocs(

        query(

            collection(db,"ventas"),

            where("jornada","==",jornada)

        )

    );

    // ==========================
// EGRESOS DE LA JORNADA
// ==========================

// ==========================
// EGRESOS DE LA JORNADA
// ==========================

const egresos = await getDocs(

    query(

        collection(db,"egresos"),

        where("jornada","==",jornada)

    )

);

let totalEgresos = 0;

const detalleEgresos = [];

egresos.forEach(documento => {

    const egreso = documento.data();

    // No computar egresos anulados
    if(egreso.estado !== "Activo") return;

    const importe =
        Number(egreso.importe) || 0;

    totalEgresos += importe;


    detalleEgresos.push({

        tipo: egreso.tipo || "",

        concepto: egreso.concepto || "",

        empleadoId: egreso.empleadoId || "",

        empleado: egreso.empleado || "",

        importe,

        observacion: egreso.observacion || "",

        fecha: egreso.fecha || null

    });

});

    let total = 0;

    let esperadoEnCaja = 0;

    let efectivo = 0;

    let mercadoPago = 0;

    let bancoProvincia = 0;

    let cuenta = 0;

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

// ==========================
// MEDIOS DE PAGO
// ==========================

// Si la venta fue modificada después del cobro,
// usamos el medio de pago actualmente guardado
// en venta.medioPago.
//
// Si NO fue modificada, mantenemos la lógica
// original usando venta.mediosPago.

if (venta.ultimaEdicion) {

    switch (venta.medioPago) {

        case "Efectivo":

            efectivo += Number(venta.totalCobrado) || 0;

            break;


        case "MercadoPago":

            mercadoPago += Number(venta.totalCobrado) || 0;

            break;


        case "Banco Provincia":

            bancoProvincia += Number(venta.totalCobrado) || 0;

            break;


        case "Cuenta Corriente":

            cuenta += Number(venta.totalCobrado) || 0;

            break;


        case "Pendiente":

            pendiente += Number(venta.totalCobrado) || 0;

            break;

    }

} else {

    // ==========================
    // VENTAS SIN MODIFICACIONES
    // ==========================

    if (
        venta.mediosPago &&
        venta.mediosPago.length > 0
    ) {

        venta.mediosPago.forEach(pago => {

            switch (pago.medio) {

                case "Efectivo":

                    efectivo +=
                        Number(pago.importe) || 0;

                    break;


                case "MercadoPago":

                    mercadoPago +=
                        Number(pago.importe) || 0;

                    break;


                case "Banco Provincia":

                    bancoProvincia +=
                        Number(pago.importe) || 0;

                    break;


                case "Cuenta Corriente":

                    cuenta +=
                        Number(pago.importe) || 0;

                    break;


                case "Pendiente":

                    pendiente +=
                        Number(pago.importe) || 0;

                    break;

            }

        });

    } else {

        // Compatibilidad con ventas antiguas

        switch (venta.medioPago) {

            case "Efectivo":

                efectivo +=
                    Number(venta.totalCobrado) || 0;

                break;


            case "MercadoPago":

                mercadoPago +=
                    Number(venta.totalCobrado) || 0;

                break;


            case "Banco Provincia":

                bancoProvincia +=
                    Number(venta.totalCobrado) || 0;

                break;


            case "Cuenta Corriente":

                cuenta +=
                    Number(venta.totalCobrado) || 0;

                break;


            case "Pendiente":

                pendiente +=
                    Number(venta.totalCobrado) || 0;

                break;

        }

    }

}

    });

   esperadoEnCaja =
    montoInicial
    + efectivo
    - totalEgresos;

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
            💰 Dinero en caja
        </div>

        <div class="valorResumen">
            $ ${esperadoEnCaja.toLocaleString()}
        </div>

    </div>


    <div class="cardResumen">

        <div class="tituloResumen">
            💵 Caja Inicial
        </div>

        <div class="valorResumen">
            $ ${montoInicial.toLocaleString()}
        </div>

    </div>


    <div class="cardResumen">

        <div class="tituloResumen">
            💸 Egresos
        </div>

        <div class="valorResumen">
            $ ${totalEgresos.toLocaleString()}
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
            💰 Total
        </div>

        <div class="valorResumen">
            $ ${total.toLocaleString()}
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

<span>📱 MercadoPago</span>

<strong>$ ${mercadoPago.toLocaleString()}</strong>

</div>

<div class="filaCaja">

<span>🏦 Banco Provincia</span>

<strong>$ ${bancoProvincia.toLocaleString()}</strong>

</div>

<div class="filaCaja">

<span>📒 Cuenta Corriente</span>

<strong>$ ${cuenta.toLocaleString()}</strong>

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

<button
    id="btnImprimirResumen"
    class="btnSecundario">

🖨️ Imprimir Resumen

</button>

`;

    document.getElementById("btnCerrarCaja").onclick = async () => {

const confirmar = confirm(

    `🔒 ¿Está seguro que desea cerrar la jornada ${jornada}?`

);

if(!confirmar) return;


// ==========================
// PREGUNTAR SI QUIERE IMPRIMIR
// ==========================

const imprimir = confirm(

    "🖨️ ¿Desea imprimir el resumen de caja antes de cerrar?"

);

if(imprimir){

    imprimirResumenCaja({

        jornada,

        montoInicial,

        total,

        esperadoEnCaja,

        totalEgresos,

        efectivo,

        mercadoPago,

        bancoProvincia,

        cuenta,

        pendiente,

        cantidadVentas,

        productosVendidos,

        ticketPromedio

    });

}

    // ==========================
// VERIFICAR MESAS ABIERTAS
// ==========================

const mesasAbiertas = await getDocs(

    query(

        collection(db,"mesas"),

        where("estado","==","Ocupada")

    )

);

if(!mesasAbiertas.empty){

    let mensaje =

        "⚠️ No es posible cerrar la caja.\n\n";

    mensaje +=

        "Existen mesas abiertas:\n\n";

    mesasAbiertas.forEach(doc=>{

        mensaje +=

            `• Mesa ${doc.data().numero}\n`;

    });

    alert(mensaje);

    return;

}

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

            montoInicial,

            total,

            efectivo,

            totalEgresos,

            egresos: detalleEgresos,

            mercadoPago,

            bancoProvincia,

            cuenta,

            pendiente,

            cantidadVentas,

            productosVendidos,

            ticketPromedio,

            ventas: ventas.docs.map(doc=>doc.data())

        }

    );

    // ==========================
// LIMPIAR EGRESOS DE LA JORNADA
// ==========================

for(const egreso of egresos.docs){

    await deleteDoc(egreso.ref);

}

    await generarExcelCierre(jornada);

await updateDoc(

    doc(db,"caja","actual"),

    {

        abierta: false,

        cierre: serverTimestamp()

    }

);


// ==========================
// ACTUALIZAR PANTALLA
// CAJA CERRADA
// ==========================

boton.textContent = "🔒 Caja Cerrada";

boton.disabled = true;


// ==========================
// MOSTRAR QUE NO HAY JORNADA
// ==========================

document.querySelector(
    "p[style*='color:#777']"
).innerHTML = `
    <strong style="color:#e74c3c;">
        🔴 No hay una jornada abierta
    </strong>
`;


// ==========================
// RESUMEN EN CERO
// ==========================

document.querySelector(".resumenCaja").innerHTML = `

    <div class="cardResumen">

        <div class="tituloResumen">
            💰 Dinero en caja
        </div>

        <div class="valorResumen">
            $ 0
        </div>

    </div>


    <div class="cardResumen">

        <div class="tituloResumen">
            💵 Caja Inicial
        </div>

        <div class="valorResumen">
            $ 0
        </div>

    </div>


    <div class="cardResumen">

        <div class="tituloResumen">
            💸 Egresos
        </div>

        <div class="valorResumen">
            $ 0
        </div>

    </div>


    <div class="cardResumen">

        <div class="tituloResumen">
            🧾 Ventas
        </div>

        <div class="valorResumen">
            0
        </div>

    </div>


    <div class="cardResumen">

        <div class="tituloResumen">
            💰 Total
        </div>

        <div class="valorResumen">
            $ 0
        </div>

    </div>

`;


// ==========================
// MEDIOS DE PAGO EN CERO
// ==========================

document.querySelector(".cardCaja").innerHTML = `

    <h2>
        💳 Medios de Pago
    </h2>

    <div class="filaCaja">

        <span>💵 Efectivo</span>

        <strong>$ 0</strong>

    </div>

    <div class="filaCaja">

        <span>📱 MercadoPago</span>

        <strong>$ 0</strong>

    </div>

    <div class="filaCaja">

        <span>🏦 Banco Provincia</span>

        <strong>$ 0</strong>

    </div>

    <div class="filaCaja">

        <span>📒 Cuenta Corriente</span>

        <strong>$ 0</strong>

    </div>

    <div class="filaCaja">

        <span>⏳ Pendiente</span>

        <strong>$ 0</strong>

    </div>

`;


console.log("Caja cerrada correctamente");

alert("✅ Caja cerrada correctamente.");

};

document.getElementById("btnImprimirResumen").onclick = () => {

    imprimirResumenCaja({

        jornada,

        montoInicial,

        total,

        esperadoEnCaja,

        totalEgresos,

        efectivo,

        mercadoPago,

        bancoProvincia,

        cuenta,

        pendiente,

        cantidadVentas,

        productosVendidos,

        ticketPromedio

    });

};

}