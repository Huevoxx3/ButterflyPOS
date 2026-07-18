import { db } from "../firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let cartaCache = null;

export async function obtenerCarta() {

    if (cartaCache) {

        return cartaCache;

    }

    const snapshot = await getDocs(
        collection(db, "carta")
    );

    cartaCache = [];

    snapshot.forEach(doc => {

        cartaCache.push({

            id: doc.id,

            ...doc.data()

        });

    });

    return cartaCache;

}

export async function obtenerProducto(id) {

    const carta = await obtenerCarta();

    return carta.find(

        producto => producto.id === id

    );

}

export async function obtenerCategoria(id) {

    const producto = await obtenerProducto(id);

    return producto?.categoria ?? null;

}