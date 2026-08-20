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

function imprimirCierre(cierre){

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

    const jornadaTexto =
        cierre.jornada
            ? cierre.jornada
                .replace("_MEDIODIA"," - MEDIODÍA")
                .replace("_NOCHE"," - NOCHE")
            : "-";


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

Jornada: <strong>${jornadaTexto}</strong>

</div>

</div>


<div class="seccion">

<h2>💰 Resumen de Caja</h2>

<div class="fila">

<span>Caja inicial</span>

<strong>

$ ${Number(cierre.montoInicial || 0).toLocaleString()}

</strong>

</div>

<div class="fila">

<span>Total de ventas</span>

<strong>

$ ${Number(cierre.total || 0).toLocaleString()}

</strong>

</div>

<div class="fila">

<span>Egresos</span>

<strong>

$ ${Number(cierre.totalEgresos || 0).toLocaleString()}

</strong>

</div>

<div class="fila destacado">

<span>Efectivo esperado</span>

<strong>

$ ${(

    Number(cierre.montoInicial || 0)

    + Number(cierre.efectivo || 0)

    - Number(cierre.totalEgresos || 0)

).toLocaleString()}

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

${Number(cierre.cantidadVentas || 0)}

</div>

</div>

<div class="card">

<div class="label">

Productos

</div>

<div class="valor">

${Number(cierre.productosVendidos || 0)}

</div>

</div>

<div class="card">

<div class="label">

Ticket promedio

</div>

<div class="valor">

$ ${Number(cierre.ticketPromedio || 0).toLocaleString()}

</div>

</div>

</div>

</div>


<div class="seccion">

<h2>💳 Medios de Pago</h2>

<div class="fila">

<span>💵 Efectivo</span>

<strong>

$ ${Number(cierre.efectivo || 0).toLocaleString()}

</strong>

</div>

<div class="fila">

<span>📱 MercadoPago</span>

<strong>

$ ${Number(cierre.mercadoPago || 0).toLocaleString()}

</strong>

</div>

<div class="fila">

<span>🏦 Banco Provincia</span>

<strong>

$ ${Number(cierre.bancoProvincia || 0).toLocaleString()}

</strong>

</div>

<div class="fila">

<span>📒 Cuenta Corriente</span>

<strong>

$ ${Number(cierre.cuenta || 0).toLocaleString()}

</strong>

</div>

<div class="fila">

<span>⏳ Pendiente</span>

<strong>

$ ${Number(cierre.pendiente || 0).toLocaleString()}

</strong>

</div>

</div>


<div class="total">

Resumen histórico generado desde el sistema Butterfly

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

${(() => {

    const partes = cierre.jornada.split("-");

    const fecha = `${partes[2].split("_")[0]}/${partes[1]}/${partes[0]}`;

    const turno = partes[2].split("_")[1];

    return `${fecha}_${turno === "MEDIODIA" ? "MEDIODÍA" : turno}`;

})()}

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

📅 Jornada ${(() => {

    const partes = cierre.jornada.split("-");

    const fecha = `${partes[2].split("_")[0]}/${partes[1]}/${partes[0]}`;

    const turno = partes[2].split("_")[1];

    return `${fecha}_${turno === "MEDIODIA" ? "MEDIODÍA" : turno}`;

})()}

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

<strong>
$ ${Number(cierre.efectivo || 0).toLocaleString()}
</strong>

</div>

<div class="filaDetalle">

<span>📱 MercadoPago</span>

<strong>
$ ${Number(cierre.mercadoPago || 0).toLocaleString()}
</strong>

</div>

<div class="filaDetalle">

<span>🏦 Banco Provincia</span>

<strong>
$ ${Number(cierre.bancoProvincia || 0).toLocaleString()}
</strong>

</div>

<div class="filaDetalle">

<span>📒 Cuenta Corriente</span>

<strong>
$ ${Number(cierre.cuenta || 0).toLocaleString()}
</strong>

</div>

<div class="filaDetalle">

<span>⏳ Pendiente</span>

<strong>
$ ${Number(cierre.pendiente || 0).toLocaleString()}
</strong>

</div>

<hr>

<div style="margin-top:20px;">

<button
    id="btnImprimirCierre"
    class="btnVerde">

🖨️ Imprimir Cierre

</button>

</div>
`;

const botonImprimir = document.getElementById(
    "btnImprimirCierre"
);

if(botonImprimir){

    botonImprimir.onclick = function(){

        imprimirCierre(cierre);

    };

}

        };

    });

}