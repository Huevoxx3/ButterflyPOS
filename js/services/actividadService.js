import { db } from "../firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function registrarActividad(

    usuario,
    modulo,
    accion,
    descripcion = "",
    extra = {}

){

    await addDoc(

        collection(db,"actividad"),

        {

            usuario,

            modulo,

            accion,

            descripcion,

            fecha: serverTimestamp(),
            
            ...extra

        }

    );

}