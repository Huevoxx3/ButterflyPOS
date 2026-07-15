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
    
const producto = await getDoc(

    doc(db,"carta",productoId)

);

const categoria = producto.data().categoria;

const categoriasExcluidas = [

    "Cerveza Artesanal",

    "Con Alcohol",

    "Sin Alcohol"

];

// ==========================
// ENVIAR A COCINA
// ==========================
const jornada = await obtenerJornadaActual();

console.log("ANTES DE COCINA");
if(!categoriasExcluidas.includes(categoria)){

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

            ultimaModificacion: null,

            jornada

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

    "Pedido",

    "Agregar Producto",

    `${nombre} - Mesa ${mesa.numero}`

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

        const cocina = await getDocs(

    query(

        collection(db,"cocina"),

        where("pedidoId","==",mesa.pedidoId),

        where("nombre","==",item.nombre),

        where("estado","==","Pendiente")

    )

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

const producto = await getDoc(

    doc(db,"carta",item.productoId)

);

const categoria = producto.data().categoria;

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

    const cocina = await getDocs(

        query(

            collection(db,"cocina"),

            where("pedidoId","==",mesa.pedidoId),

            where("nombre","==",item.nombre),

            where("estado","==","Pendiente")

        )

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

        const cocina = await getDocs(

    query(

        collection(db,"cocina"),

        where("pedidoId","==",mesa.pedidoId),

        where("nombre","==",item.nombre),

        where("estado","==","Pendiente")

    )

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