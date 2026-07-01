import { db } from "../js/firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function () {

    const respuesta = await fetch("../modules/usuarios.html");
    const html = await respuesta.text();

    document.querySelector("#contenido").innerHTML = html;

    document
        .getElementById("nuevoUsuario")
        .addEventListener("click", abrirModal);

    document
        .getElementById("cancelarUsuario")
        .addEventListener("click", cerrarModal);

    document
        .getElementById("crearUsuario")
        .addEventListener("click", validarFormulario);

    await cargarUsuarios();

}

async function cargarUsuarios(){

    const lista=document.getElementById("listaUsuarios");

    lista.innerHTML="";

    const plantilla=await fetch("../modules/usuario-card.html");
    const card=await plantilla.text();

    const snapshot=await getDocs(collection(db,"usuarios"));

    snapshot.forEach(doc=>{

        const usuario=doc.data();

        let html=card;

        html=html.replace("{{NOMBRE}}",usuario.nombre+" "+usuario.apellido);
        html=html.replace("{{PERFIL}}",usuario.perfil);
        html=html.replace("{{USUARIO}}",usuario.usuario);
        html=html.replace("{{EMAIL}}",usuario.email);
        html=html.replace("{{ESTADO}}",usuario.activo ? "🟢 Activo" : "🔴 Inactivo");

        lista.innerHTML+=html;

    });

}

function abrirModal(){

    limpiarFormulario();

    document.getElementById("modalUsuario").classList.remove("oculto");

}

function cerrarModal(){

    document.getElementById("modalUsuario").classList.add("oculto");

}

function limpiarFormulario(){

    document.getElementById("nombre").value="";
    document.getElementById("apellido").value="";
    document.getElementById("dni").value="";
    document.getElementById("usuarioNuevo").value="";
    document.getElementById("email").value="";
    document.getElementById("passwordNuevo").value="";
    document.getElementById("perfilNuevo").selectedIndex=0;

}

function validarFormulario(){

    const nombre=document.getElementById("nombre").value.trim();
    const apellido=document.getElementById("apellido").value.trim();
    const dni=document.getElementById("dni").value.trim();
    const usuario=document.getElementById("usuarioNuevo").value.trim();
    const email=document.getElementById("email").value.trim();
    const password=document.getElementById("passwordNuevo").value.trim();

    if(!nombre || !apellido || !dni || !usuario || !email || !password){

        alert("Complete todos los campos.");

        return;

    }

    alert("Usuario listo para crear.");

}