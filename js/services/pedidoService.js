import { db } from "../firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { registrarActividad } from "./actividadService.js";

export async function agregarProductoPedido(
    mesa,
    productoId,
    nombre,
    precio
){

    const itemsRef = collection(
        db,
        "pedidos",
        mesa.pedidoId,
        "items"
    );

    const consulta = query(
        itemsRef,
        where("productoId","==",productoId)
    );

    const resultado = await getDocs(consulta);

    if(resultado.empty){

        await addDoc(itemsRef,{

            productoId,

            nombre,

            precio,

            cantidad:1

        });

    }else{

        const item = resultado.docs[0];

        await updateDoc(

            doc(
                db,
                "pedidos",
                mesa.pedidoId,
                "items",
                item.id
            ),

            {

                cantidad:increment(1)

            }

        );

    }

    await updateDoc(

        doc(db,"pedidos",mesa.pedidoId),

        {

            total:increment(precio)

        }

    );

    await updateDoc(

        doc(db,"mesas",String(mesa.numero)),

        {

            total:increment(precio)

        }

    );

    const usuario = JSON.parse(
        sessionStorage.getItem("usuario")
    );

    await registrarActividad(

        usuario.nombre,

        `Agregó ${nombre} a Mesa ${mesa.numero}`

    );

}

export async function obtenerItemsPedido(pedidoId){

    const snapshot = await getDocs(

        collection(

            db,

            "pedidos",

            pedidoId,

            "items"

        )

    );

    const items = [];

    snapshot.forEach(doc => {

        items.push({

            id: doc.id,

            ...doc.data()

        });

    });

    return items;

}

export async function sumarCantidad(item, mesa){

    await updateDoc(
        doc(db,"pedidos",mesa.pedidoId,"items",item.id),
        {
            cantidad: increment(1)
        }
    );

    await updateDoc(
        doc(db,"pedidos",mesa.pedidoId),
        {
            total: increment(item.precio)
        }
    );

    await updateDoc(
        doc(db,"mesas",String(mesa.numero)),
        {
            total: increment(item.precio)
        }
    );

}

export async function restarCantidad(item, mesa){

    if(item.cantidad <= 1) return false;

    await updateDoc(
        doc(db,"pedidos",mesa.pedidoId,"items",item.id),
        {
            cantidad: increment(-1)
        }
    );

    await updateDoc(
        doc(db,"pedidos",mesa.pedidoId),
        {
            total: increment(-item.precio)
        }
    );

    await updateDoc(
        doc(db,"mesas",String(mesa.numero)),
        {
            total: increment(-item.precio)
        }
    );

    return true;

}

export async function eliminarItem(item, mesa){

    await deleteDoc(
        doc(db,"pedidos",mesa.pedidoId,"items",item.id)
    );

    await updateDoc(
        doc(db,"pedidos",mesa.pedidoId),
        {
            total: increment(-(item.precio * item.cantidad))
        }
    );

    await updateDoc(
        doc(db,"mesas",String(mesa.numero)),
        {
            total: increment(-(item.precio * item.cantidad))
        }
    );

}