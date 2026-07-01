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

        // Login en Firebase Authentication
        await signInWithEmailAndPassword(
            auth,
            datos.email,
            password
        );

        // Obtener nuevamente el documento usando el UID
        const usuarioDoc = await getDoc(doc(db, "usuarios", auth.currentUser.uid));

        return usuarioDoc.data();

    }

    async logout() {

        await signOut(auth);

    }

}

export default new Auth();