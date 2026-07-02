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
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { registrarActividad } from "./actividadService.js";

export async function agregarProductoPedido(
    mesa,
    productoId,
    nombre,
    precio
){
    console.log("ENTRO A agregarProductoPedido");

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

        const nuevoItem = await addDoc(itemsRef,{

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
    
// ==========================
// ENVIAR A COCINA
// ==========================
console.log("ANTES DE COCINA");
await addDoc(

    collection(db,"cocina"),

    {

        pedidoId: mesa.pedidoId,

        mesa: mesa.numero,

        nombre: nombre,

        observacion: "",

        estado: "Pendiente",

        horaPedido: serverTimestamp(),

        horaLista: null,

        horaEntrega: null,

        requiereConfirmacion: false,

        ultimaModificacion: null

    }

);
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

export async function guardarEdicionPedido(
    mesa,
    pedidoTemporal,
    itemsEliminados
){

    // ===========================
    // ACTUALIZAR ITEMS
    // ===========================

    for(const item of pedidoTemporal){

        await updateDoc(

            doc(
                db,
                "pedidos",
                mesa.pedidoId,
                "items",
                item.id
            ),

            {

                cantidad: item.cantidad,

                observacion: item.observacion || ""

            }

        );
        const cocina = await getDocs(

    query(

        collection(db,"cocina"),

        where("pedidoId","==",mesa.pedidoId),

        where("nombre","==",item.nombre),

        where("estado","==","Pendiente")

    )

);

for(const producto of cocina.docs){

    await updateDoc(

        producto.ref,

        {

            observacion: item.observacion || "",

            requiereConfirmacion: true,

            ultimaModificacion: serverTimestamp()

        }

    );

}

    }

    // ===========================
    // ELIMINAR ITEMS BORRADOS
    // ===========================

    for(const item of itemsEliminados){

        await deleteDoc(

            doc(
                db,
                "pedidos",
                mesa.pedidoId,
                "items",
                item.id
            )

        );

    }

    // ===========================
    // RECALCULAR TOTAL
    // ===========================

const snapshot = await getDocs(

    collection(
        db,
        "pedidos",
        mesa.pedidoId,
        "items"
    )

);

let total = 0;

snapshot.forEach(doc => {

    const item = doc.data();

    total += item.precio * item.cantidad;

});

    await updateDoc(

        doc(db,"pedidos",mesa.pedidoId),

        {

            total

        }

    );

    await updateDoc(

        doc(db,"mesas",String(mesa.numero)),

        {

            total

        }

    );

}