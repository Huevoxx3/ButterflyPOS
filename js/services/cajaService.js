import { db } from "../firebase.js";

import {

    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let jornadaCache = null;

export async function obtenerJornadaActual() {

    // Si ya la tenemos en memoria, la devolvemos
    if (jornadaCache) {
        return jornadaCache;
    }

    console.log("ENTRÓ A obtenerJornadaActual");

    const referencia = doc(db, "caja", "actual");
    const documento = await getDoc(referencia);
    const caja = documento.data();

    if (caja.abierta) {

        console.log("Caja abierta");

        jornadaCache = caja.fechaJornada;

        return jornadaCache;
    }

    console.log("No hay caja abierta.");

    return null;
}

export async function abrirCaja({
    usuario,
    turno,
    montoInicial
}){

    const referencia = doc(db,"caja","actual");

    const hoy = new Date();

    const jornada =
`${hoy.getFullYear()}-${
String(hoy.getMonth()+1).padStart(2,"0")
}-${
String(hoy.getDate()).padStart(2,"0")
}`;
// ==========================
// VERIFICAR SI YA EXISTE
// UN CIERRE PARA HOY
// ==========================

const cierre = await getDocs(

    query(

        collection(db,"cierresCaja"),

        where("jornada","==",`${jornada}_${turno}`)

    )

);

if(!cierre.empty){

    alert(

        "⚠ La jornada de hoy ya fue cerrada.\n\nNo es posible volver a abrir la caja."

    );

    return false;

}

    await updateDoc(

        referencia,

        {
    abierta: true,
    fecha: jornada,
    turno,
    fechaJornada: `${jornada}_${turno}`,
    montoInicial: Number(montoInicial) || 0,
    apertura: serverTimestamp(),
    cierre: null,
    usuario
}

    );

    jornadaCache = `${jornada}_${turno}`;

    return true;

}