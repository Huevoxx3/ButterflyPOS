import { db } from "../firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function registrarActividad(usuario, accion) {

    await addDoc(

        collection(db, "actividad"),

        {

            usuario,

            accion,

            fecha: serverTimestamp()

        }

    );

}