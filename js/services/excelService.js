import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

import { db } from "../firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================
// FORMATO DINERO
// ==========================

function dinero(valor){

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0
        }
    ).format(Number(valor) || 0);

}


// ==========================
// FORMATO FECHA / HORA
// ==========================

function horaFecha(valor){

    if(!valor?.toDate) return "";

    return valor.toDate().toLocaleString(
        "es-AR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}

function hora(valor){

    if(!valor?.toDate) return "";

    return valor.toDate().toLocaleTimeString(
        "es-AR",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


// ==========================
// GENERAR EXCEL
// ==========================

export async function generarExcelCierre(jornada){


    // ==========================
    // OBTENER CIERRE
    // ==========================

    const cierresSnapshot = await getDocs(

        query(

            collection(db,"cierresCaja"),

            where("jornada","==",jornada)

        )

    );


    const cierreDocumento =
        cierresSnapshot.docs[0];

    const cierre =
        cierreDocumento
            ? cierreDocumento.data()
            : null;


    if(!cierre){

        alert(
            "⚠️ No se encontró el cierre correspondiente a esta jornada."
        );

        return;

    }


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

            where("jornada","==",jornada),

            orderBy("horaPedido","asc")

        )

    );


    // ==========================
    // DATOS DEL CIERRE
    // ==========================

    const montoInicial =
        Number(cierre.montoInicial) || 0;

    const total =
        Number(cierre.total) || 0;

    const totalEgresos =
        Number(cierre.totalEgresos) || 0;

    const efectivo =
        Number(cierre.efectivo) || 0;

    const mercadoPago =
        Number(cierre.mercadoPago) || 0;

    const bancoProvincia =
        Number(cierre.bancoProvincia) || 0;

    const cuenta =
        Number(cierre.cuenta) || 0;

    const pendiente =
        Number(cierre.pendiente) || 0;

    const cantidadVentas =
        Number(cierre.cantidadVentas) || 0;

    const productosVendidos =
        Number(cierre.productosVendidos) || 0;

    const ticketPromedio =
        Number(cierre.ticketPromedio) || 0;


    const efectivoEsperado =
        montoInicial
        + efectivo
        - totalEgresos;


    // ==========================
    // EGRESOS
    // ==========================

    const egresos =
        Array.isArray(cierre.egresos)
            ? cierre.egresos
            : [];


    // ==========================
    // LIBRO
    // ==========================

    const libro =
        XLSX.utils.book_new();


    // =====================================================
    // HOJA RESUMEN
    // =====================================================

    const resumen = [

        ["BUTTERFLY POS"],

        ["CIERRE DE CAJA"],

        [],

        ["Jornada", jornada],

        [
            "Responsable",
            cierre.usuario?.nombre
                || cierre.usuario
                || ""
        ],

        [
            "Apertura",
            horaFecha(cierre.apertura)
        ],

        [
            "Cierre",
            horaFecha(cierre.cierre)
        ],

        [],

        ["RESUMEN DE CAJA"],

        ["Caja inicial", dinero(montoInicial)],

        ["Total ventas", dinero(total)],

        ["Total egresos", dinero(totalEgresos)],

        ["Efectivo esperado", dinero(efectivoEsperado)],

        [],

        ["MEDIOS DE PAGO"],

        ["Efectivo", dinero(efectivo)],

        ["MercadoPago", dinero(mercadoPago)],

        ["Banco Provincia", dinero(bancoProvincia)],

        ["Cuenta Corriente", dinero(cuenta)],

        ["Pendiente", dinero(pendiente)],

        [],

        ["ESTADÍSTICAS"],

        ["Cantidad de ventas", cantidadVentas],

        ["Productos vendidos", productosVendidos],

        ["Ticket promedio", dinero(ticketPromedio)]

    ];


    const hojaResumen =
        XLSX.utils.aoa_to_sheet(resumen);


    XLSX.utils.book_append_sheet(

        libro,

        hojaResumen,

        "Resumen"

    );


    // =====================================================
    // HOJA VENTAS
    // =====================================================

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

        const venta =
            documento.data();


        let medioPago =
            venta.medioPago || "";


        // Ventas nuevas con múltiples medios

        if(
            venta.mediosPago
            &&
            venta.mediosPago.length
        ){

            medioPago =
                venta.mediosPago
                    .map(p =>
                        `${p.medio}: ${dinero(p.importe)}`
                    )
                    .join(" | ");

        }


        datosVentas.push([

            venta.mesa || "",

            venta.mozo || "",

            medioPago,

            dinero(venta.subtotal),

            venta.descuentoGeneral || 0,

            dinero(venta.totalCobrado)

        ]);

    });


    const hojaVentas =
        XLSX.utils.aoa_to_sheet(datosVentas);


    XLSX.utils.book_append_sheet(

        libro,

        hojaVentas,

        "Ventas"

    );


    // =====================================================
    // HOJA PRODUCTOS
    // =====================================================

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


    ventas.forEach(documento => {

        const venta =
            documento.data();


        const productos =
            venta.productos || [];


        productos.forEach(producto => {


            const totalProducto =

                producto.invitado

                ?

                0

                :

                (
                    Number(producto.precio) || 0
                )

                *

                (
                    Number(producto.cantidad) || 0
                )

                *

                (
                    1 -
                    (
                        Number(producto.descuento) || 0
                    ) / 100
                );


            datosProductos.push([

                venta.mesa || "",

                producto.nombre || "",

                producto.cantidad || 0,

                dinero(producto.precio),

                producto.descuento || 0,

                producto.invitado
                    ? "SI"
                    : "NO",

                producto.motivoNoCobrar
                    ||
                    producto.motivoDescuento
                    ||
                    "",

                dinero(totalProducto)

            ]);

        });

    });


    const hojaProductos =
        XLSX.utils.aoa_to_sheet(
            datosProductos
        );


    XLSX.utils.book_append_sheet(

        libro,

        hojaProductos,

        "Productos"

    );


    // =====================================================
    // HOJA EGRESOS
    // =====================================================

    const datosEgresos = [

        [
            "Hora",
            "Tipo",
            "Concepto",
            "Empleado",
            "Importe",
            "Observación"
        ]

    ];


    egresos.forEach(egreso => {

        datosEgresos.push([

            hora(egreso.fecha),

            egreso.tipo || "",

            egreso.concepto || "",

            egreso.empleado || "",

            dinero(egreso.importe),

            egreso.observacion || ""

        ]);

    });


    // Si no hubo egresos

    if(egresos.length === 0){

        datosEgresos.push([

            "",
            "",
            "No hubo egresos en esta jornada.",
            "",
            dinero(0),
            ""

        ]);

    }


    const hojaEgresos =
        XLSX.utils.aoa_to_sheet(
            datosEgresos
        );


    XLSX.utils.book_append_sheet(

        libro,

        hojaEgresos,

        "Egresos"

    );


    // =====================================================
    // HOJA ACTIVIDAD
    // =====================================================

    const datosActividad = [

        [
            "Hora",
            "Usuario",
            "Módulo",
            "Acción",
            "Descripción"
        ]

    ];


    actividad.forEach(documento => {

        const a =
            documento.data();


        datosActividad.push([

            hora(a.fecha),

            a.usuario || "",

            a.modulo || "",

            a.accion || "",

            a.descripcion || ""

        ]);

    });


    const hojaActividad =
        XLSX.utils.aoa_to_sheet(
            datosActividad
        );


    XLSX.utils.book_append_sheet(

        libro,

        hojaActividad,

        "Actividad"

    );


    // =====================================================
    // HOJA COCINA
    // =====================================================

    const datosCocina = [

        [
            "Mesa",
            "Producto",
            "Estado"
        ]

    ];


    cocina.forEach(documento => {

        const c =
            documento.data();


        datosCocina.push([

            c.mesa || "",

            c.nombre || "",

            c.estado || ""

        ]);

    });


    const hojaCocina =
        XLSX.utils.aoa_to_sheet(
            datosCocina
        );


    XLSX.utils.book_append_sheet(

        libro,

        hojaCocina,

        "Cocina"

    );


    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    let productosVendidosCalculados = 0;

    let totalDescuentos = 0;

    let totalInvitados = 0;


    const rankingProductos = {};

    const rankingMozos = {};


    let mejorMesa = "";

    let mayorConsumo = 0;


    ventas.forEach(documento => {

        const venta =
            documento.data();


        const totalVenta =
            Number(venta.totalCobrado) || 0;


        // ==========================
        // MESA CON MAYOR CONSUMO
        // ==========================

        if(totalVenta > mayorConsumo){

            mayorConsumo =
                totalVenta;

            mejorMesa =
                venta.mesa || "";

        }


        // ==========================
        // RANKING MOZOS
        // ==========================

        const mozo =
            venta.mozo || "Sin asignar";


        rankingMozos[mozo] =

            (
                rankingMozos[mozo]
                || 0
            )

            +

            totalVenta;


        // ==========================
        // PRODUCTOS
        // ==========================

        const productos =
            venta.productos || [];


        productos.forEach(producto => {

            const cantidad =
                Number(producto.cantidad) || 0;

            const precio =
                Number(producto.precio) || 0;

            const descuento =
                Number(producto.descuento) || 0;


            productosVendidosCalculados +=
                cantidad;


            const nombre =
                producto.nombre
                || "Sin nombre";


            rankingProductos[nombre] =

                (
                    rankingProductos[nombre]
                    || 0
                )

                +

                cantidad;


            if(producto.invitado){

                totalInvitados +=

                    precio * cantidad;

            }


            if(descuento){

                totalDescuentos +=

                    (
                        precio * cantidad
                    )

                    *

                    (
                        descuento / 100
                    );

            }

        });

    });


    const productoTop =

        Object.entries(
            rankingProductos
        )

        .sort(
            (a,b) =>
                b[1] - a[1]
        )[0];


    const mozoTop =

        Object.entries(
            rankingMozos
        )

        .sort(
            (a,b) =>
                b[1] - a[1]
        )[0];


    const estadisticas = [

        ["ESTADÍSTICAS"],

        [],

        [
            "Productos vendidos",
            productosVendidosCalculados
        ],

        [
            "Producto más vendido",
            productoTop
                ? productoTop[0]
                : ""
        ],

        [
            "Cantidad",
            productoTop
                ? productoTop[1]
                : ""
        ],

        [],

        [
            "Mozo con mayor facturación",
            mozoTop
                ? mozoTop[0]
                : ""
        ],

        [
            "Facturación",
            mozoTop
                ? dinero(mozoTop[1])
                : dinero(0)
        ],

        [],

        [
            "Mesa con mayor consumo",
            mejorMesa
        ],

        [
            "Importe",
            dinero(mayorConsumo)
        ],

        [],

        [
            "Total descuentos",
            dinero(totalDescuentos)
        ],

        [
            "Productos invitados",
            dinero(totalInvitados)
        ]

    ];


    const hojaEstadisticas =
        XLSX.utils.aoa_to_sheet(
            estadisticas
        );


    XLSX.utils.book_append_sheet(

        libro,

        hojaEstadisticas,

        "Estadísticas"

    );


    // =====================================================
    // AJUSTAR ANCHOS
    // =====================================================

    const hojas = [

        hojaResumen,
        hojaVentas,
        hojaProductos,
        hojaEgresos,
        hojaActividad,
        hojaCocina,
        hojaEstadisticas

    ];


    hojas.forEach(hoja => {

        if(!hoja["!ref"]) return;


        const rango =
            XLSX.utils.decode_range(
                hoja["!ref"]
            );


        const anchos = [];


        for(

            let C = rango.s.c;

            C <= rango.e.c;

            C++

        ){

            let max = 15;


            for(

                let R = rango.s.r;

                R <= rango.e.r;

                R++

            ){

                const celda =

                    hoja[
                        XLSX.utils.encode_cell({
                            r:R,
                            c:C
                        })
                    ];


                if(celda){

                    max = Math.max(

                        max,

                        String(celda.v).length + 2

                    );

                }

            }


            // Limitar columnas exageradamente largas

            max =
                Math.min(max, 45);


            anchos.push({

                wch:max

            });

        }


        hoja["!cols"] =
            anchos;

    });


    // ==========================
    // CONGELAR PRIMERA FILA
    // ==========================

    hojaVentas["!freeze"] = {
        xSplit:0,
        ySplit:1
    };

    hojaProductos["!freeze"] = {
        xSplit:0,
        ySplit:1
    };

    hojaEgresos["!freeze"] = {
        xSplit:0,
        ySplit:1
    };

    hojaActividad["!freeze"] = {
        xSplit:0,
        ySplit:1
    };

    hojaCocina["!freeze"] = {
        xSplit:0,
        ySplit:1
    };


    // ==========================
    // FILTROS
    // ==========================

    if(ventas.size > 0){

        hojaVentas["!autofilter"] = {
            ref: hojaVentas["!ref"]
        };

    }


    if(datosProductos.length > 1){

        hojaProductos["!autofilter"] = {
            ref: hojaProductos["!ref"]
        };

    }


    if(datosEgresos.length > 1){

        hojaEgresos["!autofilter"] = {
            ref: hojaEgresos["!ref"]
        };

    }


    if(actividad.size > 0){

        hojaActividad["!autofilter"] = {
            ref: hojaActividad["!ref"]
        };

    }


    // =====================================================
    // DESCARGAR
    // =====================================================

    XLSX.writeFile(

        libro,

        `Butterfly_Cierre_${jornada}.xlsx`

    );

}