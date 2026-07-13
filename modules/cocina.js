import { obtenerJornadaActual } from "../js/services/cajaService.js";

import { db } from "../js/firebase.js";

import {

    collection,
    getDocs,
    query,
    where,
    orderBy,
    doc,
updateDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(admin = false){
        
    modoSoloLectura = admin;

    const respuesta = await fetch("../modules/cocina.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    await cargarPendientes();

}

let modoSoloLectura = false;

async function cargarPendientes(){

    const jornada = await obtenerJornadaActual();

    const consulta = query(

    collection(db,"cocina"),

    where("jornada","==",jornada),

    where("estado","==","Pendiente"),

    orderBy("horaPedido")

);

    const snapshot = await getDocs(consulta);

    const totales = {};

snapshot.forEach(documento => {

    const item = documento.data();

    if(!totales[item.nombre]){

        totales[item.nombre] = 0;

    }

    totales[item.nombre]++;

});

const actuales = {};

    let html = "";

    snapshot.forEach(documento=>{

        const item = documento.data();

        if(!actuales[item.nombre]){

    actuales[item.nombre] = 1;

}else{

    actuales[item.nombre]++;

}

        html += `

<div class="cardUsuario ${item.requiereConfirmacion ? "pedidoModificado" : ""}">

    <strong>

${item.nombre}

(${actuales[item.nombre]} de ${totales[item.nombre]})

</strong>

    <br>

    🍽 Mesa ${item.mesa}

    <br>

    📝 ${item.observacion || "Sin observaciones"}

    ${
    modoSoloLectura
    ?
    ""
    :
    (
        item.requiereConfirmacion
        ?
        `
        <br><br>

        <button
            class="btnEntendido"
            data-id="${documento.id}">

            ✔ ENTENDIDO

        </button>
        `
        :
        `
        <br><br>

        <button
            class="btnListo"
            data-id="${documento.id}">

            ✅ LISTO

        </button>
        `
    )
}

</div>

<br>

`;

    });

    if(html===""){

        html = "<p>No hay pedidos pendientes.</p>";

    }

    document.getElementById("listaPendientes").innerHTML =
        html;

    document.querySelectorAll(".btnListo").forEach(boton => {

    boton.onclick = async () => {

        const confirmar = confirm(

            "¿Confirmar que el producto está listo?"

        );

        if(!confirmar) return;

        await updateDoc(

            doc(db,"cocina",boton.dataset.id),

            {

                estado:"Listo",

                horaLista: serverTimestamp()

            }

        );

        cargarPendientes();

    };

});
document.querySelectorAll(".btnEntendido").forEach(boton => {

    boton.onclick = async () => {

        await updateDoc(

            doc(db,"cocina",boton.dataset.id),

            {

                requiereConfirmacion:false

            }

        );

        cargarPendientes();

    };

});

}