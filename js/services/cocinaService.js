import { db } from "../firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function obtenerPendientesCocina(pedidoId, nombre) {

    return await getDocs(
        query(
            collection(db, "cocina"),
            where("pedidoId", "==", pedidoId),
            where("nombre", "==", nombre),
            where("estado", "==", "Pendiente")
        )
    );

}