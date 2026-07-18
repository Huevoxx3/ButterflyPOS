
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

export default async function(admin = false){

    modoSoloLectura = admin;

    const respuesta = await fetch("../modules/salon.html");

    document.getElementById("contenido").innerHTML =
        await respuesta.text();

    await dibujarMesas();

    await actualizarEstadoCaja();  
    
    document.getElementById("btnAbrirCaja").onclick = async () => {

    const usuario = JSON.parse(
        sessionStorage.getItem("usuario")
    );

    const abierta = await abrirCaja(usuario.nombre);

if(!abierta) return;

await actualizarEstadoCaja();

};

document.getElementById("btnReiniciarSistema").onclick =
reiniciarSistema;

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

        if (modoSoloLectura) {

            alert("Modo solo lectura.");

            return;

        }

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

    // ==========================
    // MESA LIBRE
    // ==========================

    if(mesa.estado === "Libre"){

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

                mesa:Number(numero),

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

                mesa:Number(numero),

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
    // REINICIAR MESAS
    // ==========================

    const mesas = await getDocs(
        collection(db,"mesas")
    );

    for(const mesa of mesas.docs){

        await updateDoc(

            mesa.ref,

            {

                estado: "Libre",

                personas: 0,

                mozo: "",

                pedidoId: "",

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