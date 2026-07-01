import {
    agregarProductoPedido,
    obtenerItemsPedido
} from "../js/services/pedidoService.js";
import { registrarActividad } from "../js/services/actividadService.js";

import { db } from "../js/firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    addDoc,
    setDoc,
    increment,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function () {

    const respuesta = await fetch("../modules/salon.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    await dibujarMesas();

}

async function dibujarMesas() {

    const plano = document.getElementById("planoSalon");

    plano.innerHTML = "";

    const snapshot = await getDocs(collection(db, "mesas"));

    snapshot.forEach(documento => {

        const mesa = documento.data();

        plano.innerHTML += `

        <div class="mesaCard" data-mesa="${mesa.numero}">

            <div class="mesaNumero">

                ${mesa.numero}

            </div>

            <div class="mesaEstado ${obtenerClase(mesa.estado)}">

                ${mesa.estado}

            </div>

        </div>

        `;

    });

    document.querySelectorAll(".mesaCard").forEach(mesa => {

        mesa.addEventListener("click", () => {

            abrirMesa(mesa.dataset.mesa);

        });

    });

}

function obtenerClase(estado){

    switch(estado){

        case "Libre":
            return "libre";

        case "Ocupada":
            return "ocupada";

        case "Cocina":
            return "cocina";

        case "Cobro":
            return "cuenta";

        default:
            return "libre";

    }

}

async function abrirMesa(numero){

    const referencia = doc(db,"mesas",String(numero));

    const documento = await getDoc(referencia);

    const mesa = documento.data();

    // ==========================
    // MESA LIBRE
    // ==========================

    if(mesa.estado === "Libre"){

        const personas = prompt("Cantidad de personas");

        if(!personas) return;

        const usuario = JSON.parse(
            sessionStorage.getItem("usuario")
        );

        await updateDoc(referencia,{

            estado:"Ocupada",

            personas:Number(personas),

            mozo:usuario.nombre,

            total:0

        });

        const pedido = await addDoc(

            collection(db,"pedidos"),

            {

                mesa:Number(numero),

                estado:"Abierto",

                mozo:usuario.nombre,

                personas:Number(personas),

                total:0,

                fechaApertura:serverTimestamp()

            }

        );

        await updateDoc(referencia,{

            pedidoId:pedido.id

        });

        await registrarActividad(

            usuario.nombre,

            "Abrió Mesa " + numero

        );

        await dibujarVistaSalon();

        return;

    }

    // ==========================
    // MESA OCUPADA SIN PEDIDO
    // (autocorrección)
    // ==========================

    if(!mesa.pedidoId){

        const pedido = await addDoc(

            collection(db,"pedidos"),

            {

                mesa:Number(numero),

                estado:"Abierto",

                mozo:mesa.mozo,

                personas:mesa.personas,

                total:mesa.total || 0,

                fechaApertura:serverTimestamp()

            }

        );

        mesa.pedidoId = pedido.id;

        await updateDoc(referencia,{

            pedidoId:pedido.id

        });

    }

    await mostrarModalMesa(mesa);

}

async function dibujarVistaSalon(){

    const respuesta = await fetch("../modules/salon.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    await dibujarMesas();

}

async function mostrarModalMesa(mesa){

    document.getElementById("tituloMesa").textContent =
        "Mesa " + mesa.numero;

    document.getElementById("datosMesa").innerHTML = `

    <div class="datoCard">

        <div class="datoTitulo">

            👤 Mozo

        </div>

        <div class="datoValor">

            ${mesa.mozo}

        </div>

    </div>

    <div class="datoCard">

        <div class="datoTitulo">

            👥 Personas

        </div>

        <div class="datoValor">

            ${mesa.personas}

        </div>

    </div>

`;

    document.getElementById("totalMesa").textContent =
        "Total: $" + mesa.total.toLocaleString();

    const items = await obtenerItemsPedido(mesa.pedidoId);

let html = "";

if(items.length === 0){

    html = "<p>No hay productos cargados.</p>";

}else{

    /*items.forEach(item => {

    html += `

    <div class="cardUsuario pedidoItem">

        <div style="flex:1;">

            <strong>${item.nombre}</strong>

            <br>

            <small>

                Cantidad: ${item.cantidad}

            </small>

        </div>

        <div style="display:flex;align-items:center;gap:8px;">

            <button
    class="btnMenos"
    data-id="${item.id}"
    data-precio="${item.precio}"
    data-cantidad="${item.cantidad}">

    −

</button>

            <strong>

                ${item.cantidad}

            </strong>

            <button
    class="btnMas"
    data-id="${item.id}"
    data-precio="${item.precio}"
    data-cantidad="${item.cantidad}">

    +

</button>

            <button
    class="btnEliminar"
    data-id="${item.id}"
    data-precio="${item.precio}"
    data-cantidad="${item.cantidad}">

    🗑

</button>

        </div>

        <div style="min-width:90px;text-align:right;">

            $ ${(item.precio * item.cantidad).toLocaleString()}

        </div>

    </div>

    `;

});*/
items.forEach(item => {

    html += `

    <div class="cardUsuario">

        <div>

            <strong>${item.nombre}</strong>

            <br>

            Cantidad: ${item.cantidad}

        </div>

        <div>

            $ ${(item.precio * item.cantidad).toLocaleString()}

        </div>

    </div>

    `;

});

}

document.getElementById("productosMesa").innerHTML = html;

    document
        .getElementById("modalMesa")
        .classList.remove("oculto");

   document
    .getElementById("btnVolverSalon")
    .onclick = cerrarModalMesa;

        document
    .getElementById("btnAgregarProducto")
    .onclick = () => abrirCarta(mesa);

}

function cerrarModalMesa(){

    document
        .getElementById("modalMesa")
        .classList.add("oculto");

}

async function abrirCarta(mesa){

    document
        .getElementById("modalCarta")
        .classList.remove("oculto");

    await cargarCartaSalon(mesa);

    document
        .getElementById("cerrarCartaSalon")
        .onclick = cerrarCartaSalon;

}

function cerrarCartaSalon(){

    document
        .getElementById("modalCarta")
        .classList.add("oculto");

}

async function cargarCartaSalon(mesa){

    const lista =
        document.getElementById("listaCartaSalon");

    const buscador =
    document.getElementById("buscarCartaSalon");
        lista.innerHTML = "";

    const productos = await getDocs(collection(db,"carta"));

    const categorias = {};

    productos.forEach(documento=>{

        const producto = documento.data();

        producto.id = documento.id;

        if(!producto.disponible) return;

        if(!categorias[producto.categoria]){

            categorias[producto.categoria]=[];

        }

        categorias[producto.categoria].push(producto);

    });

    Object.keys(categorias).sort().forEach(categoria=>{

        lista.innerHTML += `

            <h3 style="margin-top:20px;">

                ${categoria}

            </h3>

        `;

        categorias[categoria].forEach(producto=>{

            lista.innerHTML += `

            <div class="cardUsuario">

                <div>

                    <strong>${producto.nombre}</strong>

                    <br>

                    $ ${producto.precio.toLocaleString()}

                </div>

                <button
    class="btnAgregarCarta"
    data-id="${producto.id}"
    data-nombre="${producto.nombre}"
    data-precio="${producto.precio}">

    Agregar

</button>

            </div>

            `;

        });

    });
   document.querySelectorAll(".btnAgregarCarta").forEach(btn => {

    btn.onclick = async () => {

        await agregarProductoPedido(

            mesa,

            btn.dataset.id,

            btn.dataset.nombre,

            Number(btn.dataset.precio)

        );
        const referencia = await getDoc(

    doc(db,"mesas",String(mesa.numero))

);

mostrarModalMesa(

    referencia.data()

);

    };

});
buscador.oninput = () => {

    const texto = buscador.value.toLowerCase();

    document
        .querySelectorAll("#listaCartaSalon .cardUsuario")
        .forEach(card => {

            const nombre =
                card.textContent.toLowerCase();

            card.style.display =
                nombre.includes(texto)
                    ? "flex"
                    : "none";

        });

    document
        .querySelectorAll("#listaCartaSalon h3")
        .forEach(titulo => {

            let mostrar = false;

            let siguiente = titulo.nextElementSibling;

            while(
                siguiente &&
                siguiente.tagName !== "H3"
            ){

                if(
                    siguiente.style.display !== "none"
                ){

                    mostrar = true;

                }

                siguiente =
                    siguiente.nextElementSibling;

            }

            titulo.style.display =
                mostrar
                    ? "block"
                    : "none";

        });

};

}