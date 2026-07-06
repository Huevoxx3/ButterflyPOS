import { db } from "../js/firebase.js";

import {

    collection,
    getDocs,
    query,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(){

    const contenido = document.getElementById("contenido");

    const snapshot = await getDocs(

        query(

            collection(db,"cierresCaja"),

            orderBy("cierre","desc")

        )

    );

    let html = `

    <h1>

    📒 Historial de Caja

    </h1>

    <br>

    `;

    snapshot.forEach(documento=>{

        const cierre = documento.data();

        html += `

<div
class="cardHistorial"
data-id="${documento.id}">

<div>

<h3>

📅 ${cierre.jornada}

</h3>

<p>

💰 $ ${Number(cierre.total).toLocaleString()}

</p>

<p>

🧾 ${cierre.cantidadVentas} ventas

</p>

</div>

<div>

<button
class="btnAzul btnVerDetalle"
data-id="${documento.id}">

Ver

</button>

</div>

</div>

`;

    });

    contenido.innerHTML = html;

document.querySelectorAll(".btnVerDetalle").forEach(boton => {

    boton.onclick = () => {

        alert("Próximo paso: mostrar el detalle del cierre.");

    };

});

}