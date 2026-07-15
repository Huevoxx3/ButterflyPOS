import Auth from "./auth.js";

const txtUsuario = document.getElementById("usuario");
const txtPassword = document.getElementById("password");
const btnEntrar = document.getElementById("btnEntrar");

btnEntrar.addEventListener("click", iniciarSesion);

async function iniciarSesion() {

    const usuario = txtUsuario.value.trim();
    const password = txtPassword.value;

    if (usuario === "" || password === "") {

        alert("Complete usuario y contraseña.");

        return;

    }

    try {

        btnEntrar.disabled = true;
        btnEntrar.textContent = "Ingresando...";

    const datosUsuario = await Auth.login(usuario, password);

console.log("LOGIN CORRECTO");

console.log(datosUsuario);

// ==========================
// PRIMER INGRESO
// ==========================

if(datosUsuario.primerIngreso){

    sessionStorage.setItem(

        "primerIngreso",

        "true"

    );

}

sessionStorage.setItem(

    "usuario",

    JSON.stringify(datosUsuario)

);

window.location.href = "templates/dashboard.html";

sessionStorage.setItem(

    "usuario",

    JSON.stringify(datosUsuario)

);

window.location.href = "templates/dashboard.html";

        // Próximo Sprint
        // window.location.href="templates/dashboard.html";

    } catch (error) {

        alert(error.message);

    } finally {

        btnEntrar.disabled = false;
        btnEntrar.textContent = "ENTRAR";

    }

}