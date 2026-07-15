import { db } from "../js/firebase.js";

import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(){

    const usuario = JSON.parse(

        sessionStorage.getItem("usuario")

    );

    document.querySelector("h1").innerHTML =

    `¡Bienvenido ${usuario.nombre}!`;

    const respuesta = await fetch("../modules/completarPerfil.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    document.getElementById("guardarPerfil")
        .onclick = () => guardar(usuario);

}

function guardar(usuario){

    const nombreUsuario =
        document.getElementById("perfilUsuario").value.trim();

    const email =
        document.getElementById("perfilEmail").value.trim();

    const telefono =
        document.getElementById("perfilTelefono").value.trim();

    const pass1 =
        document.getElementById("perfilPassword").value;

    const pass2 =
        document.getElementById("perfilPassword2").value;

    if(
        !nombreUsuario ||
        !email ||
        !telefono ||
        !pass1 ||
        !pass2
    ){

        alert("Complete todos los campos.");

        return;

    }

    if(pass1 !== pass2){

        alert("Las contraseñas no coinciden.");

        return;

    }

    actualizarPerfil(

    usuario,

    nombreUsuario,

    email,

    telefono,

    pass1

);

async function actualizarPerfil(
    usuario,
    nombreUsuario,
    email,
    telefono,
    password
){

    try{

        await updateDoc(

            doc(db,"usuarios",usuario.id),

            {

                usuario: nombreUsuario,

                email: email,

                telefono: telefono,

                password: password,

                primerIngreso: false

            }

        );

        usuario.usuario = nombreUsuario;
        usuario.email = email;
        usuario.telefono = telefono;
        usuario.password = password;
        usuario.primerIngreso = false;

        sessionStorage.setItem(

            "usuario",

            JSON.stringify(usuario)

        );

        sessionStorage.removeItem("primerIngreso");

        alert("✅ Perfil actualizado correctamente.");

        document.querySelector(".sidebar").style.display = "flex";

        document.querySelector("header").style.display = "flex";

        location.reload();

    }

    catch(error){

        console.error(error);

        alert("Error al guardar el perfil.");

    }

}

}