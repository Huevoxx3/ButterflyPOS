import { db } from "../firebase.js";

import {

    collection,
    getDocs,
    query,
    where

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function obtenerVentaPorPedido(pedidoId){

    const snapshot = await getDocs(

        query(

            collection(db,"ventas"),

            where("pedidoId","==",pedidoId)

        )

    );

    if(snapshot.empty){

        return null;

    }

    return {

        id: snapshot.docs[0].id,

        ...snapshot.docs[0].data()

    };

}