import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

class Auth {

    async login(usuario, password) {

        // Buscar el usuario en Firestore
        const consulta = query(
            collection(db, "usuarios"),
            where("usuario", "==", usuario)
        );

        const resultado = await getDocs(consulta);

        if (resultado.empty) {

            throw new Error("Usuario inexistente.");

        }

        const documento = resultado.docs[0];

        const datos = documento.data();

        if (!datos.activo) {

            throw new Error("Usuario deshabilitado.");

        }

    // Validar contraseña

if(datos.password !== password){

    throw new Error("Contraseña incorrecta.");

}

// Devolver directamente el usuario

return {

    id: documento.id,

    ...datos

};
    }

    async logout() {

        await signOut(auth);

    }

}

export default new Auth();