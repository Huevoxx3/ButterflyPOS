import { db } from "../js/firebase.js";

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let usuarioEditando = null;

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
    document
.getElementById("buscarUsuario")
.addEventListener("keyup",filtrarUsuarios);

}

async function cargarUsuarios(){

    const lista=document.getElementById("listaUsuarios");

    lista.innerHTML="";

    const plantilla=await fetch("../modules/usuario-card.html");
    const card=await plantilla.text();

    const snapshot=await getDocs(collection(db,"usuarios"));

    snapshot.forEach(doc=>{

        const usuario=doc.data();

        const id = doc.id;

        let html=card;

    html = html.replaceAll("{{NOMBRE}}", usuario.nombre + " " + usuario.apellido);
    html = html.replaceAll("{{PERFIL}}", usuario.perfil);
    html = html.replaceAll("{{USUARIO}}", usuario.usuario);
    html = html.replaceAll("{{EMAIL}}", usuario.email);
        let estado = "";

if(!usuario.activo){

    estado = "🔴 Inactivo";

}
else if(usuario.primerIngreso){

    estado = "🟡 Completar Perfil";

}
else{

    estado = "🟢 Activo";

}

const textoBoton = usuario.activo

    ? "⛔ Desactivar"

    : "✅ Activar";

html = html.replaceAll("{{ESTADO}}", estado);
html = html.replaceAll("{{ID}}", id);
html = html.replaceAll("{{BOTON}}", textoBoton);
html = html.replaceAll("{{DNI}}", usuario.dni || "-");

        lista.innerHTML+=html;

    });

document
.querySelectorAll(".btnDesactivarUsuario")
.forEach(boton=>{

    boton.onclick = async()=>{

        const referencia = doc(

            db,

            "usuarios",

            boton.dataset.id

        );

        const documento = await getDoc(referencia);

        const usuario = documento.data();

        const accion = usuario.activo

            ? "desactivar"

            : "activar";

        const confirmar = confirm(

            `¿Desea ${accion} este empleado?`

        );

        if(!confirmar) return;

        await updateDoc(

            referencia,

            {

                activo: !usuario.activo

            }

        );

        cargarUsuarios();

    };

});

document
.querySelectorAll(".btnEditarUsuario")
.forEach(boton=>{

    boton.onclick = ()=>{

        editarUsuario(boton.dataset.id);

    };

});

document
.querySelectorAll(".btnResetPassword")
.forEach(boton=>{

    boton.onclick = async()=>{

        const confirmar = confirm(

            "¿Restablecer la contraseña del empleado?\n\nLa contraseña volverá a ser el DNI."

        );

        if(!confirmar) return;

        const referencia = doc(

            db,

            "usuarios",

            boton.dataset.id

        );

        const documento = await getDoc(referencia);

        const usuario = documento.data();

        await updateDoc(

            referencia,

            {

                password: usuario.dni,

                primerIngreso: true

            }

        );

        alert("✅ Contraseña restablecida correctamente.");

        cargarUsuarios();

    };

});

}

function abrirModal(){

    limpiarFormulario();

    usuarioEditando = null;

document.getElementById("tituloModal").innerText =
    "Nuevo Empleado";

document.getElementById("crearUsuario").innerText =
    "Crear Empleado";

    document
.getElementById("passwordNuevo")
.parentElement
.style.display = "block";

    document.getElementById("modalUsuario").classList.remove("oculto");

}

function cerrarModal(){

    document.getElementById("modalUsuario").classList.add("oculto");

}

function limpiarFormulario(){

    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("dni").value = "";
    document.getElementById("passwordNuevo").value = "";
    document.getElementById("perfilNuevo").selectedIndex = 0;

}

function validarFormulario(){

    const nombre=document.getElementById("nombre").value.trim();
    const apellido=document.getElementById("apellido").value.trim();
    const dni=document.getElementById("dni").value.trim();
    const password=document.getElementById("passwordNuevo").value.trim();
    const perfil=document.getElementById("perfilNuevo").value;

    if(!nombre || !apellido || !dni || !password || !perfil){

        alert("Complete todos los campos.");

        return;

    }

  const nuevoUsuario = {

    nombre,

    apellido,

    dni,

    usuario:dni,

    password,

    perfil,

    email:"",

    telefono:"",

    foto:"",

    activo:true,

    primerIngreso:true,

    fechaAlta:new Date()

};

if(usuarioEditando){

    actualizarUsuario(nuevoUsuario);

}else{

    verificarDNI(nuevoUsuario);

}
}

function filtrarUsuarios(){

    const texto=this.value.toLowerCase();

    document
    .querySelectorAll(".cardUsuario")
    .forEach(card=>{

        card.style.display=
            card.innerText
            .toLowerCase()
            .includes(texto)

            ? "flex"

            : "none";

    });

}

async function verificarDNI(usuario){

    const consulta = query(

        collection(db,"usuarios"),

        where("dni","==",usuario.dni)

    );

    const resultado = await getDocs(consulta);

    if(!resultado.empty){

        alert("⚠ Ya existe un usuario con ese DNI.");

        return;

    }

    guardarUsuario(usuario);

}

async function guardarUsuario(usuario){

    try{

        await addDoc(

            collection(db,"usuarios"),

            usuario

        );

        alert("✅ Usuario creado correctamente.");

        cerrarModal();

        cargarUsuarios();

    }

    catch(error){

        console.error(error);

        alert("Error al crear el usuario.");

    }

}

async function editarUsuario(id){

    usuarioEditando = id;

    const documento = await getDoc(

        doc(db,"usuarios",id)

    );

    const usuario = documento.data();

    document.getElementById("nombre").value =
        usuario.nombre;

    document.getElementById("apellido").value =
        usuario.apellido;

    document.getElementById("dni").value =
        usuario.dni;
        document.getElementById("dni").disabled = true;

    document
.getElementById("passwordNuevo")
.parentElement
.style.display = "none";

    document.getElementById("perfilNuevo").value =
        usuario.perfil;

    document.getElementById("tituloModal").innerText =
        "Editar Empleado";

    document.getElementById("crearUsuario").innerText =
        "Guardar Cambios";

    document
        .getElementById("modalUsuario")
        .classList
        .remove("oculto");

}

async function actualizarUsuario(usuario){

    try{

        await updateDoc(

            doc(db,"usuarios",usuarioEditando),

            {

                nombre:usuario.nombre,

                apellido:usuario.apellido,

                perfil:usuario.perfil

            }

        );

        alert("✅ Empleado actualizado correctamente.");

        usuarioEditando = null;

        cerrarModal();

        cargarUsuarios();

    }

    catch(error){

        console.error(error);

        alert("Error al actualizar el empleado.");

    }

}