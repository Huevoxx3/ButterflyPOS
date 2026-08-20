
import { obtenerCarta } from "../js/services/cartaService.js";
import {
    abrirCaja
} from "../js/services/cajaService.js";
import {
    agregarProductoPedido,
    obtenerItemsPedido,
    guardarEdicionPedido
} from "../js/services/pedidoService.js";
import { registrarActividad } from "../js/services/actividadService.js";

import { db } from "../js/firebase.js";
import { abrirCobro } from "./cobro.js";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    addDoc,
    setDoc,
    increment,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const MESAS_SALON = [

    "AFUERA1",
    "AFUERA2",
    "AFUERA3",
    "AFUERA4",
    "AFUERA5",
    "AFUERA6",
    "AFUERA7",
    "AFUERA8",

    "BOX1",
    "BOX2",
    "BOX3",
    "BOX4",
    "BOX5",

    "MESA6",
    "MESA7",
    "MESA8",
    "MESA9",
    "MESA10",
    "MESA11",
    "MESA12",
    "MESA14",

    "6A",
    "7A",
    "10A",
    "C1",
    "C2",
    "C3",

    "COMUNITARIA-PUERTA",
    "COMUNITARIA-CENTRO-PUERTA",
    "COMUNITARIA-CENTRO",
    "COMUNITARIA-CENTRO-PUNTA",
    "COMUNITARIA-PUNTA"

];

let pedidoTemporal = [];

let pedidoOriginal = [];

let itemsEliminados = [];

let carritoCarta = [];

let totalTemporal = 0;

let modoSoloLectura = false;

async function actualizarEstadoCaja(){

    const documento = await getDoc(

        doc(db,"caja","actual")

    );

    const caja = documento.data();

    console.log("Estado de caja:", caja);
console.log("abierta =", caja.abierta);

    const estado = document.getElementById("estadoCaja");
const boton = document.getElementById("btnAbrirCaja");

if(!estado || !boton){

    return;

}

    if(caja.abierta){

        estado.innerHTML = `🟢 Caja Abierta`;

        estado.style.color = "#2ecc71";

        boton.style.display = "none";

    }else{

        estado.innerHTML = `🔴 Caja Cerrada`;

        estado.style.color = "#e74c3c";

        boton.style.display = "";

    }

}

async function gestionarAperturaCaja(){

    const usuario = JSON.parse(
        sessionStorage.getItem("usuario")
    );

    const esMediodia = confirm(
        `¿Abrir la caja para el turno MEDIODÍA?

Aceptar = MEDIODÍA
Cancelar = NOCHE`
    );

    const turno = esMediodia
        ? "MEDIODIA"
        : "NOCHE";

    const montoInicial = prompt(
        "Dinero inicial de la caja:",
        "0"
    );

    if(montoInicial === null){

        return false;

    }

    const confirmar = confirm(
        `Confirme la apertura de la caja

Turno: ${turno}
Monto inicial: $${Number(montoInicial).toLocaleString()}

¿Desea continuar?`
    );

    if(!confirmar){

        return false;

    }

    const abierta = await abrirCaja({

        usuario: usuario.nombre,

        turno,

        montoInicial:
            Number(montoInicial)

    });

    if(!abierta){

        return false;

    }

    await actualizarEstadoCaja();

    return true;

}

export default async function(admin = false){

    modoSoloLectura = admin;

    const respuesta = await fetch("../modules/salon.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    await dibujarMesas();

    await actualizarEstadoCaja();  
    
document.getElementById("btnAbrirCaja").onclick =
    gestionarAperturaCaja;

document.getElementById("btnReiniciarSistema").onclick =
reiniciarSistema;

}

async function dibujarMesas() {

    const plano = document.getElementById("planoSalon");

    plano.innerHTML = "";

    const snapshot = await getDocs(
        collection(db, "mesas")
    );

    // ==========================
    // ELEMENTOS FIJOS DEL PLANO
    // ==========================

    plano.innerHTML += `

        <div class="zonaAfuera">
            AFUERA
        </div>

        <div class="puertaSalon">
            PUERTA
        </div>

        <div class="barraSalon">
            BARRA
        </div>

    `;


    snapshot.forEach(documento => {

        const mesa = documento.data();

        const posiciones = {

            // AFUERA
            "AFUERA1": "pos-af1",
            "AFUERA2": "pos-af2",
            "AFUERA3": "pos-af3",
            "AFUERA4": "pos-af4",
            "AFUERA5": "pos-af5",
            "AFUERA6": "pos-af6",
            "AFUERA7": "pos-af7",
            "AFUERA8": "pos-af8",

            // BOX
            "BOX1": "pos-box1",
            "BOX2": "pos-box2",
            "BOX3": "pos-box3",
            "BOX4": "pos-box4",
            "BOX5": "pos-box5",

            // MESAS
            "MESA6": "pos-mesa6",
            "MESA7": "pos-mesa7",
            "MESA8": "pos-mesa8",
            "MESA9": "pos-mesa9",
            "MESA10": "pos-mesa10",
            "MESA11": "pos-mesa11",
            "MESA12": "pos-mesa12",
            "MESA14": "pos-mesa14",

            // MESAS ADICIONALES
"6A": "pos-mesa6a",
"7A": "pos-mesa7a",
"10A": "pos-mesa10a",
"C1": "pos-c1",
"C2": "pos-c2",
"C3": "pos-c3",

            // COMUNITARIA
            "COMUNITARIA-PUERTA":
                "pos-com-puerta",

            "COMUNITARIA-CENTRO-PUERTA":
                "pos-com-centro-puerta",

            "COMUNITARIA-CENTRO":
                "pos-com-centro",

            "COMUNITARIA-CENTRO-PUNTA":
                "pos-com-centro-punta",

            "COMUNITARIA-PUNTA":
                "pos-com-punta"

        };

        const clase =
            posiciones[mesa.numero];

        if(!clase){

            console.warn(
                "Mesa sin posición:",
                mesa.numero
            );

            return;

        }

        plano.innerHTML += `

            <div
                class="mesaCard ${clase}"
                data-mesa="${mesa.numero}"
            >

                <div class="mesaNumero">

                    ${mesa.numero}

                </div>

                <div
                    class="mesaEstado ${obtenerClase(mesa.estado)}"
                ></div>

            </div>

        `;

    });


    // ==========================
    // CLICK EN MESA
    // ==========================

    document
        .querySelectorAll(".mesaCard")
        .forEach(mesa => {

            mesa.addEventListener("click", () => {

                if(modoSoloLectura){

                    alert(
                        "Modo solo lectura."
                    );

                    return;

                }

                abrirMesa(
                    mesa.dataset.mesa
                );

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

    // ==========================
    // MESA LIBRE
    // ==========================

    if(mesa.estado === "Libre"){

                // ==========================
        // VERIFICAR CAJA
        // ==========================

        const documentoCaja = await getDoc(
            doc(db, "caja", "actual")
        );

        const caja = documentoCaja.data();

        if(!caja?.abierta){

            const abrirAhora = confirm(
                "🔴 La caja está cerrada.\n\n" +
                "¿Desea abrir la caja ahora?"
            );

            if(!abrirAhora){

                return;

            }

            const cajaAbierta =
                await gestionarAperturaCaja();

            if(!cajaAbierta){

                return;

            }

        }

        const personas = prompt("Cantidad de personas");

        if(!personas) return;

        const usuario = JSON.parse(
            sessionStorage.getItem("usuario")
        );

        await updateDoc(referencia,{

            estado:"Ocupada",

            personas:Number(personas),

            mozo:usuario.nombre,

            total:0

        });

        const pedido = await addDoc(

            collection(db,"pedidos"),

            {

                mesa: numero,

                estado:"Abierto",

                mozo:usuario.nombre,

                personas:Number(personas),

                total:0,

                fechaApertura:serverTimestamp()

            }

        );

        await updateDoc(referencia,{

            pedidoId:pedido.id

        });

await registrarActividad(

    usuario.nombre,

    "Salón",

    "Abrir Mesa",

    `Mesa ${numero} - ${personas} personas`

);

        await dibujarVistaSalon();

        return;

    }

    // ==========================
    // MESA OCUPADA SIN PEDIDO
    // (autocorrección)
    // ==========================

    if(!mesa.pedidoId){

        const pedido = await addDoc(

            collection(db,"pedidos"),

            {

                mmesa: numero,

                estado:"Abierto",

                mozo:mesa.mozo,

                personas:mesa.personas,

                total:mesa.total || 0,

                fechaApertura:serverTimestamp()

            }

        );

        mesa.pedidoId = pedido.id;

        await updateDoc(referencia,{

            pedidoId:pedido.id

        });

    }

  const mesaActualizada = await getDoc(referencia);

await mostrarModalMesa(

    mesaActualizada.data()

);

}

async function dibujarVistaSalon(){

    const respuesta = await fetch("../modules/salon.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    await dibujarMesas();

    await actualizarEstadoCaja();

}

async function mostrarModalMesa(mesa){

    document.getElementById("tituloMesa").textContent =
        "Mesa " + mesa.numero;

    const guardar = document.getElementById("btnGuardarCambios");

if (guardar) {

    guardar.remove();

}

document.getElementById("btnAgregarProducto").style.display = "";

document.getElementById("btnEditarPedido").style.display = "";

document.getElementById("btnCobrar").style.display = "";

const volver = document.getElementById("btnVolverSalon");

configurarBotonVolver();   

    document.getElementById("datosMesa").innerHTML = `

    <div class="datoCard">

        <div class="datoTitulo">

            👤 Mozo

        </div>

        <div class="datoValor">

            ${mesa.mozo}

        </div>

    </div>

    <div class="datoCard">

        <div class="datoTitulo">

            👥 Personas

        </div>

        <div class="datoValor">

            ${mesa.personas}

        </div>

    </div>

`;

    document.getElementById("totalMesa").textContent =
        "Total: $" + mesa.total.toLocaleString();

        console.log("================================");
console.log("Mesa:", mesa.numero);
console.log("PedidoId:", mesa.pedidoId);
console.log("Estado:", mesa.estado);

    const items = await obtenerItemsPedido(mesa.pedidoId);

let html = "";

if(items.length === 0){

    html = "<p>No hay productos cargados.</p>";

}else{

    /*items.forEach(item => {

    html += `

    <div class="cardUsuario pedidoItem">

        <div style="flex:1;">

            <strong>${item.nombre}</strong>

            <br>

            <small>

                Cantidad: ${item.cantidad}

            </small>

        </div>

        <div style="display:flex;align-items:center;gap:8px;">

            <button
    class="btnMenos"
    data-id="${item.id}"
    data-precio="${item.precio}"
    data-cantidad="${item.cantidad}">

    −

</button>

            <strong>

                ${item.cantidad}

            </strong>

            <button
    class="btnMas"
    data-id="${item.id}"
    data-precio="${item.precio}"
    data-cantidad="${item.cantidad}">

    +

</button>

            <button
    class="btnEliminar"
    data-id="${item.id}"
    data-precio="${item.precio}"
    data-cantidad="${item.cantidad}">

    🗑

</button>

        </div>

        <div style="min-width:90px;text-align:right;">

            $ ${(item.precio * item.cantidad).toLocaleString()}

        </div>

    </div>

    `;

});*/
//let modoEdicion = false;

items.forEach(item => {

    html += `

<div class="cardUsuario">

    <div>

        <strong>${item.nombre}</strong>

        <br>

        Cantidad: ${item.cantidad}

    </div>

    <div>

        $ ${(item.precio * item.cantidad).toLocaleString()}

    </div>

</div>


`;

});

}

document.getElementById("productosMesa").innerHTML = html;

    document
        .getElementById("modalMesa")
        .classList.remove("oculto");

   document
    .getElementById("btnVolverSalon")
    .onclick = cerrarModalMesa;

        document
    .getElementById("btnAgregarProducto")
    .onclick = () => abrirCarta(mesa);

    document.getElementById("btnEditarPedido").onclick = () => {

    activarModoEdicion(mesa);

};
document.getElementById("btnCobrar").onclick = () => {

    abrirCobro(

        mesa,

        async () => {

            const referencia = await getDoc(

                doc(db,"mesas",String(mesa.numero))

            );

            await mostrarModalMesa(

                referencia.data()

            );

        },

async () => {

    await dibujarVistaSalon();

}

    );

};

document.getElementById("btnMudarMesa").onclick = () => {

    abrirModalMudarMesa(mesa);

};

}

function cerrarModalMesa(){

    document.getElementById("btnAgregarProducto").style.display = "";

    document.getElementById("btnEditarPedido").style.display = "";

    document.getElementById("btnCobrar").style.display = "";

    configurarBotonVolver();

    document
        .getElementById("modalMesa")
        .classList.add("oculto");

}

function configurarBotonVolver(){

    const boton = document.getElementById("btnVolverSalon");

    boton.textContent = "← Volver";

    boton.onclick = cerrarModalMesa;

}
function activarModoEdicion(mesa){

    mostrarPedidoEdicion(mesa);

}

async function mostrarPedidoEdicion(mesa){  

    document.getElementById("btnAgregarProducto").style.display = "none";

    document.getElementById("btnEditarPedido").style.display = "none";

    document.getElementById("btnCobrar").style.display = "none";

    const volver = document.getElementById("btnVolverSalon");

    volver.textContent = "❌ Cancelar";

    volver.onclick = () => {

    pedidoTemporal = [];

    mostrarModalMesa(mesa);

};
document.getElementById("btnAgregarProducto").onclick = () => {

    abrirCartaEdicion(mesa);

};

    if(!document.getElementById("btnGuardarCambios")){

        const boton = document.createElement("button");

        boton.id = "btnGuardarCambios";

        boton.onclick = () => {

    guardarPedidoTemporal(mesa);

};

        boton.className = "btnPrincipal";

        boton.innerHTML = "💾 Guardar Cambios";

        document
            .querySelector(".accionesMesa")
            .prepend(boton);

    }
if (pedidoTemporal.length === 0) {

    const items = await obtenerItemsPedido(mesa.pedidoId);
    itemsEliminados = [];

    pedidoOriginal = structuredClone(items);

    pedidoTemporal = structuredClone(items);

    totalTemporal = pedidoTemporal.reduce(

    (total, item) => total + (item.precio * item.cantidad),

    0

);

}

let html = "";

pedidoTemporal.forEach(item => {

    html += `

   <div class="filaEdicion">

    <div class="filaEdicionSuperior">

        <div class="nombreProductoEdicion">

            ${item.nombre}

        </div>

        <div class="precioProductoEdicion">

            $ ${(item.precio * item.cantidad).toLocaleString()}

        </div>

    </div>

    <div class="editorCantidad">

        <button
            class="btnMenos"
            data-id="${item.id}">

            −

        </button>

        <span>

            ${item.cantidad}

        </span>

        <button
            class="btnMas"
            data-id="${item.id}">

            +

        </button>

    </div>

    <textarea
        class="txtObservacion"
        data-id="${item.id}"
        placeholder="Observaciones...">${item.observacion || ""}</textarea>

    <button
        class="btnEliminarProducto"
        data-id="${item.id}">

        🗑 Eliminar producto

    </button>

</div>

    `;

});

document.getElementById("productosMesa").innerHTML = html;

console.log(document.querySelectorAll(".btnMas"));
document.querySelectorAll(".btnMas").forEach(boton => {

    boton.onclick = () => {

        const item = pedidoTemporal.find(

            p => p.id === boton.dataset.id

        );

        if(!item) return;

        item.cantidad++;

        renderPedidoEdicion(mesa);

    };

});

document.querySelectorAll(".btnMenos").forEach(boton => {

    boton.onclick = () => {

        const item = pedidoTemporal.find(

            p => p.id === boton.dataset.id

        );

        if (!item) return;

        // Nunca permitir menos de 1
        if (item.cantidad > 1) {

            item.cantidad--;

        }

        renderPedidoEdicion(mesa);

    };

});

document.querySelectorAll(".btnEliminarProducto").forEach(boton => {

    boton.onclick = () => {

        const eliminado = pedidoTemporal.find(

            item => item.id === boton.dataset.id

        );

        if(eliminado){

            itemsEliminados.push(eliminado);

        }

        pedidoTemporal = pedidoTemporal.filter(

            item => item.id !== boton.dataset.id

        );

        renderPedidoEdicion(mesa);

    };

});

document.querySelectorAll(".txtObservacion").forEach(texto => {

    texto.oninput = () => {

        const item = pedidoTemporal.find(

            p => p.id === texto.dataset.id

        );

        if (!item) return;

        item.observacion = texto.value;

    };

});

}

function renderPedidoEdicion(mesa){

    totalTemporal = pedidoTemporal.reduce(

        (total, item) => total + (item.precio * item.cantidad),

        0

    );

    document.getElementById("totalMesa").textContent =
        "Total: $" + totalTemporal.toLocaleString();

    mostrarPedidoEdicion(mesa);

}

async function abrirCartaEdicion(mesa){

    alert("Carta en modo edición");

}

async function guardarPedidoTemporal(mesa){

await guardarEdicionPedido(

    mesa,

    pedidoOriginal,

    pedidoTemporal,

    itemsEliminados

);
// Limpiar memoria
pedidoTemporal = [];
pedidoOriginal = [];
itemsEliminados = [];

// Volver a leer la mesa
const referencia = await getDoc(
    doc(db, "mesas", String(mesa.numero))
);

await mostrarModalMesa(referencia.data());

}

function salirModoEdicion(mesa){

    document.getElementById("btnAgregarProducto").style.display = "";

    document.getElementById("btnEditarPedido").style.display = "";

    document.getElementById("btnCobrar").style.display = "";

    const volver = document.getElementById("btnVolverSalon");

    volver.textContent = "← Volver";

    volver.onclick = cerrarModalMesa;

}
async function abrirCarta(mesa){

    document
        .getElementById("modalCarta")
        .classList.remove("oculto");

    await cargarCartaSalon(mesa);

    document
        .getElementById("cerrarCartaSalon")
        .onclick = cerrarCartaSalon;

}

function cerrarCartaSalon(){

    document
        .getElementById("modalCarta")
        .classList.add("oculto");

}

async function aceptarPedidoCarta(mesa){

    if(carritoCarta.length === 0){

        alert("No agregó ningún producto.");

        return;

    }

    for(const item of carritoCarta){

        for(let i=0;i<item.cantidad;i++){

            await agregarProductoPedido(

                mesa,

                item.id,

                item.nombre,

                item.precio

            );

        }

    }

    carritoCarta = [];

    cerrarCartaSalon();

    const referencia = await getDoc(

        doc(db,"mesas",String(mesa.numero))

    );

    await mostrarModalMesa(

        referencia.data()

    );

}

async function cargarCartaSalon(mesa){

    const lista =
        document.getElementById("listaCartaSalon");

    const buscador =
    document.getElementById("buscarCartaSalon");
        lista.innerHTML = "";

const productos = await obtenerCarta();

    const categorias = {};

   productos.forEach(producto => {

        if(!producto.disponible) return;

        if(!categorias[producto.categoria]){

            categorias[producto.categoria]=[];

        }

        categorias[producto.categoria].push(producto);

    });

    Object.keys(categorias).sort().forEach(categoria=>{

        lista.innerHTML += `

<div class="tituloCategoria">

    ${categoria}

</div>

        `;

        categorias[categoria].forEach(producto=>{

    lista.innerHTML += `

    <div class="filaProducto">

        <div class="filaNombre">

            ${producto.nombre}

        </div>

        <div class="filaPrecio">

            $ ${producto.precio.toLocaleString()}

        </div>

        <div class="selectorCantidad">

    <button
        class="btnMenosCarta"
        data-id="${producto.id}">

        −

    </button>

    <span
        class="cantidadCarta"
        id="cant-${producto.id}">

        0

    </span>

    <button
        class="btnMasCarta"
        data-id="${producto.id}"
        data-nombre="${producto.nombre}"
        data-precio="${producto.precio}">

        +

    </button>

</div>

    </div>

    `;

});

    });

    document.querySelectorAll(".btnMasCarta").forEach(btn=>{

    btn.onclick=()=>{

        const existente=carritoCarta.find(

            item=>item.id===btn.dataset.id

        );

        if(existente){

            existente.cantidad++;

        }
        else{

            carritoCarta.push({

                id:btn.dataset.id,

                nombre:btn.dataset.nombre,

                precio:Number(btn.dataset.precio),

                cantidad:1

            });

        }

        actualizarCantidadesCarta();

    };

});

document.querySelectorAll(".btnMenosCarta").forEach(btn=>{

    btn.onclick=()=>{

        const existente = carritoCarta.find(

            item => item.id === btn.dataset.id

        );

        if(!existente) return;

        existente.cantidad--;

        if(existente.cantidad<=0){

            carritoCarta = carritoCarta.filter(

                item => item.id !== btn.dataset.id

            );

        }

        actualizarCantidadesCarta();

    };

});
    
/*   document.querySelectorAll(".btnAgregarCarta").forEach(btn => {

    btn.onclick = () => {

        const existente = carritoCarta.find(

    item => item.id === btn.dataset.id

);

if(existente){

    existente.cantidad++;

}
else{

    carritoCarta.push({

        id: btn.dataset.id,

        nombre: btn.dataset.nombre,

        precio: Number(btn.dataset.precio),

        cantidad:1

    });

}

        console.clear();

        console.table(carritoCarta);

    };

}); 


 /*    document.querySelectorAll(".btnAgregarCarta").forEach(btn => {

    btn.onclick = async () => {

    console.log("CLICK AGREGAR");

    await agregarProductoPedido(

        mesa,

        btn.dataset.id,

        btn.dataset.nombre,

        Number(btn.dataset.precio)

    );


const referencia = await getDoc(

    doc(db,"mesas",String(mesa.numero))

);

mostrarModalMesa(

    referencia.data()

);

    };

});*/
buscador.oninput = () => {

    const texto = buscador.value.toLowerCase();

document
    .querySelectorAll("#listaCartaSalon .filaProducto")
    .forEach(card => {

        const nombre = card.textContent.toLowerCase();

        card.style.display =
            nombre.includes(texto)
                ? "grid"
                : "none";

    });

document
    .querySelectorAll("#listaCartaSalon .tituloCategoria")
    .forEach(titulo => {

        let mostrar = false;

        let siguiente = titulo.nextElementSibling;

        while (
            siguiente &&
            !siguiente.classList.contains("tituloCategoria")
        ) {

            if (siguiente.style.display !== "none") {
                mostrar = true;
            }

            siguiente = siguiente.nextElementSibling;
        }

        titulo.style.display = mostrar ? "block" : "none";

    });

};

document.getElementById("btnAceptarPedido").onclick = async () => {

    await aceptarPedidoCarta(mesa);

};

}

function actualizarCantidadesCarta(){

    document
        .querySelectorAll(".cantidadCarta")
        .forEach(span=>{

            span.textContent="0";

        });

    carritoCarta.forEach(item=>{

        const cantidad=document.getElementById(

            "cant-"+item.id

        );

        if(cantidad){

            cantidad.textContent=item.cantidad;

        }

    });

}

async function reiniciarSistema(){

    const confirmar = confirm(

        "¿Desea reiniciar el sistema?\n\nSe eliminarán todos los pedidos, ventas, actividad y cierres de caja."

    );

    if(!confirmar) return;

    // ==========================
    // BORRAR ACTIVIDAD
    // ==========================

    const actividad = await getDocs(
        collection(db,"actividad")
    );

    for(const documento of actividad.docs){

        await deleteDoc(documento.ref);

    }

    // ==========================
    // BORRAR PEDIDOS
    // ==========================

    const pedidos = await getDocs(
        collection(db,"pedidos")
    );

    for(const pedido of pedidos.docs){

        const items = await getDocs(

            collection(
                db,
                "pedidos",
                pedido.id,
                "items"
            )

        );

        for(const item of items.docs){

            await deleteDoc(item.ref);

        }

        await deleteDoc(pedido.ref);

    }

    // ==========================
    // BORRAR COCINA
    // ==========================

    const cocina = await getDocs(
        collection(db,"cocina")
    );

    for(const producto of cocina.docs){

        await deleteDoc(producto.ref);

    }


    // ==========================
// BORRAR EGRESOS
// ==========================

const egresos = await getDocs(
    collection(db,"egresos")
);

for(const egreso of egresos.docs){

    await deleteDoc(egreso.ref);

}
    // ==========================
    // BORRAR VENTAS
    // ==========================

    const ventas = await getDocs(
        collection(db,"ventas")
    );

    for(const venta of ventas.docs){

        await deleteDoc(venta.ref);

    }

    // ==========================
    // BORRAR CIERRES DE CAJA
    // ==========================

    const cierres = await getDocs(
        collection(db,"cierresCaja")
    );

    for(const cierre of cierres.docs){

        await deleteDoc(cierre.ref);

    }

// ==========================
// RECREAR MESAS DEL SALÓN
// ==========================

const mesasActuales = await getDocs(
    collection(db, "mesas")
);

// Eliminar mesas antiguas
for(const mesa of mesasActuales.docs){

    await deleteDoc(mesa.ref);

}

// Crear mesas nuevas
for(const nombreMesa of MESAS_SALON){

    await setDoc(

        doc(
            db,
            "mesas",
            nombreMesa
        ),

        {
            numero: nombreMesa,
            estado: "Libre",
            mozo: "",
            pedidoId: "",
            personas: 0,
            total: 0
        }

    );

}

    // ==========================
    // REINICIAR CAJA
    // ==========================

    await updateDoc(

        doc(db,"caja","actual"),

        {

            abierta: false,

            fechaJornada: "",

            apertura: serverTimestamp(),

            cierre: null,

            usuario: ""

        }

    );

    await dibujarMesas();

    alert("✅ Sistema reiniciado correctamente.");

}

async function abrirModalMudarMesa(mesa){

    const snapshot = await getDocs(
        collection(db, "mesas")
    );

    const select = document.getElementById(
        "selectMesaDestino"
    );

    const texto = document.getElementById(
        "textoMesaMudar"
    );

    select.innerHTML = `
        <option value="">
            Seleccione una mesa
        </option>
    `;

    texto.textContent =
        `Mesa actual: ${mesa.numero}`;

    const mesasLibres = [];

    snapshot.forEach(documento => {

        const otraMesa = documento.data();

        if(
            String(otraMesa.numero) !== String(mesa.numero) &&
            otraMesa.estado === "Libre"
        ){

            mesasLibres.push(otraMesa);

        }

    });

mesasLibres.sort(
    (a, b) =>
        a.numero.localeCompare(
            b.numero,
            "es",
            {
                numeric: true
            }
        )
);

    if(mesasLibres.length === 0){

        alert(
            "⚠ No hay mesas libres disponibles."
        );

        return;

    }

    mesasLibres.forEach(otraMesa => {

        select.innerHTML += `

            <option value="${otraMesa.numero}">

                Mesa ${otraMesa.numero}

            </option>

        `;

    });

    document
        .getElementById("modalMudarMesa")
        .classList
        .remove("oculto");


    document.getElementById(
        "cancelarMudarMesa"
    ).onclick = () => {

        document
            .getElementById("modalMudarMesa")
            .classList
            .add("oculto");

    };


    document.getElementById(
        "confirmarMudarMesa"
    ).onclick = async () => {

        const numeroDestino = select.value;

        if(!numeroDestino){

            alert(
                "Seleccione una mesa destino."
            );

            return;

        }

        const confirmar = confirm(

            `¿Confirma mudar la mesa ${mesa.numero} ` +
            `a la mesa ${numeroDestino}?\n\n` +

            `Toda la cuenta será trasladada ` +
            `a la nueva mesa.`

        );

        if(!confirmar) return;


        const referenciaOrigen = doc(
            db,
            "mesas",
            String(mesa.numero)
        );

        const referenciaDestino = doc(
            db,
            "mesas",
            String(numeroDestino)
        );


        const origenActual = await getDoc(
            referenciaOrigen
        );

        const destinoActual = await getDoc(
            referenciaDestino
        );


        if(
            !origenActual.exists() ||
            !destinoActual.exists()
        ){

            alert(
                "❌ No se pudieron verificar las mesas."
            );

            return;

        }


        const datosOrigen =
            origenActual.data();

        const datosDestino =
            destinoActual.data();


        if(datosOrigen.estado !== "Ocupada"){

            alert(
                "⚠ La mesa original ya no está ocupada."
            );

            return;

        }


        if(datosDestino.estado !== "Libre"){

            alert(
                "⚠ La mesa destino ya no está libre."
            );

            return;

        }


        // ==========================
        // ACTUALIZAR PEDIDO
        // ==========================

        if(datosOrigen.pedidoId){

            await updateDoc(

                doc(
                    db,
                    "pedidos",
                    datosOrigen.pedidoId
                ),

                {
    mesa: numeroDestino
}

            );

        }


        // ==========================
        // LIBERAR ORIGEN
        // ==========================

        await updateDoc(

            referenciaOrigen,

            {

                estado: "Libre",

                personas: 0,

                mozo: "",

                pedidoId: "",

                total: 0

            }

        );


        // ==========================
        // OCUPAR DESTINO
        // ==========================

        await updateDoc(

            referenciaDestino,

            {

                estado: "Ocupada",

                personas: datosOrigen.personas,

                mozo: datosOrigen.mozo,

                pedidoId: datosOrigen.pedidoId,

                total: datosOrigen.total

            }

        );


        // ==========================
        // ACTIVIDAD
        // ==========================

        const usuario = JSON.parse(
            sessionStorage.getItem("usuario")
        );

        await registrarActividad(

            usuario.nombre,

            "Salón",

            "Mudar Mesa",

            `Mesa ${mesa.numero} → Mesa ${numeroDestino}`

        );


        document
            .getElementById("modalMudarMesa")
            .classList
            .add("oculto");


        document
            .getElementById("modalMesa")
            .classList
            .add("oculto");


        await dibujarMesas();


        alert(

            `✅ Mesa trasladada correctamente.\n\n` +

            `${mesa.numero} → ${numeroDestino}`

        );

    };

}