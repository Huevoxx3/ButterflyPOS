import { obtenerJornadaActual } from "./cajaService.js";

import { db } from "../firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { registrarActividad } from "./actividadService.js";

    const usuario = JSON.parse(
        sessionStorage.getItem("usuario")
    );

import { obtenerCategoria } from "./cartaService.js";
import { obtenerPendientesCocina } from "./cocinaService.js";

export async function agregarProductoPedido(
    
    mesa,
    productoId,
    nombre,
    precio
){

    console.time("Agregar Producto");
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

    console.time("Buscar Item");
    const resultado = await getDocs(consulta);
    console.timeEnd("Buscar Item");

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
    
const categoria = await obtenerCategoria(productoId);

const categoriasExcluidas = [

    "Cerveza Artesanal",

    "Con Alcohol",

    "Sin Alcohol"

];

// ==========================
// ENVIAR A COCINA
// ==========================

console.time("Enviar Cocina");

const jornada = await obtenerJornadaActual();

console.log("ANTES DE COCINA");

if (!categoriasExcluidas.includes(categoria)) {

    await addDoc(
        collection(db, "cocina"),
        {
            pedidoId: mesa.pedidoId,
            mesa: mesa.numero,
            nombre,
            observacion: "",
            estado: "Pendiente",
            horaPedido: serverTimestamp(),
            horaLista: null,
            horaEntrega: null,
            requiereConfirmacion: false,
            ultimaModificacion: null,
            jornada
        }
    );

}

console.timeEnd("Enviar Cocina");
console.time("Actualizar Totales");

await Promise.all([

    updateDoc(
        doc(db,"pedidos",mesa.pedidoId),
        {
            total: increment(precio)
        }
    ),

    updateDoc(
        doc(db,"mesas",String(mesa.numero)),
        {
            total: increment(precio)
        }
    )

]);

console.timeEnd("Actualizar Totales");

    console.time("Registrar Actividad");
await registrarActividad(

    usuario.nombre,

    "Pedido",

    "Agregar Producto",

    `${nombre} - Mesa ${mesa.numero}`

);
console.timeEnd("Registrar Actividad");

console.timeEnd("Agregar Producto");

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

    console.log("ENTRÓ A eliminarItem");

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

    console.log("Mesa:", mesa);
console.log("Item:", item);
console.log("Mozo:", mesa.mozo);
console.log("Nombre:", item.nombre);
    // ==========================
    // REGISTRAR ACTIVIDAD
    // ==========================

    await registrarActividad(

        mesa.mozo,

        "Pedido",

        "Eliminar Producto",

        `${item.nombre} - Mesa ${mesa.numero}`

    );

}

export async function guardarEdicionPedido(

    mesa,

    pedidoOriginal,

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

const original = pedidoOriginal.find(

    p => p.id === item.id

);

const cambioObservacion =

    (original?.observacion || "") !==
    (item.observacion || "");
    const cantidadOriginal = original?.cantidad || 0;
    const cantidadNueva = item.cantidad;

const cocina = await obtenerPendientesCocina(
    mesa.pedidoId,
    item.nombre
);

if(cambioObservacion){

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

const categoria = await obtenerCategoria(item.productoId);

const categoriasExcluidas = [

    "Cerveza Artesanal",

    "Con Alcohol",

    "Sin Alcohol"

];

const jornada = await obtenerJornadaActual();

if(

    cantidadNueva > cantidadOriginal &&

    !categoriasExcluidas.includes(categoria)

){

    for(

        let i = cantidadOriginal;

        i < cantidadNueva;

        i++

    ){

        await addDoc(

            collection(db,"cocina"),

            {

                pedidoId: mesa.pedidoId,

                mesa: mesa.numero,

                nombre: item.nombre,

                observacion: item.observacion || "",

                estado: "Pendiente",

                horaPedido: serverTimestamp(),

                horaLista: null,

                horaEntrega: null,

                requiereConfirmacion: false,

                ultimaModificacion: null,

                jornada

            }

        );

    }

}

if(cantidadNueva < cantidadOriginal){

    const diferencia = cantidadOriginal - cantidadNueva;

const cocina = await obtenerPendientesCocina(
    mesa.pedidoId,
    item.nombre
);

    let eliminados = 0;

    for(const producto of cocina.docs){

        if(eliminados >= diferencia) break;

        await deleteDoc(producto.ref);

        eliminados++;

    }

}

if(cantidadOriginal !== cantidadNueva){

    await registrarActividad(

        mesa.mozo,

        "Pedido",

        "Modificar Cantidad",

        `${item.nombre} - Mesa ${mesa.numero} (${cantidadOriginal} → ${cantidadNueva})`

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

const cocina = await obtenerPendientesCocina(
    mesa.pedidoId,
    item.nombre
);

for(const producto of cocina.docs){

    await deleteDoc(producto.ref);

}

await registrarActividad(

    mesa.mozo,

    "Pedido",

    "Eliminar Producto",

    `${item.nombre} - Mesa ${mesa.numero}`

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