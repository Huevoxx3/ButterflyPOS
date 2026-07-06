import { db } from "../firebase.js";

import {

    doc,
    getDoc,
    updateDoc,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function obtenerJornadaActual(){

    console.log("ENTRÓ A obtenerJornadaActual");

    const referencia = doc(db,"caja","actual");

    const documento = await getDoc(referencia);

    const caja = documento.data();

    // Si la jornada sigue abierta
    if(caja.abierta){

        console.log("Caja abierta");

        return caja.fechaJornada;

    }

// ==========================
// CREAR NUEVA JORNADA
// ==========================

const fechaAnterior = new Date(caja.fechaJornada + "T00:00:00");

fechaAnterior.setDate(fechaAnterior.getDate() + 1);

const nuevaJornada =
`${fechaAnterior.getFullYear()}-${
String(fechaAnterior.getMonth()+1).padStart(2,"0")
}-${
String(fechaAnterior.getDate()).padStart(2,"0")
}`;

console.log("Abriendo nueva jornada:", nuevaJornada);

await updateDoc(

    referencia,

    {

        abierta: true,

        fechaJornada: nuevaJornada,

        apertura: serverTimestamp(),

        cierre: null

    }

);

return nuevaJornada;
}