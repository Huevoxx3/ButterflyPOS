const datos = JSON.parse(sessionStorage.getItem("usuario"));

const menu = document.getElementById("menu");

const opciones = {

    admin: [
        "Inicio",
        "Usuarios",
        "Carta",
        "Actividad",
        "Historial",
        "Cierre de Caja"
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

    boton.textContent = opcion;

boton.onclick = async () => {

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