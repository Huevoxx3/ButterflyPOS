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

*{
    box-sizing:border-box;
}

body{

    font-family:Arial,Helvetica,sans-serif;

    margin:0;

    padding:35px;

    color:#202938;

    background:white;

}

.contenedor{

    max-width:750px;

    margin:auto;

}

.cabecera{

    text-align:center;

    border-bottom:3px solid #202938;

    padding-bottom:18px;

    margin-bottom:25px;

}

.logo{

    font-size:30px;

    font-weight:bold;

    margin-bottom:5px;

}

.titulo{

    font-size:22px;

    font-weight:bold;

}

.jornada{

    margin-top:10px;

    color:#666;

    font-size:14px;

}

.seccion{

    margin-bottom:25px;

}

.seccion h2{

    font-size:16px;

    margin:0 0 10px 0;

    padding-bottom:7px;

    border-bottom:1px solid #ddd;

}

.fila{

    display:flex;

    justify-content:space-between;

    padding:8px 0;

    border-bottom:1px solid #eee;

}

.fila strong{

    font-size:15px;

}

.destacado{

    font-size:20px;

    font-weight:bold;

    padding:12px 0;

}

.grid{

    display:grid;

    grid-template-columns:repeat(3,1fr);

    gap:10px;

}

.card{

    border:1px solid #ddd;

    border-radius:8px;

    padding:12px;

    text-align:center;

}

.card .label{

    font-size:12px;

    color:#666;

    margin-bottom:6px;

}

.card .valor{

    font-size:18px;

    font-weight:bold;

}

.total{

    margin-top:30px;

    padding-top:15px;

    border-top:3px solid #202938;

    text-align:center;

    font-size:13px;

    color:#666;

}

@media print{

    body{

        padding:15px;

    }

    .no-print{

        display:none;

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

        <div class="fila">

            <span>Caja inicial</span>

            <strong>
                $ ${montoInicial.toLocaleString()}
            </strong>

        </div>

        <div class="fila">

            <span>Total de ventas</span>

            <strong>
                $ ${total.toLocaleString()}
            </strong>

        </div>

        <div class="fila">

            <span>Egresos</span>

            <strong>
                $ ${totalEgresos.toLocaleString()}
            </strong>

        </div>

        <div class="fila destacado">

            <span>Efectivo esperado</span>

            <strong>
                $ ${esperadoEnCaja.toLocaleString()}
            </strong>

        </div>

    </div>


    <div class="seccion">

        <h2>📊 Estadísticas</h2>

        <div class="grid">

            <div class="card">

                <div class="label">
                    Ventas
                </div>

                <div class="valor">
                    ${cantidadVentas}
                </div>

            </div>

            <div class="card">

                <div class="label">
                    Productos
                </div>

                <div class="valor">
                    ${productosVendidos}
                </div>

            </div>

            <div class="card">

                <div class="label">
                    Ticket promedio
                </div>

                <div class="valor">
                    $ ${ticketPromedio.toLocaleString()}
                </div>

            </div>

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

if (venta.mediosPago && venta.mediosPago.length > 0) {

    venta.mediosPago.forEach(pago => {

        switch (pago.medio) {

            case "Efectivo":
                efectivo += pago.importe;
                break;

            case "MercadoPago":
                mercadoPago += pago.importe;
                break;

            case "Banco Provincia":
                bancoProvincia += pago.importe;
                break;

            case "Cuenta Corriente":
                cuenta += pago.importe;
                break;

            case "Pendiente":
                pendiente += pago.importe;
                break;

        }

    });

} else {

    // Compatibilidad con ventas anteriores

    switch (venta.medioPago) {

        case "Efectivo":
            efectivo += venta.totalCobrado;
            break;

        case "MercadoPago":
            mercadoPago += venta.totalCobrado;
            break;

        case "Banco Provincia":
            bancoProvincia += venta.totalCobrado;
            break;

        case "Cuenta Corriente":
            cuenta += venta.totalCobrado;
            break;

        case "Pendiente":
            pendiente += venta.totalCobrado;
            break;

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

            💰 Total

        </div>

        <div class="valorResumen">

            $ ${total.toLocaleString()}

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

        🏦 Efectivo Esperado

    </div>

    <div class="valorResumen">

        $ ${esperadoEnCaja.toLocaleString()}

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
            💰 Total
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
            🏦 Efectivo Esperado
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
            🍽 Productos
        </div>

        <div class="valorResumen">
            0
        </div>

    </div>

    <div class="cardResumen">

        <div class="tituloResumen">
            📈 Ticket Promedio
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