import { db } from "../js/firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
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

    if(mesa.estado==="Libre"){

        const personas = prompt("Cantidad de personas");

        if(!personas) return;

        const usuario = JSON.parse(sessionStorage.getItem("usuario"));

        await updateDoc(referencia,{

            estado:"Ocupada",

            personas:Number(personas),

            mozo:usuario.nombre

        });

        await dibujarVistaSalon();

        return;

    }

    document.getElementById("contenido").innerHTML=`

        <div class="salon">

            <h1>Mesa ${mesa.numero}</h1>

            <br>

            <p><b>Mozo:</b> ${mesa.mozo}</p>

            <p><b>Personas:</b> ${mesa.personas}</p>

            <p><b>Total:</b> $ ${mesa.total}</p>

            <br>

            <button id="volverSalon">

                ← Volver

            </button>

        </div>

    `;

    document
        .getElementById("volverSalon")
        .onclick = dibujarVistaSalon;

}

async function dibujarVistaSalon(){

    const respuesta = await fetch("../modules/salon.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    await dibujarMesas();

}