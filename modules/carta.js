import { db } from "../js/firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let productoEditando = null;

export default async function () {

    const respuesta = await fetch("../modules/carta.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    document
        .getElementById("nuevoProducto")
        .addEventListener("click", nuevoProducto);

    document
        .getElementById("cancelarProducto")
        .addEventListener("click", cerrarModal);

    document
        .getElementById("guardarProducto")
        .addEventListener("click", guardarProducto);

    document
        .getElementById("buscarProducto")
        .addEventListener("keyup", filtrarProductos);

        document
    .getElementById("mostrarNoDisponibles")
    .addEventListener("change", cargarProductos);

    await cargarProductos();

}

function nuevoProducto(){

    productoEditando = null;

    document.getElementById("modalProducto").classList.remove("oculto");

    document.querySelector("#modalProducto h2").textContent =
        "Nuevo Producto";

    document.getElementById("nombreProducto").value="";

    document.getElementById("precioProducto").value="";

    document.getElementById("categoriaProducto").selectedIndex=0;

}

function cerrarModal(){

    document.getElementById("modalProducto").classList.add("oculto");

}

async function guardarProducto(){

    const nombre =
        document.getElementById("nombreProducto").value.trim();

    const categoria =
        document.getElementById("categoriaProducto").value;

    const precio =
        Number(document.getElementById("precioProducto").value);

    if(!nombre || !precio){

        alert("Complete todos los campos.");

        return;

    }

    if(productoEditando){

        await updateDoc(

            doc(db,"carta",productoEditando),

            {

                nombre,

                categoria,

                precio

            }

        );

    }else{

        await addDoc(

            collection(db,"carta"),

            {

                nombre,

                categoria,

                precio,

                disponible:true

            }

        );

    }

    cerrarModal();

    await cargarProductos();

}

async function cargarProductos() {

    const lista = document.getElementById("listaProductos");

    lista.innerHTML = "";

    const snapshot = await getDocs(collection(db, "carta"));

    const categorias = {};

    snapshot.forEach((documento) => {

        const producto = documento.data();

        producto.id = documento.id;

        const mostrarNoDisponibles =
    document.getElementById("mostrarNoDisponibles")?.checked;

if (!mostrarNoDisponibles && producto.disponible === false) {

    return;

}

        if (!categorias[producto.categoria]) {

            categorias[producto.categoria] = [];

        }

        categorias[producto.categoria].push(producto);

    });

const iconosCategoria = {

    "Pizza":"🍕",

    "Hamburguesa":"🍔",

    "Sandwiches":"🥪",

    "Milanesa":"🥩",

    "Ensaladas":"🥗",

    "Fritas":"🍟",

    "Tostones":"🥔",

    "Minutas":"🍳",

    "Pastas":"🍝",

    "Salsas":"🥣",

    "Menu Infantil":"🧒",

    "Picadas y Cazuelas":"🧀",

    "Adicional Huevo Frito":"🍳",

    "Dulce":"🍰",

    "Cerveza Artesanal":"🍺",

    "Con Alcohol":"🥃",

    "Sin Alcohol":"🥤"

};

    const nombresCategorias = Object.keys(categorias).sort();

    nombresCategorias.forEach((categoria) => {

lista.innerHTML += `

<div class="tituloCategoria">

    <h2>

        ${iconosCategoria[categoria] || "📋"}

        ${categoria}

    </h2>

</div>

`;

        categorias[categoria]
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .forEach((producto) => {

                lista.innerHTML += `

                <div class="cardUsuario">

                    <div class="datosUsuario">

                        <div class="nombreUsuario">

                            ${producto.nombre}

                        </div>

                    </div>

<div class="accionesCarta">

    <strong class="precioProducto">

        $ ${producto.precio.toLocaleString()}

    </strong>

    <div class="accionesProducto">

        <button
            class="btnEditar"
            data-id="${producto.id}">

            ✏ Editar

        </button>

        <button
            class="btnEstado"
            data-id="${producto.id}"
            data-estado="${producto.disponible}">

            ${producto.disponible ? "🟢 Disponible" : "🔴 No disponible"}

        </button>

    </div>

</div>

                </div>

                `;

            });

    });

}

function filtrarProductos() {

    const texto = document
        .getElementById("buscarProducto")
        .value
        .toLowerCase();

    document
        .querySelectorAll(".cardUsuario")
        .forEach(card => {

            card.style.display =
                card.innerText.toLowerCase().includes(texto)
                    ? "flex"
                    : "none";

        });

}

document.addEventListener("click",(e)=>{

    if(e.target.classList.contains("btnEditar")){

        editarProducto(e.target.dataset.id);

        return;

    }

    if(e.target.classList.contains("btnEstado")){

    cambiarEstadoProducto(

        e.target.dataset.id,

        e.target.dataset.estado==="true"

    );

    return;

}

});
async function editarProducto(id){

    const snapshot = await getDocs(collection(db,"carta"));

    snapshot.forEach(documento=>{

        if(documento.id!==id) return;

        const producto = documento.data();

        productoEditando = id;

        document.getElementById("tituloModalProducto").textContent =
            "Editar Producto";

        document.getElementById("nombreProducto").value =
            producto.nombre;

        document.getElementById("categoriaProducto").value =
            producto.categoria;

        document.getElementById("precioProducto").value =
            producto.precio;

        document.getElementById("modalProducto")
            .classList.remove("oculto");

    });

}

async function cambiarEstadoProducto(id,estadoActual){

    await updateDoc(

        doc(db,"carta",id),

        {

            disponible: !estadoActual

        }

    );

    await cargarProductos();

}