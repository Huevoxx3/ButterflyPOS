import { registrarActividad } from "../js/services/actividadService.js";

import { db } from "../js/firebase.js";

import { obtenerJornadaActual }
    from "../js/services/cajaService.js";

import {

    collection,

    getDocs,

    addDoc,

    getDoc,

    doc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function(){

    const respuesta = await fetch(

        "../modules/cuentaCorriente.html"

    );

    document.getElementById("contenido").innerHTML =

        await respuesta.text();

    await cargarCuentas();

const btnAdelanto =
    document.getElementById("btnRegistrarAdelanto");

if (btnAdelanto) {

    btnAdelanto.onclick = () => {

        document
            .getElementById("modalAdelanto")
            .classList.remove("oculto");

    };

}

console.log("BOTÓN ADELANTO:", btnAdelanto);

if (btnAdelanto) {

    btnAdelanto.onclick = async () => {

        console.log("CLICK ADELANTO");

        await cargarEmpleadosAdelanto();

        document.getElementById("importeAdelanto").value = "";

        document.getElementById("observacionAdelanto").value = "";

        document
            .getElementById("modalAdelanto")
            .classList.remove("oculto");

    };

}

    document.getElementById(

    "cerrarCuentaCorriente"

).onclick = ()=>{

    document.getElementById(

        "modalCuentaCorriente"

    ).classList.add("oculto");

};



document.getElementById("cancelarAdelanto").onclick = () => {

    document
        .getElementById("modalAdelanto")
        .classList.add("oculto");

};

document.getElementById("guardarAdelanto").onclick =
    guardarAdelanto;

}

async function cargarEmpleadosAdelanto(){

    const selector =
        document.getElementById("empleadoAdelanto");

    selector.innerHTML = `
        <option value="">
            Seleccione un empleado
        </option>
    `;


    // ==========================
    // OBTENER TODOS LOS EMPLEADOS
    // ==========================

    const snapshot = await getDocs(
        collection(db,"usuarios")
    );


    snapshot.forEach(documento => {

        const empleado = documento.data();


        // No mostrar usuarios inactivos

        if(empleado.activo === false) return;


        const opcion =
            document.createElement("option");


        opcion.value =
            documento.id;


        opcion.textContent =
            `${empleado.nombre} ${empleado.apellido}`;


        opcion.dataset.nombre =
            `${empleado.nombre} ${empleado.apellido}`;


        selector.appendChild(opcion);

    });

}

async function guardarAdelanto(){

    const selector =
        document.getElementById("empleadoAdelanto");

    const empleadoId = selector.value;

    const empleado =
        selector.selectedOptions[0]?.dataset.nombre || "";

    const importe =
        Number(
            document.getElementById("importeAdelanto").value
        ) || 0;

    const observacion =
        document.getElementById("observacionAdelanto")
            .value
            .trim();


    // ==========================
    // VALIDACIONES
    // ==========================

    if(!empleadoId){

        alert("Seleccione un empleado.");

        return;
    }

    if(importe <= 0){

        alert("Ingrese un importe válido.");

        return;
    }


    // ==========================
    // OBTENER JORNADA ACTUAL
    // ==========================

// ==========================
// VERIFICAR ESTADO REAL DE CAJA
// ==========================

const referenciaCaja = doc(
    db,
    "caja",
    "actual"
);

const documentoCaja = await getDoc(
    referenciaCaja
);

const cajaActual = documentoCaja.data();

if(!cajaActual || cajaActual.abierta !== true){

    alert(
        "⚠️ No hay una caja abierta.\n\n" +
        "Abra la caja antes de registrar un adelanto en efectivo."
    );

    return;
}

const jornada = cajaActual.fechaJornada;

    // ==========================
    // CONFIRMAR
    // ==========================

    const confirmar = confirm(

        `¿Confirma registrar un adelanto de $${importe.toLocaleString()} para ${empleado}?`

    );

    if(!confirmar) return;


    // ==========================
    // GUARDAR EN CUENTA CORRIENTE
    // ==========================

    await addDoc(

        collection(db,"cuentasCorrientes"),

        {

            empleadoId,

            empleado,

            tipo: "Adelanto",

            importe: -importe,

            jornada,

            fecha: serverTimestamp(),

            estado: "Registrado",

            observacion

        }

    );


    // ==========================
    // REGISTRAR EGRESO DE CAJA
    // ==========================

    await addDoc(

        collection(db,"egresos"),

        {

            jornada,

            tipo: "Adelanto",

            concepto: `Adelanto - ${empleado}`,

            empleadoId,

            empleado,

            importe,

            observacion,

            fecha: serverTimestamp(),

            estado: "Activo"

        }

    );


    // ==========================
    // REGISTRAR ACTIVIDAD
    // ==========================

    const usuario = JSON.parse(

        sessionStorage.getItem("usuario")

    );


    await registrarActividad(

        usuario.nombre,

        "Cuenta Corriente",

        "Registrar Adelanto",

        `${empleado} - Adelanto de $${importe.toLocaleString()}${
            observacion
                ? ` - ${observacion}`
                : ""
        }`

    );


    alert(

        "✅ Adelanto registrado correctamente."

    );


    // ==========================
    // LIMPIAR Y CERRAR
    // ==========================

    document.getElementById(
        "importeAdelanto"
    ).value = "";

    document.getElementById(
        "observacionAdelanto"
    ).value = "";

    document.getElementById(
        "modalAdelanto"
    ).classList.add("oculto");


    await cargarCuentas();

}

async function cargarCuentas(){

    const lista =
        document.getElementById("listaCuentaCorriente");

    lista.innerHTML = "";

    // ==========================
    // OBTENER MOVIMIENTOS
    // ==========================

    const snapshot = await getDocs(
        collection(db,"cuentasCorrientes")
    );

// ==========================
// OBTENER EMPLEADOS ACTIVOS
// ==========================

const usuariosSnapshot = await getDocs(
    collection(db,"usuarios")
);

const empleadosActivosPorId = {};
const empleadosActivosPorNombre = {};

usuariosSnapshot.forEach(documento => {

    const usuario = documento.data();

    if(usuario.activo === false) return;

    const nombreCompleto =
        `${usuario.nombre} ${usuario.apellido}`.trim();

    empleadosActivosPorId[documento.id] =
        nombreCompleto;

    empleadosActivosPorNombre[nombreCompleto] = true;

});


// ==========================
// CALCULAR SALDOS
// ==========================

const empleados = {};

snapshot.forEach(documento => {

const movimiento = documento.data();

if(movimiento.estado === "Anulado"){
    return;
}

if(!movimiento.empleado && !movimiento.empleadoId){
    return;
}

    let nombreEmpleado = movimiento.empleado;

    if(
        movimiento.empleadoId &&
        empleadosActivosPorId[movimiento.empleadoId]
    ){

        nombreEmpleado =
            empleadosActivosPorId[movimiento.empleadoId];

    }

    else if(
        !nombreEmpleado ||
        !empleadosActivosPorNombre[nombreEmpleado]
    ){

        return;

    }

    if(!empleados[nombreEmpleado]){

        empleados[nombreEmpleado] = 0;

    }

    if(
        movimiento.tipo === "Pago" ||
        movimiento.tipo === "Adelanto"
    ){

        empleados[nombreEmpleado] +=
            movimiento.importe || 0;

    }else{

        empleados[nombreEmpleado] +=
            movimiento.importeFinal ??
            movimiento.importe ??
            0;

    }

});

    // ==========================
    // MOSTRAR CUENTAS
    // ==========================

    Object.keys(empleados)

        .filter(nombre => empleados[nombre] !== 0)

        .sort()

        .forEach(nombre => {

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


    // ==========================
    // BOTONES DETALLE
    // ==========================

    document
        .querySelectorAll(".btnDetalleCuenta")
        .forEach(boton => {

            boton.onclick = () => {

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

   if(movimiento.estado === "Anulado"){

    return;

}

if(movimiento.tipo === "Pago"){

    total += movimiento.importe || 0;

}
else if(movimiento.tipo === "Adelanto"){

    total += movimiento.importe || 0;

}
else{

    total += movimiento.importeFinal || 0;

}

const color =

    movimiento.tipo === "Pago"

    ? "#16a34a"

    : "#ea580c";

const descripcion =

    movimiento.tipo === "Pago"

    ? "💰 Pago registrado"

    : `🍽 Mesa ${movimiento.mesa}`;

if(movimiento.tipo === "Pago"){

    html += `

    <div class="movimientoCuenta">

        <div class="movIzquierda">

            <div class="fechaMovimiento">
                📅 ${fechaTexto}
            </div>

            <div class="descripcionMovimiento">
                💰 Pago registrado
            </div>

            <div class="estadoMovimiento">
                ${movimiento.estado}
            </div>

        </div>

        <div
            class="importeMovimiento"
            style="color:#16a34a;">

            - $ ${Math.abs(movimiento.importe || 0).toLocaleString()}

        </div>

    </div>

    `;

}
else if(movimiento.tipo === "Adelanto"){

    html += `

    <div class="movimientoCuenta">

        <div class="movIzquierda">

            <div class="fechaMovimiento">
                📅 ${fechaTexto}
            </div>

            <div class="descripcionMovimiento">
                💵 Adelanto
            </div>

            <div class="estadoMovimiento">
                ${movimiento.estado}
            </div>

            ${
                movimiento.observacion
                    ? `
                    <div
                        style="margin-top:8px;font-size:14px;color:#555;">

                        📝 ${movimiento.observacion}

                    </div>
                    `
                    : ""
            }

        </div>

        <div
            class="importeMovimiento"
            style="color:#ea580c;">

            $ ${(movimiento.importe || 0).toLocaleString()}

        </div>

    </div>

    `;

}
else{

    html += `

    <div class="movimientoCuenta">

        <div class="movIzquierda">

            <div class="fechaMovimiento">
                📅 ${fechaTexto}
            </div>

            <div class="descripcionMovimiento">
                🍽 Mesa ${movimiento.mesa}
            </div>

            <div class="estadoMovimiento">
                ${movimiento.estado}
            </div>

            <div
                style="
                    margin-top:8px;
                    font-size:14px;
                    color:#555;
                ">

                <div>

                    Consumido:

                    <strong>

                        $ ${(movimiento.importeOriginal || 0).toLocaleString()}

                    </strong>

                </div>

                <div style="color:#16a34a;">

                    Beneficio empleado:

                    <strong>

                        - $ ${(movimiento.descuentoTotal || 0).toLocaleString()}

                    </strong>

                </div>

                <div style="margin-top:4px;">

                    Total a descontar:

                    <strong>

                        $ ${(movimiento.importeFinal || 0).toLocaleString()}

                    </strong>

                </div>

            </div>

        </div>

        <div
            class="importeMovimiento"
            style="color:#ea580c;">

            $ ${(movimiento.importeFinal || 0).toLocaleString()}

        </div>

    </div>

    `;

}

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