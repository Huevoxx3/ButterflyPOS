import { db } from "../js/firebase.js";

import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(){

    const respuesta = await fetch("../modules/configuracion.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    const usuario = JSON.parse(

        sessionStorage.getItem("usuario")

    );

    document.getElementById("cfgNombre").value =
        usuario.nombre;

    document.getElementById("cfgApellido").value =
        usuario.apellido;

    document.getElementById("cfgDni").value =
        usuario.dni;

    document.getElementById("cfgUsuario").value =
        usuario.usuario;

    document.getElementById("cfgEmail").value =
        usuario.email;

    document.getElementById("cfgTelefono").value =
        usuario.telefono || "";

    document
        .getElementById("guardarConfiguracion")
        .onclick = () => guardar(usuario);

}

async function guardar(usuario){

    const nombreUsuario =
        document.getElementById("cfgUsuario").value.trim();

    const email =
        document.getElementById("cfgEmail").value.trim();

    const telefono =
        document.getElementById("cfgTelefono").value.trim();

    const actual =
        document.getElementById("cfgActual").value;

    const nueva =
        document.getElementById("cfgNueva").value;

    const repetir =
        document.getElementById("cfgRepetir").value;

    if(!nombreUsuario || !email){

        alert("Complete Usuario y Email.");

        return;

    }

    if(nueva !== "" || repetir !== ""){

        if(actual !== usuario.password){

            alert("La contraseña actual es incorrecta.");

            return;

        }

        if(nueva !== repetir){

            alert("Las nuevas contraseñas no coinciden.");

            return;

        }

        usuario.password = nueva;

    }

    actualizarPerfil(

        usuario,

        nombreUsuario,

        email,

        telefono

    );

}

async function actualizarPerfil(

    usuario,

    nombreUsuario,

    email,

    telefono

){

    try{

        await updateDoc(

            doc(db,"usuarios",usuario.id),

            {

                usuario:nombreUsuario,

                email:email,

                telefono:telefono,

                password:usuario.password

            }

        );

        usuario.usuario = nombreUsuario;
        usuario.email = email;
        usuario.telefono = telefono;

        sessionStorage.setItem(

            "usuario",

            JSON.stringify(usuario)

        );

        document.getElementById("cfgActual").value = "";

document.getElementById("cfgNueva").value = "";

document.getElementById("cfgRepetir").value = "";

        alert("✅ Datos actualizados correctamente.");

    }

    catch(error){

        console.error(error);

        alert("Error al actualizar.");

    }

}