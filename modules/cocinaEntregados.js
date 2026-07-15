import { obtenerJornadaActual } from "../js/services/cajaService.js";

import { db } from "../js/firebase.js";

import {

    collection,
    getDocs,
    query,
    where,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(){

    document.getElementById("contenido").innerHTML = `

        <h1>🍳 Cocina - Entregados </h1>

        <br></br>

        <div id="listaEntregados">

            Cargando...

        </div>

    `;

    const jornada = await obtenerJornadaActual();

   const consulta = query(

    collection(db,"cocina"),

    where("jornada","==",jornada),

    where("estado","==","Listo"),

    orderBy("horaLista","desc")

);

    const snapshot = await getDocs(consulta);

    let html = "";

    snapshot.forEach(documento=>{

        const item = documento.data();

        html += `

        <div class="cardUsuario">

            <strong>${item.nombre}</strong>

            <br>

            🍽 Mesa ${item.mesa}

        </div>

        <br>

        `;

    });

    if(html===""){

        html = "<p>No hay productos entregados.</p>";

    }

    document.getElementById("listaEntregados").innerHTML =
        html;

}