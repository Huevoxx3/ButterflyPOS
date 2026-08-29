import { obtenerJornadaActual } from "../js/services/cajaService.js";

import { registrarActividad } from "../js/services/actividadService.js";

import { db } from "../js/firebase.js";

import {

    collection,

    addDoc,

    getDocs,

    getDoc,

    doc,

    query,

    where,

    orderBy,

    updateDoc,

serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

function calcularDescuentoCuentaCorriente(
    productos,
    descuentoComidas,
    descuentoBebidas
){

    const categoriasBebidas = [

        "Cerveza Artesanal",
        "Con Alcohol",
        "Sin Alcohol"

    ];

    let importeOriginal = 0;

    let totalComidas = 0;

    let totalBebidas = 0;


    productos.forEach(producto => {

        const subtotal =
            producto.precio * producto.cantidad;


        // ==========================
        // TOTAL ORIGINAL
        // ==========================

        importeOriginal += subtotal;


        // ==========================
        // PROMOCIONES
        // SIN DESCUENTO
        // ==========================

        if(producto.categoria === "PROMOCIONES"){

            return;

        }


        // ==========================
        // BEBIDAS
        // ==========================

        if(
            categoriasBebidas.includes(
                producto.categoria
            )
        ){

            totalBebidas += subtotal;

        }

        // ==========================
        // COMIDAS
        // ==========================

        else{

            totalComidas += subtotal;

        }

    });


    const descuentoComidasImporte =
        Math.round(
            totalComidas *
            descuentoComidas /
            100
        );


    const descuentoBebidasImporte =
        Math.round(
            totalBebidas *
            descuentoBebidas /
            100
        );


    const descuentoTotal =
        descuentoComidasImporte +
        descuentoBebidasImporte;


    return {

        importeOriginal,

        descuentoComidas:
            descuentoComidasImporte,

        descuentoBebidas:
            descuentoBebidasImporte,

        descuentoTotal,

        importeFinal:
            importeOriginal -
            descuentoTotal

    };

}

let modoSoloLectura = false;

export default async function mostrarMesasCerradas(admin = null){

    if(admin !== null){

        modoSoloLectura = admin;

    }

    const jornada = await obtenerJornadaActual();
    
    const contenido = document.getElementById("contenido");

    contenido.innerHTML = "<h1>Mesas Cerradas</h1>";

    const snapshot = await getDocs(

    query(

        collection(db,"ventas"),

        where("jornada","==",jornada),

        orderBy("fecha","desc")

    )

);

    snapshot.forEach(documento=>{

    const venta = documento.data();

    contenido.innerHTML += `

<div
    class="cardUsuario cardVenta"
    data-id="${documento.id}">

<div class="datosVenta">

    <strong>

        🍽 Mesa ${venta.mesa}

    </strong>

    <span>

        👤 ${venta.mozo}

    </span>

    <span>

        💳 ${venta.medioPago}

    </span>

</div>

    <div>

<strong>

    $ ${
        venta.medioPago === "Cuenta Corriente" &&
        venta.importeCuentaCorriente !== undefined

            ? Number(venta.importeCuentaCorriente).toLocaleString()

            : Number(venta.totalCobrado).toLocaleString()
    }

</strong>

    </div>

    <button
    class="btnVerTicket"
    data-id="${documento.id}">

    🧾 Ver ticket

</button>

</div>

`;

});

document.querySelectorAll(".cardVenta").forEach(card=>{

    card.onclick=()=>{

        abrirVenta(card.dataset.id);

    };

});

document.querySelectorAll(".btnVerTicket").forEach(boton => {

    boton.onclick = (e) => {

        e.stopPropagation();

        const ventaId = boton.dataset.id;

        window.open(

            `../modules/ticket.html?venta=${ventaId}`,

            "_blank"

        );

    };

});

async function abrirVenta(id){

    const documento = await getDoc(

        doc(db,"ventas",id)

    );

    const venta = documento.data();

    const contenido = document.getElementById("contenido");

let html = `

<div class="detalleVenta">

<button id="btnVolverVentas" class="btnGris">

← Volver

</button>

<h1>

🧾 Detalle de Venta

</h1>

<div class="cardResumenVenta">

    <h2>

        Mesa ${venta.mesa}

    </h2>

    <p>

        👤 <strong>Mozo:</strong>

        ${venta.mozo}

    </p>

    <p>

        💳 <strong>Medio de Pago:</strong>

        ${venta.medioPago}

    </p>

    <p>

        💲 <strong>Subtotal:</strong>

        $ ${Number(venta.subtotal).toLocaleString()}

    </p>

<p class="totalVenta">

    ${
        venta.medioPago === "Cuenta Corriente" &&
        venta.importeCuentaCorriente !== undefined

            ? "Total Cuenta Corriente"

            : "Total Cobrado"
    }

    $ ${
        venta.medioPago === "Cuenta Corriente" &&
        venta.importeCuentaCorriente !== undefined

            ? Number(venta.importeCuentaCorriente).toLocaleString()

            : Number(venta.totalCobrado).toLocaleString()
    }

</p>

</div>

<h2 class="tituloSeccion">

Productos

</h2>
`;

venta.productos.forEach(producto=>{

    html += `

<div class="cardProducto">

    <div style="width:100%;">

        <h3 style="margin-bottom:10px;">

            ${producto.nombre}

        </h3>

        <p>

            <strong>Cantidad:</strong>

            ${producto.cantidad}

        </p>

        <p>

            <strong>Precio:</strong>

            $ ${Number(producto.precio).toLocaleString()}

        </p>

        ${
            producto.descuento > 0

            ?

            `

            <p style="color:#d97706;">

                <strong>

                    🟠 Descuento: ${producto.descuento}%

                </strong>

            </p>

            <p>

                <strong>Motivo:</strong>

                ${producto.motivoDescuento}

            </p>

            `

            : ""

        }

        ${
            producto.invitado

            ?

            `

            <p style="color:#dc2626;">

                <strong>

                    🔴 NO COBRADO

                </strong>

            </p>

            <p>

                <strong>Motivo:</strong>

                ${producto.motivoNoCobrar}

            </p>

            `

            : ""

        }

    </div>

</div>

`;

});

if(venta.descuentoGeneral > 0){

    html += `

<hr>

<h3>

🟢 Descuento General

</h3>

<p>

<strong>Descuento:</strong>

${venta.descuentoGeneral} %

</p>

<p>

<strong>Motivo:</strong>

${venta.motivo}

</p>

`;

}

    html += `

<hr>

<h3>

Medio de Pago

</h3>

<select id="medioPagoEditar">

    <option value="Efectivo">💵 Efectivo</option>

    <option value="MercadoPago">📱 MercadoPago</option>

    <option value="Banco Provincia">🏦 Banco Provincia</option>

    <option value="Cuenta Corriente">📒 Cuenta Corriente</option>

    <option value="Pendiente">⏳ Pendiente</option>

</select>

<div
    id="grupoEmpleadoCuenta"
    style="display:none; margin-top:15px;">

    <label>

        👤 <strong>Empleado</strong>

    </label>

    <select
        id="empleadoCuentaEditar"
        style="width:100%; margin-top:5px;">

        <option value="">
            Seleccione un empleado
        </option>

    </select>

</div>

<br>

<h3>

Observaciones

</h3>

<textarea
    id="observacionesVenta"
    rows="4"
    style="width:100%;"></textarea>

<br><br>

<button
    id="btnGuardarVenta"
    class="btnPrincipal">

💾 Guardar Cambios

</button>

</div>

`;

    contenido.innerHTML = html;

    if (modoSoloLectura) {

    document.getElementById("medioPagoEditar").disabled = true;

    document.getElementById("observacionesVenta").disabled = true;

    document.getElementById("btnGuardarVenta").style.display = "none";

}

    document.getElementById("medioPagoEditar").value =
    venta.medioPago;

    // ==========================
// EMPLEADO CUENTA CORRIENTE
// ==========================

const selectorEmpleado =
    document.getElementById("empleadoCuentaEditar");

const grupoEmpleado =
    document.getElementById("grupoEmpleadoCuenta");


// Cargar empleados activos

const usuariosSnapshot = await getDocs(
    collection(db,"usuarios")
);

usuariosSnapshot.forEach(documento => {

    const usuario = documento.data();

    if(usuario.activo === false) return;

    const option =
        document.createElement("option");

    option.value = documento.id;

    option.textContent =
        `${usuario.nombre} ${usuario.apellido}`;

    selectorEmpleado.appendChild(option);

});


// Mostrar / ocultar según medio de pago

function actualizarEmpleadoCuenta(){

    if(
        document.getElementById("medioPagoEditar").value
        === "Cuenta Corriente"
    ){

        grupoEmpleado.style.display = "";

    }else{

        grupoEmpleado.style.display = "none";

        selectorEmpleado.value = "";

    }

}


// Detectar cambios

document
    .getElementById("medioPagoEditar")
    .addEventListener(
        "change",
        actualizarEmpleadoCuenta
    );


// Si la venta ya era Cuenta Corriente,
// mostrar el selector automáticamente.

actualizarEmpleadoCuenta();

document.getElementById("observacionesVenta").value =
    venta.observaciones || "";

document.getElementById("btnVolverVentas").onclick = () => {

    mostrarMesasCerradas();

};

    document.getElementById("btnGuardarVenta").onclick = async () => {

    const medioPago =
        document.getElementById("medioPagoEditar").value;

    const selectorEmpleado =
        document.getElementById("empleadoCuentaEditar");


    // ==========================
    // VALIDAR CUENTA CORRIENTE
    // ==========================

    if(medioPago === "Cuenta Corriente"){

        if(!selectorEmpleado.value){

            alert(
                "⚠️ Debe seleccionar el empleado para la Cuenta Corriente."
            );

            return;

        }

    }


    // ==========================
    // DATOS A ACTUALIZAR
    // ==========================

const datosActualizar = {

    medioPago: medioPago,

    observaciones:
        document.getElementById("observacionesVenta").value,

    ultimaEdicion:
        serverTimestamp()

};


    // ==========================
    // GUARDAR EMPLEADO
    // ==========================

    if(medioPago === "Cuenta Corriente"){

        datosActualizar.cuentaCorrienteEmpleadoId =
            selectorEmpleado.value;

        datosActualizar.cuentaCorrienteEmpleado =
            selectorEmpleado.selectedOptions[0].textContent;

    }

// ==========================
// GESTIONAR CUENTA CORRIENTE
// ==========================


// ==================================================
// CASO 1:
// ANTES NO ERA CUENTA CORRIENTE
// AHORA PASA A CUENTA CORRIENTE
// ==================================================

if(
    venta.medioPago !== "Cuenta Corriente" &&
    medioPago === "Cuenta Corriente"
){

    const empleadoId =
        selectorEmpleado.value;

    const empleado =
        selectorEmpleado.selectedOptions[0].textContent;


    const resumen =
        calcularDescuentoCuentaCorriente(
            venta.productos,
            25,
            20
        );

    // Guardar los valores de Cuenta Corriente
// también dentro de la venta.

datosActualizar.descuentoCuentaCorriente =
    resumen.descuentoTotal;

datosActualizar.importeCuentaCorriente =
    resumen.importeFinal;

    await addDoc(

        collection(db,"cuentasCorrientes"),

        {

            empleadoId: empleadoId,

            empleado: empleado,

            ventaId: id,

            pedidoId: venta.pedidoId || "",

            mesa: venta.mesa,

            importe: resumen.importeFinal,

            importeOriginal:
                resumen.importeOriginal,

            descuentoComidas:
                resumen.descuentoComidas,

            descuentoBebidas:
                resumen.descuentoBebidas,

            descuentoTotal:
                resumen.descuentoTotal,

            importeFinal:
                resumen.importeFinal,

            productos: venta.productos,

            fecha: serverTimestamp(),

            estado: "Pendiente",

            tipo: "Consumo"

        }

    );

    // ==========================
// REGISTRAR EN ACTIVIDAD
// ==========================

await registrarActividad(

    venta.mozo || "Sistema",

    "Cobro",

    "Cambio medio de pago",

    `Mesa ${venta.mesa} - ${venta.medioPago} → Cuenta Corriente - ` +
    `Empleado: ${empleado} - ` +
    `Importe original: $${resumen.importeOriginal.toLocaleString("es-AR")} - ` +
    `Descuento empleado: $${resumen.descuentoTotal.toLocaleString("es-AR")} - ` +
    `Importe final: $${resumen.importeFinal.toLocaleString("es-AR")}`,

    {

        ventaId: id,

        pedidoId: venta.pedidoId || "",

        mesa: venta.mesa,

        medioPagoAnterior:
            venta.medioPago,

        medioPagoNuevo:
            "Cuenta Corriente",

        empleadoId:
            empleadoId,

        empleado:
            empleado,

        importeOriginal:
            resumen.importeOriginal,

        descuentoCuentaCorriente:
            resumen.descuentoTotal,

        importeCuentaCorriente:
            resumen.importeFinal

    }

);

}


// ==================================================
// CASO 2:
// ANTES ERA CUENTA CORRIENTE
// AHORA PASA A OTRO MEDIO
// ==================================================

if(
    venta.medioPago === "Cuenta Corriente" &&
    medioPago !== "Cuenta Corriente"
){

    const movimientosSnapshot = await getDocs(

        query(

            collection(db,"cuentasCorrientes"),

            where("ventaId","==",id)

        )

    );


// ==================================================
// CASO 2:
// ANTES ERA CUENTA CORRIENTE
// AHORA PASA A OTRO MEDIO
// ==================================================

if(
    venta.medioPago === "Cuenta Corriente" &&
    medioPago !== "Cuenta Corriente"
){

    const movimientosSnapshot = await getDocs(

        query(

            collection(db,"cuentasCorrientes"),

            where("ventaId","==",id)

        )

    );


    for(
        const movimiento of movimientosSnapshot.docs
    ){

        const datosMovimiento =
            movimiento.data();


        // Solo anulamos movimientos
        // que todavía estén activos.

        if(
            datosMovimiento.estado !== "Anulado"
        ){

            await updateDoc(

                doc(
                    db,
                    "cuentasCorrientes",
                    movimiento.id
                ),

                {

                    estado: "Anulado",

                    fechaAnulacion:
                        serverTimestamp()

                }

            );

        }

    }


    // ==========================
    // REGISTRAR EN ACTIVIDAD
    // ==========================

    await registrarActividad(

        venta.mozo || "Sistema",

        "Cobro",

        "Cambio medio de pago",

        `Mesa ${venta.mesa} - Cuenta Corriente → ${medioPago} - ` +
        `Empleado: ${venta.cuentaCorrienteEmpleado || "Sin empleado"} - ` +
        `Importe Cuenta Corriente: $${(
            Number(venta.importeCuentaCorriente) ||
            Number(venta.totalCobrado) ||
            0
        ).toLocaleString("es-AR")} - ` +
        `Movimiento de Cuenta Corriente: Anulado`,

        {

            ventaId: id,

            pedidoId:
                venta.pedidoId || "",

            mesa:
                venta.mesa,

            medioPagoAnterior:
                "Cuenta Corriente",

            medioPagoNuevo:
                medioPago,

            empleadoId:
                venta.cuentaCorrienteEmpleadoId || "",

            empleado:
                venta.cuentaCorrienteEmpleado || "",

            importeCuentaCorriente:
                Number(venta.importeCuentaCorriente) ||
                Number(venta.totalCobrado) ||
                0,

            movimientoCuentaCorriente:
                "Anulado"

        }

    );

}
}


// ==================================================
// CASO 3:
// SIGUE SIENDO CUENTA CORRIENTE
// PERO CAMBIA EL EMPLEADO
// ==================================================

if(
    venta.medioPago === "Cuenta Corriente" &&
    medioPago === "Cuenta Corriente"
){

    const empleadoNuevoId =
        selectorEmpleado.value;

    const empleadoNuevo =
        selectorEmpleado.selectedOptions[0].textContent;


    const movimientosSnapshot = await getDocs(

        query(

            collection(db,"cuentasCorrientes"),

            where("ventaId","==",id)

        )

    );


    let movimientoActivo = null;


    movimientosSnapshot.forEach(movimiento => {

        const datos =
            movimiento.data();


        if(
            datos.estado !== "Anulado"
        ){

            movimientoActivo = {

                id: movimiento.id,

                ...datos

            };

        }

    });


    // ------------------------------------------
    // MISMO EMPLEADO
    // ------------------------------------------

    if(
        movimientoActivo &&
        movimientoActivo.empleadoId === empleadoNuevoId
    ){

        // No hacemos nada.
        // La cuenta ya pertenece a ese empleado.

    }


    // ------------------------------------------
    // EMPLEADO DIFERENTE
    // ------------------------------------------

    else{

        // Primero anulamos el movimiento anterior.

        if(movimientoActivo){

            await updateDoc(

                doc(
                    db,
                    "cuentasCorrientes",
                    movimientoActivo.id
                ),

                {

                    estado: "Anulado",

                    fechaAnulacion:
                        serverTimestamp()

                }

            );

        }


        // Calculamos nuevamente el descuento.

        const resumen =
            calcularDescuentoCuentaCorriente(
                venta.productos,
                25,
                20
            );

        datosActualizar.descuentoCuentaCorriente =
    resumen.descuentoTotal;

datosActualizar.importeCuentaCorriente =
    resumen.importeFinal;


        // Creamos el nuevo movimiento
        // para el nuevo empleado.

        await addDoc(

            collection(db,"cuentasCorrientes"),

            {

                empleadoId:
                    empleadoNuevoId,

                empleado:
                    empleadoNuevo,

                ventaId:
                    id,

                pedidoId:
                    venta.pedidoId || "",

                mesa:
                    venta.mesa,

                importe:
                    resumen.importeFinal,

                importeOriginal:
                    resumen.importeOriginal,

                descuentoComidas:
                    resumen.descuentoComidas,

                descuentoBebidas:
                    resumen.descuentoBebidas,

                descuentoTotal:
                    resumen.descuentoTotal,

                importeFinal:
                    resumen.importeFinal,

                productos:
                    venta.productos,

                fecha:
                    serverTimestamp(),

                estado:
                    "Pendiente",

                tipo:
                    "Consumo"

            }

        );
            // ==========================
        // REGISTRAR EN ACTIVIDAD
        // ==========================

        await registrarActividad(

            venta.mozo || "Sistema",

            "Cobro",

            "Cambio empleado Cuenta Corriente",

            `Mesa ${venta.mesa} - ` +
            `Cuenta Corriente: ${venta.cuentaCorrienteEmpleado || "Sin empleado"} → ${empleadoNuevo} - ` +
            `Importe: $${resumen.importeFinal.toLocaleString("es-AR")} - ` +
            `Descuento empleado: $${resumen.descuentoTotal.toLocaleString("es-AR")}`,

            {

                ventaId:
                    id,

                pedidoId:
                    venta.pedidoId || "",

                mesa:
                    venta.mesa,

                empleadoAnteriorId:
                    venta.cuentaCorrienteEmpleadoId || "",

                empleadoAnterior:
                    venta.cuentaCorrienteEmpleado || "",

                empleadoNuevoId:
                    empleadoNuevoId,

                empleadoNuevo:
                    empleadoNuevo,

                importeOriginal:
                    resumen.importeOriginal,

                descuentoCuentaCorriente:
                    resumen.descuentoTotal,

                importeCuentaCorriente:
                    resumen.importeFinal,

                movimientoCuentaCorriente:
                    "Anterior anulado / Nuevo creado"

            }

        );

    }

}

    await updateDoc(

        doc(db,"ventas",id),

        datosActualizar

    );


    mostrarMesasCerradas();

};

}

}