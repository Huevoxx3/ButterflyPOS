import { db } from "../js/firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


export default async function cargarStock() {

    const contenido = document.getElementById("contenido");

    contenido.innerHTML = `
        <div class="contenedor-modulo">

<div class="encabezado-modulo">

    <div>
        <h1>Stock</h1>
        <p>Gestión de existencias e ingredientes</p>
    </div>

    <button id="btnNuevoIngrediente" class="btn-principal">
        + Nuevo ingrediente
    </button>

</div>

<div class="tabs-stock">

    <button class="tab-stock activa" data-seccion="existencias">
        Existencias
    </button>

    <button class="tab-stock" data-seccion="recetas">
        Recetas
    </button>

    <button class="tab-stock" data-seccion="consumo">
        Consumo
    </button>

    <button class="tab-stock" data-seccion="stock-estimado">
    Stock estimado
</button>

</div>


            <div class="card">

                <div class="barra-stock">

                    <div>
                        <strong>Existencias</strong>
                    </div>

                    <div id="ultimaActualizacion">
                        Cargando...
                    </div>

                </div>


                <div class="tabla-contenedor">

                    <table class="tabla-stock">

                        <thead>
                            <tr>
                                <th>Ingrediente</th>
                                <th>Unidad</th>
                                <th>Cantidad</th>
                                <th>Última actualización</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody id="tablaStock">

                            <tr>
                                <td colspan="5">
                                    Cargando stock...
                                </td>
                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>


        <div id="modalIngrediente" class="modal oculto">

            <div class="modal-contenido">

                <div class="modal-header">

                    <h2 id="tituloModalIngrediente">
                        Nuevo ingrediente
                    </h2>

                    <button
                        id="cerrarModalIngrediente"
                        class="btn-cerrar"
                    >
                        ×
                    </button>

                </div>


                <div class="formulario">

                    <label>
                        Ingrediente

                        <input
                            type="text"
                            id="nombreIngrediente"
                            placeholder="Ej: Muzzarella"
                        >

                    </label>


                    <label>
                        Unidad de medida

                        <select id="unidadIngrediente">

                            <option value="">
                                Seleccionar
                            </option>

                            <option value="Kg">
                                Kg
                            </option>

                            <option value="g">
                                g
                            </option>

                            <option value="Lts">
                                Lts
                            </option>

                            <option value="ml">
                                ml
                            </option>

                            <option value="Unidad">
                                Unidad
                            </option>

                        </select>

                    </label>


                    <label>
                        Cantidad disponible

                        <input
                            type="number"
                            id="cantidadIngrediente"
                            min="0"
                            step="0.01"
                            placeholder="Ej: 25"
                        >

                    </label>


                    <button
                        id="guardarIngrediente"
                        class="btn-principal"
                    >
                        Guardar
                    </button>

                </div>

            </div>

        </div>
    `;


    let ingredienteEditando = null;


    const modal =
        document.getElementById("modalIngrediente");

    const btnNuevo =
        document.getElementById("btnNuevoIngrediente");

    const tabsStock =
    document.querySelectorAll(".tab-stock");

tabsStock.forEach(tab => {

    tab.addEventListener("click", () => {

        tabsStock.forEach(t =>
            t.classList.remove("activa")
        );

        tab.classList.add("activa");

        const seccion = tab.dataset.seccion;

if (seccion === "existencias") {

    document
        .getElementById("btnNuevoIngrediente")
        .style.display = "";

    cargarStock();

    return;
}


if (seccion === "recetas") {

    document
        .getElementById("btnNuevoIngrediente")
        .style.display = "none";

    mostrarRecetas();

    return;
}


if (seccion === "consumo") {

    document
        .getElementById("btnNuevoIngrediente")
        .style.display = "none";

    mostrarConsumo();

    return;
}


if (seccion === "stock-estimado") {

    document
        .getElementById("btnNuevoIngrediente")
        .style.display = "none";

    mostrarStockEstimado();

    return;
}

    });

});

    const btnCerrar =
        document.getElementById("cerrarModalIngrediente");

    const btnGuardar =
        document.getElementById("guardarIngrediente");


    // ==========================
    // NUEVO INGREDIENTE
    // ==========================

    btnNuevo.addEventListener("click", () => {

        ingredienteEditando = null;

        document.getElementById(
            "tituloModalIngrediente"
        ).textContent = "Nuevo ingrediente";

        document.getElementById(
            "nombreIngrediente"
        ).value = "";

        document.getElementById(
            "unidadIngrediente"
        ).value = "";

        document.getElementById(
            "cantidadIngrediente"
        ).value = "";

        modal.classList.remove("oculto");

    });


    // ==========================
    // CERRAR MODAL
    // ==========================

    btnCerrar.addEventListener("click", () => {

        modal.classList.add("oculto");

    });


    // ==========================
    // GUARDAR
    // ==========================

    btnGuardar.addEventListener("click", async () => {

        const nombre =
            document
                .getElementById("nombreIngrediente")
                .value
                .trim();

        const unidad =
            document
                .getElementById("unidadIngrediente")
                .value;

        const cantidad =
            Number(
                document
                    .getElementById("cantidadIngrediente")
                    .value
            );


        if (!nombre) {

            alert(
                "Ingresá el nombre del ingrediente."
            );

            return;
        }


        if (!unidad) {

            alert(
                "Seleccioná una unidad de medida."
            );

            return;
        }


        if (isNaN(cantidad) || cantidad < 0) {

            alert(
                "Ingresá una cantidad válida."
            );

            return;
        }


        try {

            if (ingredienteEditando) {

                await updateDoc(
                    doc(
                        db,
                        "ingredientesStock",
                        ingredienteEditando
                    ),
                    {
                        nombre,
                        unidad,
                        cantidad,
                        fechaActualizacion:
                            serverTimestamp()
                    }
                );

            } else {

                await addDoc(
                    collection(
                        db,
                        "ingredientesStock"
                    ),
                    {
                        nombre,
                        unidad,
                        cantidad,
                        fechaActualizacion:
                            serverTimestamp()
                    }
                );

            }


            modal.classList.add("oculto");

            await cargarIngredientes();


        } catch (error) {

            console.error(
                "Error guardando ingrediente:",
                error
            );

            alert(
                "No se pudo guardar el ingrediente."
            );

        }

    });


    // ==========================
    // CARGAR INGREDIENTES
    // ==========================

    async function cargarIngredientes() {

        const tabla =
            document.getElementById("tablaStock");


        try {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "ingredientesStock"
                    )
                );


            if (snapshot.empty) {

                tabla.innerHTML = `
                    <tr>
                        <td colspan="5">
                            No hay ingredientes cargados.
                        </td>
                    </tr>
                `;

                document.getElementById(
                    "ultimaActualizacion"
                ).textContent =
                    "Sin ingredientes cargados";

                return;
            }


            let ingredientes = [];


            snapshot.forEach((docSnap) => {

                ingredientes.push({

                    id: docSnap.id,

                    ...docSnap.data()

                });

            });


            ingredientes.sort((a, b) =>
                a.nombre.localeCompare(
                    b.nombre
                )
            );


            tabla.innerHTML = "";


            ingredientes.forEach(
                (ingrediente) => {

                    const fecha =
                        ingrediente
                            .fechaActualizacion
                            ?.toDate
                            ? ingrediente
                                .fechaActualizacion
                                .toDate()
                            : null;


                    const fechaTexto =
                        fecha
                            ? fecha.toLocaleDateString(
                                "es-ES"
                            )
                            : "-";


                    const fila =
                        document.createElement(
                            "tr"
                        );


                    fila.innerHTML = `

                        <td>
                            ${ingrediente.nombre}
                        </td>

                        <td>
                            ${ingrediente.unidad}
                        </td>

                        <td>
                            <strong>
                                ${ingrediente.cantidad}
                            </strong>
                        </td>

                        <td>
                            ${fechaTexto}
                        </td>

                        <td>

                            <button
                                class="btn-editar-stock"
                                data-id="${ingrediente.id}"
                            >
                                Editar
                            </button>

                        </td>

                    `;


                    tabla.appendChild(fila);

                }
            );


            document.getElementById(
                "ultimaActualizacion"
            ).textContent =
                `Actualizado al ${
                    new Date().toLocaleDateString(
                        "es-ES"
                    )
                }`;


            // ==========================
            // EDITAR
            // ==========================

            document
                .querySelectorAll(
                    ".btn-editar-stock"
                )
                .forEach((boton) => {

                    boton.addEventListener(
                        "click",
                        () => {

                            const ingrediente =
                                ingredientes.find(
                                    item =>
                                        item.id ===
                                        boton.dataset.id
                                );


                            if (!ingrediente)
                                return;


                            ingredienteEditando =
                                ingrediente.id;


                            document.getElementById(
                                "tituloModalIngrediente"
                            ).textContent =
                                "Editar ingrediente";


                            document.getElementById(
                                "nombreIngrediente"
                            ).value =
                                ingrediente.nombre;


                            document.getElementById(
                                "unidadIngrediente"
                            ).value =
                                ingrediente.unidad;


                            document.getElementById(
                                "cantidadIngrediente"
                            ).value =
                                ingrediente.cantidad;


                            modal.classList.remove(
                                "oculto"
                            );

                        }
                    );

                });


        } catch (error) {

            console.error(
                "Error cargando stock:",
                error
            );


            tabla.innerHTML = `
                <tr>
                    <td colspan="5">
                        Error al cargar el stock.
                    </td>
                </tr>
            `;

        }

    }

async function mostrarRecetas() {

    const tablaStock =
        document.getElementById("tablaStock");

    const encabezado =
        document.querySelector(".barra-stock");

    encabezado.innerHTML = `
        <div>
            <strong>Recetas</strong>
        </div>

        <div>
            
        </div>
    `;

    tablaStock.innerHTML = `
        <tr>
            <td colspan="5">
                Cargando productos...
            </td>
        </tr>
    `;

    try {

        // =========================================
        // CARGAR PRODUCTOS DE CARTA
        // =========================================

        const snapshot =
            await getDocs(
                collection(db, "carta")
            );


        if (snapshot.empty) {

            tablaStock.innerHTML = `
                <tr>
                    <td colspan="5">
                        No hay productos cargados en la Carta.
                    </td>
                </tr>
            `;

            return;
        }


        let productos = [];


        snapshot.forEach(docSnap => {

            productos.push({
                id: docSnap.id,
                ...docSnap.data()
            });

        });


        productos = productos
            .filter(
                producto =>
                    producto.disponible !== false
            )
            .sort(
                (a, b) =>
                    a.nombre.localeCompare(b.nombre)
            );


        // =========================================
        // CARGAR RECETAS
        // =========================================

        const recetasSnapshot =
            await getDocs(
                collection(db, "recetas")
            );


        const recetasExistentes = {};


        recetasSnapshot.forEach(docSnap => {

            recetasExistentes[
                docSnap.id
            ] = docSnap.data();

        });


        // =========================================
        // MOSTRAR PRODUCTOS
        // =========================================

        tablaStock.innerHTML = "";


        productos.forEach(producto => {

            const tieneReceta =
                recetasExistentes[
                    producto.id
                ] &&
                Array.isArray(
                    recetasExistentes[
                        producto.id
                    ].ingredientes
                ) &&
                recetasExistentes[
                    producto.id
                ].ingredientes.length > 0;


            const fila =
                document.createElement("tr");


            fila.className =
                tieneReceta
                    ? "producto-con-receta"
                    : "producto-sin-receta";


            fila.innerHTML = `

                <td>
                    <strong>
                        ${producto.nombre}
                    </strong>
                </td>


                <td>
                    ${producto.categoria || "-"}
                </td>


                <td>
                    -
                </td>


                <td>

                    ${
                        tieneReceta
                            ? `
                                <span class="estado-receta encontrada">
                                    Receta cargada
                                </span>
                            `
                            : `
                                <span class="estado-receta sin-receta">
                                    Sin receta
                                </span>
                            `

                    }

                </td>


                <td>

                    <button
                        class="btn-editar-receta"
                        data-id="${producto.id}"
                    >

                        ${
                            tieneReceta
                                ? "Editar receta"
                                : "Cargar receta"
                        }

                    </button>

                </td>

            `;


            tablaStock.appendChild(fila);

        });


        // =========================================
        // BOTONES
        // =========================================

        document
            .querySelectorAll(".btn-editar-receta")
            .forEach(boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        const producto =
                            productos.find(
                                item =>
                                    item.id ===
                                    boton.dataset.id
                            );


                        if (!producto) {
                            return;
                        }


                        abrirEditorReceta(
                            producto
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Error cargando productos para recetas:",
            error
        );


        tablaStock.innerHTML = `
            <tr>
                <td colspan="5">
                    Error al cargar los productos.
                </td>
            </tr>
        `;

    }

}

async function abrirEditorReceta(producto) {

    const tablaStock =
        document.getElementById("tablaStock");

    const encabezado =
        document.querySelector(".barra-stock");

    encabezado.innerHTML = `
        <div>
            <strong>Receta: ${producto.nombre}</strong>
        </div>

        <div>
            ${producto.categoria || ""}
        </div>
    `;

tablaStock.innerHTML = `

    <tr>
        <td colspan="5">

            <div class="editor-receta">

                <h3>
                    Ingredientes
                </h3>

                <div id="listaIngredientesReceta">
                    Cargando receta...
                </div>

                <button
                    id="btnAgregarIngredienteReceta"
                    class="btn-principal"
                >
                    + Agregar ingrediente
                </button>

            </div>

        </td>
    </tr>

`;

const listaIngredientes =
    document.getElementById(
        "listaIngredientesReceta"
    );

let ingredientesReceta = [];

try {

    const referenciaReceta =
        doc(db, "recetas", producto.id);

    const recetaSnapshot =
        await getDoc(referenciaReceta);

    if (
        !recetaSnapshot.exists() ||
        !recetaSnapshot.data().ingredientes ||
        recetaSnapshot.data().ingredientes.length === 0
    ) {

        listaIngredientes.innerHTML = `
            <p>
                Todavía no hay ingredientes cargados
                en esta receta.
            </p>
        `;

    } else {

        ingredientesReceta =
    recetaSnapshot.data().ingredientes;

        listaIngredientes.innerHTML = `

            <table class="tabla-receta">

                <thead>

                    <tr>
    <th>Ingrediente</th>
    <th>Cantidad</th>
    <th>Unidad</th>
    <th>Acción</th>
</tr>

                </thead>

                <tbody>

                    ${ingredientesReceta.map(
    (ingrediente, indice) => `

        <tr>

            <td>
                ${ingrediente.ingredienteNombre}
            </td>

            <td>
                ${ingrediente.cantidad}
            </td>

            <td>
                ${ingrediente.unidad}
            </td>

<td>

    <button
        class="btn-editar-ingrediente"
        data-indice="${indice}"
    >
        Editar
    </button>

    <button
        class="btn-eliminar-ingrediente"
        data-indice="${indice}"
    >
        Eliminar
    </button>

</td>

        </tr>

    `
).join("")}

                </tbody>

            </table>

        `;

    }

} catch (error) {

    console.error(
        "Error cargando receta:",
        error
    );

    listaIngredientes.innerHTML = `
        <p>
            No se pudo cargar la receta.
        </p>
    `;

}

document
    .querySelectorAll(".btn-editar-ingrediente")
    .forEach(boton => {

        boton.addEventListener(
            "click",
            async () => {

                const indice =
                    Number(
                        boton.dataset.indice
                    );

                const ingrediente =
                    ingredientesReceta[indice];

                const nuevaCantidad =
                    prompt(
                        `Ingresá la nueva cantidad de ${ingrediente.ingredienteNombre} (${ingrediente.unidad}):`,
                        ingrediente.cantidad
                    );

                if (nuevaCantidad === null) {
                    return;
                }

                const cantidadEditada =
                    Number(nuevaCantidad);

                if (
                    isNaN(cantidadEditada) ||
                    cantidadEditada <= 0
                ) {

                    alert(
                        "Ingresá una cantidad válida."
                    );

                    return;
                }

                ingrediente.cantidad =
                    cantidadEditada;

                const referenciaReceta =
                    doc(
                        db,
                        "recetas",
                        producto.id
                    );

                await setDoc(
                    referenciaReceta,
                    {
                        productoId:
                            producto.id,

                        productoNombre:
                            producto.nombre,

                        ingredientes:
                            ingredientesReceta,

                        fechaActualizacion:
                            serverTimestamp()
                    }
                );

                abrirEditorReceta(producto);

            }
        );

    });

document
    .querySelectorAll(".btn-eliminar-ingrediente")
    .forEach(boton => {

        boton.addEventListener(
            "click",
            async () => {

                const indice =
                    Number(
                        boton.dataset.indice
                    );

                const confirmar =
                    confirm(
                        `¿Deseás eliminar "${ingredientesReceta[indice].ingredienteNombre}" de esta receta?`
                    );

                if (!confirmar) {
                    return;
                }

                ingredientesReceta.splice(
                    indice,
                    1
                );

                const referenciaReceta =
                    doc(
                        db,
                        "recetas",
                        producto.id
                    );

                await setDoc(
                    referenciaReceta,
                    {
                        productoId:
                            producto.id,

                        productoNombre:
                            producto.nombre,

                        ingredientes:
                            ingredientesReceta,

                        fechaActualizacion:
                            serverTimestamp()
                    }
                );

                alert(
                    "Ingrediente eliminado correctamente."
                );

                abrirEditorReceta(producto);

            }
        );

    });

document
    .getElementById("btnAgregarIngredienteReceta")
    .addEventListener("click", async () => {

        try {

            const snapshot =
                await getDocs(
                    collection(db, "ingredientesStock")
                );

            if (snapshot.empty) {

                alert(
                    "Primero tenés que cargar ingredientes en Existencias."
                );

                return;
            }

            let ingredientes = [];

            snapshot.forEach(docSnap => {

                ingredientes.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });

            });

            ingredientes.sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
            );


            const opciones =
                ingredientes.map(ingrediente => `

                    <option value="${ingrediente.id}">
                        ${ingrediente.nombre} (${ingrediente.unidad})
                    </option>

                `).join("");


            const editor =
                document.querySelector(".editor-receta");


            const formulario =
                document.createElement("div");

            formulario.className =
                "formulario-ingrediente-receta";


            formulario.innerHTML = `

                <hr>

                <h3>
                    Agregar ingrediente
                </h3>

                <label>
                    Ingrediente

                    <select id="ingredienteReceta">

                        <option value="">
                            Seleccionar ingrediente
                        </option>

                        ${opciones}

                    </select>

                </label>


                <label>
                    Cantidad por unidad

                    <input
                        type="number"
                        id="cantidadReceta"
                        min="0"
                        step="0.001"
                        placeholder="Ej: 0.250"
                    >

                </label>


                <div class="unidad-receta">

                    Unidad:
                    <strong id="unidadReceta">
                        -
                    </strong>

                </div>


                <div class="acciones-receta">

                    <button
                        id="cancelarIngredienteReceta"
                        class="btn-secundario"
                    >
                        Cancelar
                    </button>

                    <button
                        id="confirmarIngredienteReceta"
                        class="btn-principal"
                    >
                        Agregar
                    </button>

                </div>

            `;


            editor.appendChild(formulario);


            const selector =
                document.getElementById(
                    "ingredienteReceta"
                );

            const unidad =
                document.getElementById(
                    "unidadReceta"
                );


            selector.addEventListener(
                "change",
                () => {

                    const ingrediente =
                        ingredientes.find(
                            item =>
                                item.id ===
                                selector.value
                        );


                    unidad.textContent =
                        ingrediente
                            ? ingrediente.unidad
                            : "-";

                }
            );


            document
                .getElementById(
                    "cancelarIngredienteReceta"
                )
                .addEventListener(
                    "click",
                    () => {

                        formulario.remove();

                    }
                );


            document
                .getElementById(
                    "confirmarIngredienteReceta"
                )
                .addEventListener(
    "click",
    async () => {

                        const ingrediente =
                            ingredientes.find(
                                item =>
                                    item.id ===
                                    selector.value
                            );

                        const cantidad =
                            Number(
                                document
                                    .getElementById(
                                        "cantidadReceta"
                                    )
                                    .value
                            );


                        if (!ingrediente) {

                            alert(
                                "Seleccioná un ingrediente."
                            );

                            return;
                        }


                        if (
                            isNaN(cantidad) ||
                            cantidad <= 0
                        ) {

                            alert(
                                "Ingresá una cantidad válida."
                            );

                            return;
                        }


                        const receta = {
    productoId: producto.id,
    productoNombre: producto.nombre,
    ingredientes: [
        {
            ingredienteId: ingrediente.id,
            ingredienteNombre: ingrediente.nombre,
            cantidad: cantidad,
            unidad: ingrediente.unidad
        }
    ],
    fechaActualizacion: serverTimestamp()
};

try {

const referenciaReceta =
    doc(db, "recetas", producto.id);

const recetaExistente =
    await getDoc(referenciaReceta);

let ingredientesReceta = [];

if (recetaExistente.exists()) {

    ingredientesReceta =
        recetaExistente.data().ingredientes || [];

}

const ingredienteYaExiste =
    ingredientesReceta.find(
        item =>
            item.ingredienteId ===
            ingrediente.id
    );

if (ingredienteYaExiste) {

    const editar =
        confirm(
            `El ingrediente "${ingrediente.nombre}" ya se encuentra agregado.\n\n¿Deseás editar la cantidad?`
        );

    if (!editar) {
        return;
    }

    const nuevaCantidad =
        prompt(
            `Ingresá la nueva cantidad de ${ingrediente.nombre} (${ingrediente.unidad}):`,
            ingredienteYaExiste.cantidad
        );

    if (nuevaCantidad === null) {
        return;
    }

    const cantidadEditada =
        Number(nuevaCantidad);

    if (
        isNaN(cantidadEditada) ||
        cantidadEditada <= 0
    ) {

        alert(
            "Ingresá una cantidad válida."
        );

        return;
    }

    ingredienteYaExiste.cantidad =
        cantidadEditada;

    await setDoc(
        referenciaReceta,
        {
            productoId: producto.id,
            productoNombre: producto.nombre,
            ingredientes: ingredientesReceta,
            fechaActualizacion:
                serverTimestamp()
        }
    );

    alert(
        "Cantidad actualizada correctamente."
    );

    return;
}

ingredientesReceta.push({

    ingredienteId: ingrediente.id,
    ingredienteNombre: ingrediente.nombre,
    cantidad: cantidad,
    unidad: ingrediente.unidad

});

await setDoc(
    referenciaReceta,
    {
        productoId: producto.id,
        productoNombre: producto.nombre,
        ingredientes: ingredientesReceta,
        fechaActualizacion:
            serverTimestamp()
    }
);

    alert(
        "Receta guardada correctamente."
    );

    abrirEditorReceta(producto);

} catch (error) {

    console.error(
        "Error guardando receta:",
        error
    );

    alert(
        "No se pudo guardar la receta."
    );

}

                    }
                );

        } catch (error) {

            console.error(
                "Error cargando ingredientes:",
                error
            );

            alert(
                "No se pudieron cargar los ingredientes."
            );

        }

    });

}

async function mostrarConsumo() {

    const tablaStock =
        document.getElementById("tablaStock");

    tablaStock.innerHTML = `

        <tr>
            <td colspan="5">

                <div class="editor-receta">

                    <h3>
                        Consumo estimado
                    </h3>

                    <div class="filtros-consumo">

                        <div class="campo-consumo">

                            <label for="fechaDesdeConsumo">
                                Desde
                            </label>

                            <input
                                type="date"
                                id="fechaDesdeConsumo"
                            >

                        </div>


                        <div class="campo-consumo">

                            <label for="fechaHastaConsumo">
                                Hasta
                            </label>

                            <input
                                type="date"
                                id="fechaHastaConsumo"
                            >

                        </div>


                        <button
                            id="btnCalcularConsumo"
                            class="btn-principal"
                        >
                            Calcular consumo
                        </button>

                    </div>


                    <div
                        id="resultadoConsumo"
                        class="resultado-consumo"
                    >

                        <p>
                            Seleccioná un período para
                            calcular el consumo estimado.
                        </p>

                    </div>

                </div>

            </td>
        </tr>

    `;


    // =========================================
    // CALCULAR CONSUMO
    // =========================================

    document
        .getElementById("btnCalcularConsumo")
        .addEventListener(
            "click",
            async () => {

                const fechaDesde =
                    document.getElementById(
                        "fechaDesdeConsumo"
                    ).value;

                const fechaHasta =
                    document.getElementById(
                        "fechaHastaConsumo"
                    ).value;


                if (!fechaDesde || !fechaHasta) {

                    alert(
                        "Seleccioná las dos fechas."
                    );

                    return;
                }


                if (fechaDesde > fechaHasta) {

                    alert(
                        "La fecha Desde no puede ser posterior a la fecha Hasta."
                    );

                    return;
                }


                const resultado =
                    document.getElementById(
                        "resultadoConsumo"
                    );


                resultado.innerHTML = `
                    <p>
                        Cargando ventas...
                    </p>
                `;


                try {

                    const snapshot =
                        await getDocs(
                            collection(
                                db,
                                "ventas"
                            )
                        );


                    // =========================================
                    // CONVERTIR FECHAS SELECCIONADAS
                    // =========================================

                    const partesDesde =
                        fechaDesde.split("-");

                    const partesHasta =
                        fechaHasta.split("-");


                    const inicio =
                        new Date(
                            Number(partesDesde[0]),
                            Number(partesDesde[1]) - 1,
                            Number(partesDesde[2]),
                            0,
                            0,
                            0,
                            0
                        );


                    // Usamos el día siguiente a "Hasta"
                    // para incluir todas las ventas de ese día.

                    const fin =
                        new Date(
                            Number(partesHasta[0]),
                            Number(partesHasta[1]) - 1,
                            Number(partesHasta[2]) + 1,
                            0,
                            0,
                            0,
                            0
                        );


                    // =========================================
                    // FILTRAR VENTAS
                    // =========================================

                    const ventasPeriodo = [];


                    snapshot.forEach(
                        documento => {

                            const venta =
                                documento.data();


                            if (!venta.fecha) {
                                return;
                            }


                            const fechaVenta =
                                venta.fecha.toDate();


                            if (
                                fechaVenta >= inicio &&
                                fechaVenta < fin
                            ) {

                                ventasPeriodo.push({
                                    id: documento.id,
                                    ...venta
                                });

                            }

                        }
                    );


                    // =========================================
                    // AGRUPAR PRODUCTOS VENDIDOS
                    // =========================================

                    const productosVendidos = {};


                    ventasPeriodo.forEach(
                        venta => {

                            if (
                                !Array.isArray(
                                    venta.productos
                                )
                            ) {
                                return;
                            }


                            venta.productos.forEach(
    producto => {

        if (
            !producto.productoId
        ) {
            return;
        }


        if (
            !productosVendidos[
                producto.productoId
            ]
        ) {

            productosVendidos[
                producto.productoId
            ] = {

                id:
                    producto.productoId,

                nombre:
                    producto.nombre ||
                    "Producto sin nombre",

                cantidad:
                    0

            };

        }


        productosVendidos[
            producto.productoId
        ].cantidad +=
            Number(
                producto.cantidad
            ) || 0;

    }
);

                        }
                    );


                    const listaProductos =
                        Object.values(
                            productosVendidos
                        );

// =========================================
// BUSCAR RECETAS DE LOS PRODUCTOS
// =========================================

for (const producto of listaProductos) {

    const referenciaReceta =
        doc(
            db,
            "recetas",
            producto.id
        );

    const recetaSnapshot =
        await getDoc(
            referenciaReceta
        );

    if (recetaSnapshot.exists()) {

        producto.receta =
            recetaSnapshot.data().ingredientes || [];

    } else {

        producto.receta = [];

    }

}

// =========================================
// CALCULAR CONSUMO DE INGREDIENTES
// =========================================

const consumoIngredientes = {};

listaProductos.forEach(
    producto => {

        if (
            !producto.receta ||
            producto.receta.length === 0
        ) {
            return;
        }

        producto.receta.forEach(
            ingrediente => {

                if (
                    !ingrediente.ingredienteId
                ) {
                    return;
                }

                if (
                    !consumoIngredientes[
                        ingrediente.ingredienteId
                    ]
                ) {

                    consumoIngredientes[
                        ingrediente.ingredienteId
                    ] = {

                        ingredienteId:
                            ingrediente.ingredienteId,

                        nombre:
                            ingrediente.ingredienteNombre,

                        unidad:
                            ingrediente.unidad,

                        cantidad:
                            0

                    };

                }

                consumoIngredientes[
                    ingrediente.ingredienteId
                ].cantidad +=
                    (
                        Number(
                            producto.cantidad
                        ) || 0
                    ) *
                    (
                        Number(
                            ingrediente.cantidad
                        ) || 0
                    );

            }
        );

    }
);

const listaConsumo =
    Object.values(
        consumoIngredientes
    );

                    // =========================================
                    // MOSTRAR RESULTADO
                    // =========================================

                    if (
                        listaProductos.length === 0
                    ) {

                        resultado.innerHTML = `

                            <p>
                                No se encontraron ventas
                                en el período seleccionado.
                            </p>

                        `;

                        return;
                    }


 resultado.innerHTML = `

    <h4>
        Ventas del período
    </h4>

    <table class="tabla-receta">

        <thead>

            <tr>
                <th>Producto</th>
                <th>Cantidad vendida</th>
                <th>Receta</th>
            </tr>

        </thead>

        <tbody>

            ${
                listaProductos.map(
                    producto => `

<tr class="${
    producto.receta.length > 0
        ? "producto-con-receta"
        : "producto-sin-receta"
}">

    <td>
        ${producto.nombre}
    </td>

    <td>
        ${producto.cantidad}
    </td>

    <td>

        ${
            producto.receta.length > 0
                ? `<span class="estado-receta encontrada">Encontrada</span>`
                : `<span class="estado-receta sin-receta">Sin receta</span>`
        }

    </td>

</tr>

                    `
                ).join("")
            }

        </tbody>

    </table>


    <h4>
        Consumo estimado de ingredientes
    </h4>


    <table class="tabla-receta">

        <thead>

            <tr>
                <th>Ingrediente</th>
                <th>Consumo estimado</th>
                <th>Unidad</th>
            </tr>

        </thead>

        <tbody>

            ${
                listaConsumo.length > 0
                    ? listaConsumo.map(
                        ingrediente => `

                            <tr>

                                <td>
                                    ${ingrediente.nombre}
                                </td>

                                <td>
                                    ${ingrediente.cantidad}
                                </td>

                                <td>
                                    ${ingrediente.unidad}
                                </td>

                            </tr>

                        `
                    ).join("")
                    : `
                        <tr>

                            <td colspan="3">
                                No hay consumo estimado
                                para este período.
                            </td>

                        </tr>
                    `
            }

        </tbody>

    </table>

`;
                } catch (error) {

                    console.error(
                        "Error calculando consumo:",
                        error
                    );


                    resultado.innerHTML = `

                        <p>
                            No se pudieron cargar
                            las ventas.
                        </p>

                    `;

                }

            }
        );

}

async function mostrarStockEstimado() {

    const tablaStock =
        document.getElementById("tablaStock");

    const encabezado =
        document.querySelector(".barra-stock");

    encabezado.innerHTML = `
        <div>
            <strong>Stock estimado</strong>
        </div>

        <div>
            Calculá el stock estimado según las ventas del período
        </div>
    `;

    tablaStock.innerHTML = `
        <tr>
            <td colspan="5">

                <div class="editor-receta">

                    <h3>
                        Stock estimado
                    </h3>

                    <div class="filtros-consumo">

                        <div class="campo-consumo">

                            <label for="fechaDesdeStock">
                                Desde
                            </label>

                            <input
                                type="date"
                                id="fechaDesdeStock"
                            >

                        </div>


                        <div class="campo-consumo">

                            <label for="fechaHastaStock">
                                Hasta
                            </label>

                            <input
                                type="date"
                                id="fechaHastaStock"
                            >

                        </div>


                        <button
                            id="btnCalcularStock"
                            class="btn-principal"
                        >
                            Calcular stock
                        </button>

                    </div>


                    <div
                        id="resultadoStockEstimado"
                        class="resultado-consumo"
                    >

                        <p>
                            Seleccioná un período para
                            calcular el stock estimado.
                        </p>

                    </div>

                </div>

            </td>
        </tr>
    `;


    // =========================================
    // CALCULAR STOCK ESTIMADO
    // =========================================

    document
        .getElementById("btnCalcularStock")
        .addEventListener(
            "click",
            async () => {

                const fechaDesde =
                    document.getElementById(
                        "fechaDesdeStock"
                    ).value;

                const fechaHasta =
                    document.getElementById(
                        "fechaHastaStock"
                    ).value;


                if (!fechaDesde || !fechaHasta) {

                    alert(
                        "Seleccioná las dos fechas."
                    );

                    return;
                }


                if (fechaDesde > fechaHasta) {

                    alert(
                        "La fecha Desde no puede ser posterior a la fecha Hasta."
                    );

                    return;
                }


                const resultado =
                    document.getElementById(
                        "resultadoStockEstimado"
                    );


                resultado.innerHTML = `
                    <p>
                        Calculando stock estimado...
                    </p>
                `;


                try {

                    // =========================================
                    // CARGAR STOCK ACTUAL
                    // =========================================

                    const snapshotStock =
                        await getDocs(
                            collection(
                                db,
                                "ingredientesStock"
                            )
                        );


                    const ingredientesStock = {};


                    snapshotStock.forEach(
                        documento => {

                            const ingrediente =
                                documento.data();

                            ingredientesStock[
                                documento.id
                            ] = {

                                id: documento.id,

                                nombre:
                                    ingrediente.nombre,

                                unidad:
                                    ingrediente.unidad,

                                cantidad:
                                    Number(
                                        ingrediente.cantidad
                                    ) || 0

                            };

                        }
                    );


                    // =========================================
                    // CARGAR VENTAS
                    // =========================================

                    const snapshotVentas =
                        await getDocs(
                            collection(
                                db,
                                "ventas"
                            )
                        );


                    // =========================================
                    // CONVERTIR FECHAS
                    // =========================================

                    const partesDesde =
                        fechaDesde.split("-");

                    const partesHasta =
                        fechaHasta.split("-");


                    const inicio =
                        new Date(
                            Number(partesDesde[0]),
                            Number(partesDesde[1]) - 1,
                            Number(partesDesde[2]),
                            0,
                            0,
                            0,
                            0
                        );


                    const fin =
                        new Date(
                            Number(partesHasta[0]),
                            Number(partesHasta[1]) - 1,
                            Number(partesHasta[2]) + 1,
                            0,
                            0,
                            0,
                            0
                        );


                    // =========================================
                    // AGRUPAR PRODUCTOS VENDIDOS
                    // =========================================

                    const productosVendidos = {};


                    snapshotVentas.forEach(
                        documento => {

                            const venta =
                                documento.data();


                            if (!venta.fecha) {
                                return;
                            }


                            const fechaVenta =
                                venta.fecha.toDate();


                            if (
                                fechaVenta < inicio ||
                                fechaVenta >= fin
                            ) {
                                return;
                            }


                            if (
                                !Array.isArray(
                                    venta.productos
                                )
                            ) {
                                return;
                            }


                            venta.productos.forEach(
                                producto => {

                                    if (
                                        !producto.productoId
                                    ) {
                                        return;
                                    }


                                    if (
                                        !productosVendidos[
                                            producto.productoId
                                        ]
                                    ) {

                                        productosVendidos[
                                            producto.productoId
                                        ] = {

                                            id:
                                                producto.productoId,

                                            cantidad:
                                                0

                                        };

                                    }


                                    productosVendidos[
                                        producto.productoId
                                    ].cantidad +=
                                        Number(
                                            producto.cantidad
                                        ) || 0;

                                }
                            );

                        }
                    );


                    const listaProductos =
                        Object.values(
                            productosVendidos
                        );


                    // =========================================
                    // CALCULAR CONSUMO DE INGREDIENTES
                    // =========================================

                    const consumoIngredientes = {};


                    for (
                        const producto
                        of listaProductos
                    ) {

                        const referenciaReceta =
                            doc(
                                db,
                                "recetas",
                                producto.id
                            );


                        const recetaSnapshot =
                            await getDoc(
                                referenciaReceta
                            );


                        if (
                            !recetaSnapshot.exists()
                        ) {
                            continue;
                        }


                        const ingredientesReceta =
                            recetaSnapshot
                                .data()
                                .ingredientes || [];


                        ingredientesReceta.forEach(
                            ingrediente => {

                                if (
                                    !ingrediente.ingredienteId
                                ) {
                                    return;
                                }


                                if (
                                    !consumoIngredientes[
                                        ingrediente.ingredienteId
                                    ]
                                ) {

                                    consumoIngredientes[
                                        ingrediente.ingredienteId
                                    ] = 0;

                                }


                                consumoIngredientes[
                                    ingrediente.ingredienteId
                                ] +=
                                    (
                                        Number(
                                            producto.cantidad
                                        ) || 0
                                    ) *
                                    (
                                        Number(
                                            ingrediente.cantidad
                                        ) || 0
                                    );

                            }
                        );

                    }


                    // =========================================
                    // MOSTRAR STOCK ESTIMADO
                    // =========================================

                    let filas = "";


                    Object.values(
                        ingredientesStock
                    )
                    .sort(
                        (a, b) =>
                            a.nombre.localeCompare(
                                b.nombre
                            )
                    )
                    .forEach(
                        ingrediente => {

                            const consumo =
                                consumoIngredientes[
                                    ingrediente.id
                                ] || 0;


                            const stockEstimado =
                                ingrediente.cantidad -
                                consumo;


                            filas += `

                                <tr>

                                    <td>
                                        ${ingrediente.nombre}
                                    </td>

                                    <td>
                                        ${ingrediente.cantidad}
                                        ${ingrediente.unidad}
                                    </td>

                                    <td>
                                        ${consumo}
                                        ${ingrediente.unidad}
                                    </td>

                                    <td>
                                        <strong>
                                            ${stockEstimado}
                                            ${ingrediente.unidad}
                                        </strong>
                                    </td>

                                </tr>

                            `;

                        }
                    );


                    resultado.innerHTML = `

                        <h4>
                            Stock estimado
                        </h4>


                        <table class="tabla-receta">

                            <thead>

                                <tr>

                                    <th>
                                        Ingrediente
                                    </th>

                                    <th>
                                        Stock actual
                                    </th>

                                    <th>
                                        Consumo
                                    </th>

                                    <th>
                                        Stock estimado
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                ${
                                    filas ||
                                    `
                                        <tr>
                                            <td colspan="4">
                                                No hay ingredientes cargados.
                                            </td>
                                        </tr>
                                    `
                                }

                            </tbody>

                        </table>

                    `;

                } catch (error) {

                    console.error(
                        "Error calculando stock estimado:",
                        error
                    );


                    resultado.innerHTML = `

                        <p>
                            No se pudo calcular el stock estimado.
                        </p>

                    `;

                }

            }
        );

}
    await cargarIngredientes();

}