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
    cargarStock();
    return;
}

if (seccion === "recetas") {

    mostrarRecetas();

    return;
}

        if (seccion === "consumo") {
            alert("Consumo: próximamente");
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
            Seleccioná un producto para editar su receta
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
            .filter(producto => producto.disponible !== false)
            .sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
            );

        tablaStock.innerHTML = "";

        productos.forEach(producto => {

            const fila =
                document.createElement("tr");

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
                    -
                </td>

                <td>

                    <button
                        class="btn-editar-receta"
                        data-id="${producto.id}"
                    >
                        Editar receta
                    </button>

                </td>

            `;

            tablaStock.appendChild(fila);

        });

        document
            .querySelectorAll(".btn-editar-receta")
            .forEach(boton => {

                boton.addEventListener("click", () => {

                    const producto =
                        productos.find(
                            item =>
                                item.id ===
                                boton.dataset.id
                        );

if (!producto) return;

abrirEditorReceta(producto);

                });

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

    await cargarIngredientes();

}