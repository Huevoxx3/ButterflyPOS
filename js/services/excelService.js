import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

import { db } from "../firebase.js";

import {

    collection,
    getDocs,
    query,
    where

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

        ["Total", total]

    ];

    const hoja = XLSX.utils.aoa_to_sheet(resumen);

    XLSX.utils.book_append_sheet(

        libro,

        hoja,

        "Resumen"

    );

    // ==========================
    // DESCARGAR
    // ==========================

    XLSX.writeFile(

        libro,

        `Butterfly_Cierre_${jornada}.xlsx`

    );

}