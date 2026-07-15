import { registrarActividad } from "../js/services/actividadService.js";

import { db } from "../js/firebase.js";

import {

    collection,

    getDocs,

    addDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(){

    const respuesta = await fetch(

        "../modules/cuentaCorriente.html"

    );

    document.getElementById("contenido").innerHTML =

        await respuesta.text();

    await cargarCuentas();

    document.getElementById(

    "cerrarCuentaCorriente"

).onclick = ()=>{

    document.getElementById(

        "modalCuentaCorriente"

    ).classList.add("oculto");

};

}

async function cargarCuentas(){

    const lista = document.getElementById(

        "listaCuentaCorriente"

    );

    lista.innerHTML = "";

    const snapshot = await getDocs(

        collection(db,"cuentasCorrientes")

    );

    const empleados = {};

    snapshot.forEach(doc=>{

        const movimiento = doc.data();

        if(!empleados[movimiento.empleado]){

            empleados[movimiento.empleado] = 0;

        }

        empleados[movimiento.empleado] +=

            movimiento.importe;

    });

    Object.keys(empleados)

        .sort()

        .forEach(nombre=>{

lista.innerHTML += `

<div class="cardCuentaCorriente">

    <div class="datosUsuario">

        <div class="nombreUsuario">

            👤 ${nombre}

        </div>

        <div>

            Saldo pendiente

        </div>

        <div class="saldoCuenta">

    💰 $ ${empleados[nombre].toLocaleString()}

</div>

    </div>

    <button

        class="btnDetalleCuenta"

        data-empleado="${nombre}">

        📄 Ver detalle

    </button>

</div>

`;


        });

    document
.querySelectorAll(".btnDetalleCuenta")
.forEach(boton=>{

    boton.onclick=()=>{

        mostrarDetalleCuenta(

            boton.dataset.empleado

        );

    };

});

}

async function mostrarDetalleCuenta(nombre){

    const snapshot = await getDocs(

        collection(db,"cuentasCorrientes")

    );

    let html = "";

    let total = 0;

    snapshot.forEach(doc=>{

        const movimiento = doc.data();

        const fecha = movimiento.fecha.toDate();

        const fechaTexto = fecha.toLocaleString("es-AR");

        if(movimiento.empleado !== nombre) return;

        total += movimiento.importe;

const color =

    movimiento.tipo === "Pago"

    ? "#16a34a"

    : "#ea580c";

const descripcion =

    movimiento.tipo === "Pago"

    ? "💰 Pago registrado"

    : `🍽 Mesa ${movimiento.mesa}`;

html += `

<div class="movimientoCuenta">

    <div class="movIzquierda">

        <div class="fechaMovimiento">

            📅 ${fechaTexto}

        </div>

        <div class="descripcionMovimiento">

            ${descripcion}

        </div>

        <div class="estadoMovimiento">

            ${movimiento.estado}

        </div>

    </div>

    <div

        class="importeMovimiento"

        style="color:${color};">

        ${movimiento.tipo === "Pago" ? "-" : "+"}

        $ ${Math.abs(movimiento.importe).toLocaleString()}

    </div>

</div>

`;

    });

html += `

<div class="resumenCuenta">

    <span>

        Saldo Actual

    </span>

    <h1>

        💰 $ ${total.toLocaleString()}

    </h1>

</div>

`;

    document.getElementById("tituloCuentaCorriente").textContent =

        nombre;

    document.getElementById("detalleCuentaCorriente").innerHTML =

        html;

    document.getElementById("modalCuentaCorriente")

        .classList.remove("oculto");
    
    document.getElementById("btnRegistrarPago").onclick = ()=>{

    registrarPago(nombre);

};

}

async function registrarPago(nombre){

    const importe = Number(

        document.getElementById("importePago").value

    );

    if(importe <= 0){

        alert("Ingrese un importe válido.");

        return;

    }

    const confirmar = confirm(

    `¿Confirma registrar un pago de $${importe.toLocaleString()} para ${nombre}?`

);

if(!confirmar) return;

    await addDoc(

        collection(db,"cuentasCorrientes"),

        {

            empleado: nombre,

            tipo: "Pago",

            importe: -importe,

            fecha: serverTimestamp(),

            estado: "Registrado"

        }

    );

    const usuario = JSON.parse(

    sessionStorage.getItem("usuario")

);

await registrarActividad(

    usuario.nombre,

    "Cuenta Corriente",

    "Registrar Pago",

    `${nombre} - Pago de $${importe.toLocaleString()}`

);

    alert("✅ Pago registrado correctamente.");

    document.getElementById("importePago").value = "";

    document.getElementById("modalCuentaCorriente")
        .classList.add("oculto");

    await cargarCuentas();

}