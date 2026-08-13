import { db } from "../js/firebase.js";

import {
    registrarActividad
} from "../js/services/actividadService.js";

import { obtenerJornadaActual } from "../js/services/cajaService.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

async function cargarEgresos(){

    const lista =
        document.getElementById("listaEgresos");

    lista.innerHTML = "";

    const jornada =
        await obtenerJornadaActual();

    const consulta = query(

        collection(db, "egresos"),

        where("jornada", "==", jornada),

        orderBy("fecha", "desc")

    );

    const snapshot =
        await getDocs(consulta);

    let total = 0;

    snapshot.forEach(documento => {

        const egreso = documento.data();

        // Solo mostramos egresos activos
        if(egreso.estado !== "Activo") return;

        total += Number(egreso.importe) || 0;

        const fecha = egreso.fecha?.toDate();

        const fechaTexto = fecha
            ? fecha.toLocaleString("es-AR")
            : "";

        lista.innerHTML += `

    <div class="cardEgreso">

        <div>

            <strong>
                ${egreso.concepto}
            </strong>

            <div class="infoEgreso">

                ${egreso.usuario || "Usuario"}

                ·

                ${fechaTexto}

            </div>

        </div>

        <div class="accionesEgreso">

            <strong class="importeEgresoLista">

                $ ${Number(egreso.importe)
                    .toLocaleString("es-AR")}

            </strong>

            <button
                type="button"
                class="btnAnularEgreso"
                data-id="${documento.id}">

                🗑

            </button>

        </div>

    </div>

`;

    });

    lista.innerHTML += `

        <div class="totalEgresos">

            <span>
                Total de egresos
            </span>

            <strong>
                $ ${total.toLocaleString("es-AR")}
            </strong>

        </div>

    `;

document.querySelectorAll(".btnAnularEgreso").forEach(boton => {

    boton.onclick = async () => {

        const confirmar = confirm(
            "¿Está seguro de anular este egreso?"
        );

        if(!confirmar) return;

        const egresoId = boton.dataset.id;

        const documentoEgreso = await getDoc(
    doc(db, "egresos", egresoId)
);

const egreso = documentoEgreso.data();

        await updateDoc(

            doc(db, "egresos", egresoId),

            {
                estado: "Anulado",

                fechaAnulacion:
                    serverTimestamp()
            }

        );

        const usuario =
            JSON.parse(
                sessionStorage.getItem("usuario")
            );

await registrarActividad(

    usuario.nombre,

    "Egresos",

    "Anular Egreso",

    `Egreso anulado: ${egreso.concepto} - $${Number(egreso.importe).toLocaleString("es-AR")}`,

    {
        egresoId: egresoId,
        concepto: egreso.concepto,
        importe: egreso.importe
    }

);

        alert("Egreso anulado correctamente.");

        await cargarEgresos();

    };

});

}

export default async function(){

    const contenido =
        document.getElementById("contenido");


    const respuesta = await fetch(
        "../modules/egresos.html"
    );

    const html = await respuesta.text();

    contenido.innerHTML = html;


    // Cargar CSS

    if(!document.getElementById("egresosCSS")){

        const link = document.createElement("link");

        link.id = "egresosCSS";

        link.rel = "stylesheet";

        link.href = "../css/egresos.css";

        document.head.appendChild(link);

    }


    // Registrar egreso

    document.getElementById("btnRegistrarEgreso").onclick =
        async () => {

            const concepto =
                document.getElementById("conceptoEgreso")
                    .value
                    .trim();

            const importe =
                Number(
                    document.getElementById("importeEgreso")
                        .value
                ) || 0;


            if(!concepto){

                alert("Ingrese el concepto del egreso.");

                return;

            }


            if(importe <= 0){

                alert("Ingrese un importe válido.");

                return;

            }


            const jornada =
                await obtenerJornadaActual();


            const usuario =
                JSON.parse(
                    sessionStorage.getItem("usuario")
                );


            await addDoc(

                collection(db,"egresos"),

                {

                    concepto: concepto,

                    importe: importe,

                    usuarioId:
                        usuario?.id || "",

                    usuario:
                        usuario?.nombre || "",

                    perfil:
                        usuario?.perfil || "",

                    jornada: jornada,

                    fecha:
                        serverTimestamp(),

                    estado: "Activo",

                    tipo: "Egreso"

                }

            );

            await registrarActividad(

    usuario.nombre,

    "Egresos",

    "Registrar Egreso",

    `${concepto} - $${importe.toLocaleString("es-AR")}`,

    {
        importe: importe,
        concepto: concepto
    }

);


            alert("Egreso registrado correctamente.");

            await cargarEgresos();


            document.getElementById("conceptoEgreso")
                .value = "";

            document.getElementById("importeEgreso")
                .value = "";

        };
await cargarEgresos();

}