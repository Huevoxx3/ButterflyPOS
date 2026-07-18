const datos = JSON.parse(sessionStorage.getItem("usuario"));

const menu = document.getElementById("menu");

const opciones = {

    admin: [
    "Inicio",

    "Salón",

    "Mesas Cerradas",

    "Pendientes",

    "Entregados",

    "Usuarios",

    "Cuenta Corriente",

    "Carta",

    "Actividad",

    "Historial",

    "Cierre de Caja",

    "Configuración"
],

    salon: [
        "Inicio",
        "Salón",
        "Mesas Cerradas",
        "Configuración"
    ],

    cocina: [
        "Inicio",
        "Pendientes",
        "Entregados",
        "Configuración"
    ]

};

opciones[datos.perfil].forEach(opcion => {

    const boton = document.createElement("button");

    boton.classList.add("menu-btn");

    boton.textContent = opcion;

boton.onclick = async () => {

    document.querySelectorAll("#menu button").forEach(b=>{

    b.classList.remove("activo");

});

boton.classList.add("activo");


if (opcion === "Inicio") {

    const modulo = await import("../modules/inicio.js");

    modulo.default();

    return;

}    


if (opcion === "Usuarios") {

    const modulo = await import("../modules/usuarios.js");

    modulo.default();

    return;

}

if (opcion === "Carta") {

    const modulo = await import("../modules/carta.js");

    modulo.default();

    return;

}

if (opcion === "Salón") {

    const modulo = await import("../modules/salon.js");

    modulo.default(datos.perfil === "admin");

    return;

}

if (opcion === "Pendientes") {

    const modulo = await import("../modules/cocina.js");

    modulo.default(datos.perfil === "admin");

    return;

}

if (opcion === "Mesas Cerradas") {

    const modulo = await import("../modules/mesasCerradas.js");

    modulo.default(datos.perfil === "admin");

    return;

}

if (opcion === "Entregados") {

    const modulo = await import("../modules/cocinaEntregados.js");

    modulo.default(datos.perfil === "admin");

    return;

}

if (opcion === "Cierre de Caja") {

    const modulo = await import("../modules/cierreCaja.js");

    modulo.default();

    return;

}

if (opcion === "Historial") {

    const modulo = await import("../modules/historialCaja.js");

    modulo.default();

    return;

}

if (opcion === "Actividad") {

    const modulo = await import("../modules/actividad.js");

    modulo.default();

    return;

}

if (opcion === "Configuración") {

    const modulo = await import("../modules/configuracion.js");

    modulo.default();

    return;

}

if(opcion==="Cuenta Corriente"){

    const modulo = await import(

        "../modules/cuentaCorriente.js"

    );

    modulo.default();

    return;

}



    document.querySelector("#contenido").innerHTML = `
        <h1>${opcion}</h1>
        <p>Módulo en construcción.</p>
    `;

};

    menu.appendChild(boton);



});

const primerBoton = document.querySelector("#menu button");

if(primerBoton){

    primerBoton.classList.add("activo");

}

if(sessionStorage.getItem("primerIngreso") === "true"){

    document.querySelector(".sidebar").style.display = "none";

    document.querySelector("header").style.display = "none";

    import("../modules/completarPerfil.js").then(modulo=>{

        modulo.default();

    });

}
else{

    import("../modules/inicio.js").then(modulo=>{

        modulo.default();

    });

}