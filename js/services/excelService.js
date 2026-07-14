import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

import { db } from "../firebase.js";

import {

    collection,
    getDocs,
    query,
    where,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

function dinero(valor){

    return new Intl.NumberFormat(

        "es-AR",

        {

            style: "currency",

            currency: "ARS",

            minimumFractionDigits: 0

        }

    ).format(valor);

}

export async function generarExcelCierre(jornada){

    // ==========================
    // OBTENER VENTAS
    // ==========================

    const ventas = await getDocs(

        query(

            collection(db,"ventas"),

            where("jornada","==",jornada)

        )

    );

// ==========================
// OBTENER ACTIVIDAD
// ==========================

const actividad = await getDocs(

    query(

        collection(db,"actividad"),

        where("jornada","==",jornada),

        orderBy("fecha","asc")

    )

);

// ==========================
// OBTENER COCINA
// ==========================

const cocina = await getDocs(

    query(

        collection(db,"cocina"),

        query(

    collection(db,"cocina"),

    where("jornada","==",jornada),

    orderBy("horaPedido","asc")

)

    )

);
    // ==========================
// HOJA VENTAS
// ==========================

const datosVentas = [

    [
        "Mesa",
        "Mozo",
        "Medio de Pago",
        "Subtotal",
        "Descuento %",
        "Total Cobrado"
    ]

];

ventas.forEach(documento => {

    const venta = documento.data();

    datosVentas.push([

        venta.mesa,

        venta.mozo,

        venta.medioPago,

        dinero(venta.subtotal),

        venta.descuentoGeneral || 0,

        dinero(venta.totalCobrado)

    ]);

});

    let total = 0;

    let cantidad = 0;

    ventas.forEach(doc=>{

        cantidad++;

        total += doc.data().totalCobrado;

    });



    // ==========================
    // CREAR LIBRO
    // ==========================

    const libro = XLSX.utils.book_new();

    // ==========================
    // HOJA RESUMEN
    // ==========================

    const resumen = [

        ["BUTTERFLY POS"],

        [],

        ["CIERRE DE CAJA"],

        [],

        ["Jornada", jornada],

        ["Cantidad de Ventas", cantidad],

        ["Total", dinero(total)]

    ];

    const hoja = XLSX.utils.aoa_to_sheet(resumen);

    XLSX.utils.book_append_sheet(

        libro,

        hoja,

        "Resumen"

    );

    const hojaVentas = XLSX.utils.aoa_to_sheet(datosVentas);

XLSX.utils.book_append_sheet(

    libro,

    hojaVentas,

    "Ventas"

);

const datosActividad = [

    [
        "Hora",
        "Usuario",
        "Módulo",
        "Acción",
        "Descripción"
    ]

];

actividad.forEach(doc=>{

    const a = doc.data();

const hora = a.fecha?.toDate
    ? a.fecha.toDate().toLocaleTimeString(
        "es-AR",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
      )
    : "";

datosActividad.push([

    hora,

    a.usuario,

    a.modulo,

    a.accion,

    a.descripcion

]);

});



const hojaActividad =
XLSX.utils.aoa_to_sheet(datosActividad);

XLSX.utils.book_append_sheet(

    libro,

    hojaActividad,

    "Actividad"

);

const datosCocina = [

    [

        "Mesa",

        "Producto",

        "Estado"

    ]

];

cocina.forEach(doc=>{

    const c = doc.data();

    datosCocina.push([

        c.mesa,

        c.nombre,

        c.estado

    ]);

});

const hojaCocina =
XLSX.utils.aoa_to_sheet(datosCocina);

XLSX.utils.book_append_sheet(

    libro,

    hojaCocina,

    "Cocina"

);


// ==========================
// HOJA PRODUCTOS VENDIDOS
// ==========================

const datosProductos = [

    [
        "Mesa",
        "Producto",
        "Cantidad",
        "Precio",
        "Descuento %",
        "Invitado",
        "Motivo",
        "Total"
    ]

];

ventas.forEach(doc => {

    const venta = doc.data();

    venta.productos.forEach(producto => {

        const totalProducto =
            producto.invitado
            ? 0
            : producto.precio *
              producto.cantidad *
              (1 - (producto.descuento || 0) / 100);

        datosProductos.push([

            venta.mesa,

            producto.nombre,

            producto.cantidad,

            dinero(producto.precio),

            producto.descuento || 0,

            producto.invitado ? "SI" : "NO",

            producto.motivoNoCobrar ||
            producto.motivoDescuento ||
            "",

            dinero(totalProducto)

        ]);

    });

});

const hojaProductos =
XLSX.utils.aoa_to_sheet(datosProductos);

XLSX.utils.book_append_sheet(

    libro,

    hojaProductos,

    "Productos"

);

// ==========================
// HOJA ESTADÍSTICAS
// ==========================

let productosVendidos = 0;

let totalDescuentos = 0;

let totalInvitados = 0;

const rankingProductos = {};

const rankingMozos = {};

let mejorMesa = "";

let mayorConsumo = 0;

ventas.forEach(doc=>{

    const venta = doc.data();

    // Mesa con mayor consumo

    if(venta.totalCobrado > mayorConsumo){

        mayorConsumo = venta.totalCobrado;

        mejorMesa = venta.mesa;

    }

    // Ranking de mozos

    rankingMozos[venta.mozo] =
        (rankingMozos[venta.mozo] || 0)
        + venta.totalCobrado;

    venta.productos.forEach(producto=>{

        productosVendidos += producto.cantidad;

        rankingProductos[producto.nombre] =
            (rankingProductos[producto.nombre] || 0)
            + producto.cantidad;

        if(producto.invitado){

            totalInvitados +=
                producto.precio *
                producto.cantidad;

        }

        if(producto.descuento){

            totalDescuentos +=

                (producto.precio *
                 producto.cantidad)

                *

                (producto.descuento/100);

        }

    });

});

const productoTop =
Object.entries(rankingProductos)

.sort((a,b)=>b[1]-a[1])[0];

const mozoTop =
Object.entries(rankingMozos)

.sort((a,b)=>b[1]-a[1])[0];

const estadisticas = [

["ESTADÍSTICAS"],

[],

["Productos vendidos",productosVendidos],

["Producto más vendido",
productoTop ? productoTop[0] : ""],

["Cantidad",
productoTop ? productoTop[1] : ""],

[],

["Mozo con mayor facturación",
mozoTop ? mozoTop[0] : ""],

["Facturación",
mozoTop ? dinero(mozoTop[1]) : ""],

[],

["Mesa con mayor consumo",
mejorMesa],

["Importe",
dinero(mayorConsumo)],

[],

["Total descuentos",
dinero(totalDescuentos)],

["Productos invitados",
dinero(totalInvitados)]

];

const hojaEstadisticas =
XLSX.utils.aoa_to_sheet(estadisticas);

XLSX.utils.book_append_sheet(

    libro,

    hojaEstadisticas,

    "Estadísticas"

);
    // ==========================
    // DESCARGAR
    // ==========================

    const hojas = [

    hoja,
    hojaVentas,
    hojaActividad,
    hojaCocina,
    hojaProductos,
    hojaEstadisticas

];

hojas.forEach(h => {

    if(!h["!ref"]) return;

    const rango = XLSX.utils.decode_range(h["!ref"]);

    const anchos = [];

    for(let C = rango.s.c; C <= rango.e.c; C++){

        let max = 15;

        for(let R = rango.s.r; R <= rango.e.r; R++){

            const celda = h[XLSX.utils.encode_cell({r:R,c:C})];

            if(celda){

                max = Math.max(

                    max,

                    String(celda.v).length + 2

                );

            }

        }

        anchos.push({wch:max});

    }

    h["!cols"] = anchos;

});

    XLSX.writeFile(

        libro,

        `Butterfly_Cierre_${jornada}.xlsx`

    );

}