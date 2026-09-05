import { db } from "../js/firebase.js";

import { obtenerJornadaActual } from "../js/services/cajaService.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export default async function cargarMensajeria() {

const idCSSMensajeria = "cssMensajeria";

if (!document.getElementById(idCSSMensajeria)) {

    const linkCSS =
        document.createElement("link");

    linkCSS.id = idCSSMensajeria;
    linkCSS.rel = "stylesheet";

    linkCSS.href =
        new URL(
            "../css/mensajeria.css",
            import.meta.url
        ).href;

    document.head.appendChild(linkCSS);
}

    const contenido =
        document.getElementById("contenido");
    
        const usuario =
    JSON.parse(
        sessionStorage.getItem("usuario")
    );

    const perfilUsuario = usuario?.perfil || "";

const jornada =
    await obtenerJornadaActual();

const snapshotMensajes = await getDocs(
    collection(db, "mensajes")
);

const mensajes = [];

snapshotMensajes.forEach(documento => {
    const mensaje = documento.data();

    if (mensaje.jornada !== jornada) return;
    if (mensaje.eliminado === true) return;

    mensajes.push({
        id: documento.id,
        ...mensaje
    });
});

mensajes.sort((a, b) => {
    const fechaA = a.fecha?.toDate ? a.fecha.toDate() : new Date(0);
    const fechaB = b.fecha?.toDate ? b.fecha.toDate() : new Date(0);

    return fechaB - fechaA;
});

    contenido.innerHTML = `

        <div class="contenedor-modulo">

            <div class="encabezado-modulo">

                <div>
                    <h1>Mensajería</h1>

                    <p>
                        Comunicación interna
                    </p>
                </div>

                <button
                    id="btnNuevoMensaje"
                    class="btn-principal"
                >
                    + Nuevo mensaje
                </button>

            </div>


            <div class="card">

                <div class="barra-stock">

                    <div>
                        <strong>
                            Mensajes
                        </strong>
                    </div>

                </div>


<div id="listaMensajes" class="lista-mensajes">
    ${
        mensajes.length === 0
        ? `<p>No hay mensajes.</p>`
        : mensajes.map(mensaje => {

            const fecha = mensaje.fecha?.toDate
                ? mensaje.fecha.toDate()
                : null;

return `
    <div class="mensaje-card ${
        mensaje.usuarioId === usuario?.uid ||
        mensaje.usuario === usuario?.nombre ||
        mensaje.usuario === usuario?.usuario
            ? "mensaje-propio"
            : ""
    }">

        <div class="mensaje-cabecera">

            <div class="mensaje-remitente">

                <div class="mensaje-avatar">
                    ${
                        (mensaje.usuario || "U")
                            .charAt(0)
                            .toUpperCase()
                    }
                </div>

                <div>

                    <div class="mensaje-usuario">
                        ${mensaje.usuario || "Usuario"}

                        ${
                            mensaje.editado
                                ? `<span class="mensaje-editado">(editado)</span>`
                                : ""
                        }
                    </div>

                    <div class="mensaje-destinatario">
                        Para: <strong>${mensaje.destinatario || "-"}</strong>
                    </div>

                </div>

            </div>

            <div class="mensaje-fecha">
                ${
                    fecha
                        ? fecha.toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                        : "Fecha pendiente"
                }
            </div>

        </div>


        <div class="mensaje-contenido">
            ${mensaje.mensaje || ""}
        </div>


        <div class="mensaje-pie">

            <div>

                ${
                    mensaje.leido
                        ? `
                            <span class="mensaje-estado leido">
                                ✓✓ Leído
                            </span>
                        `
                        : `
                            <span class="mensaje-estado no-leido">
                                ● No leído
                            </span>
                        `
                }

            </div>


            <div class="mensaje-acciones">

                ${
                    !mensaje.leido &&
                    mensaje.destinatario === perfilUsuario &&
                    mensaje.usuarioId !== usuario?.uid
                        ? `
                            <button
                                class="btnMarcarLeido"
                                data-id="${mensaje.id}"
                            >
                                ✓ Marcar como leído
                            </button>
                        `
                        : ""
                }


                ${
                    mensaje.usuarioId === usuario?.uid ||
                    mensaje.usuario === usuario?.nombre ||
                    mensaje.usuario === usuario?.usuario
                        ? `
                            <button
                                class="btnEditarMensaje"
                                data-id="${mensaje.id}"
                            >
                                ✏️ Editar
                            </button>

                            <button
                                class="btnEliminarMensaje"
                                data-id="${mensaje.id}"
                            >
                                🗑️ Eliminar
                            </button>
                        `
                        : ""
                }

            </div>

        </div>

    </div>
`;
        }).join("")
    }
</div>

            </div>

        </div>

    `;

document
    .querySelectorAll(".btnMarcarLeido")
    .forEach(boton => {

        boton.addEventListener(
            "click",
            async () => {

                const mensajeId =
                    boton.dataset.id;

                try {

                    const mensajeRef =
                        doc(
                            db,
                            "mensajes",
                            mensajeId
                        );

                    await updateDoc(
                        mensajeRef,
                        {
                            leido: true,
                            fechaLectura:
                                serverTimestamp(),
                            leidoPor:
                                usuario?.nombre ||
                                usuario?.usuario ||
                                "Usuario"
                        }
                    );

                    await addDoc(
                        collection(
                            db,
                            "actividad"
                        ),
                        {
                            usuario:
                                usuario?.nombre ||
                                usuario?.usuario ||
                                "Usuario",

                            modulo:
                                "Mensajería",

                            accion:
                                "Marcar mensaje como leído",

                            descripcion:
                                `Marcó como leído un mensaje de ${boton.closest(".mensaje")?.querySelector("strong")?.textContent || "Usuario"}`,

                            fecha:
                                serverTimestamp(),

                            jornada:
                                jornada
                        }
                    );

                    cargarMensajeria();

                } catch (error) {

                    console.error(
                        "Error marcando mensaje como leído:",
                        error
                    );

                    alert(
                        "No se pudo marcar el mensaje como leído."
                    );
                }
            }
        );
    });

// =========================================
// EDITAR MENSAJE
// =========================================

document
    .querySelectorAll(".btnEditarMensaje")
    .forEach(boton => {

        boton.addEventListener(
            "click",
            async () => {

                const mensajeId =
                    boton.dataset.id;

                const mensajeActual =
                    mensajes.find(
                        mensaje =>
                            mensaje.id === mensajeId
                    );

                if (!mensajeActual) {
                    return;
                }

                const nuevoTexto =
                    prompt(
                        "Editar mensaje:",
                        mensajeActual.mensaje
                    );

                if (
                    nuevoTexto === null
                ) {
                    return;
                }

                const textoEditado =
                    nuevoTexto.trim();

                if (!textoEditado) {

                    alert(
                        "El mensaje no puede quedar vacío."
                    );

                    return;
                }

                if (
                    textoEditado ===
                    mensajeActual.mensaje
                ) {
                    return;
                }

                try {

                    await updateDoc(
                        doc(
                            db,
                            "mensajes",
                            mensajeId
                        ),
                        {
                            mensaje:
                                textoEditado,

                            editado:
                                true,

                            fechaEdicion:
                                serverTimestamp()
                        }
                    );

                    await addDoc(
                        collection(
                            db,
                            "actividad"
                        ),
                        {
                            usuario:
                                usuario?.nombre ||
                                usuario?.usuario ||
                                "Usuario",

                            modulo:
                                "Mensajería",

                            accion:
                                "Editar mensaje",

                            descripcion:
                                `Editó un mensaje: "${mensajeActual.mensaje}" → "${textoEditado}"`,

                            mensajeId:
                                mensajeId,

                            fecha:
                                serverTimestamp(),

                            jornada:
                                jornada
                        }
                    );

                    cargarMensajeria();

                } catch (error) {

                    console.error(
                        "Error editando mensaje:",
                        error
                    );

                    alert(
                        "No se pudo editar el mensaje."
                    );
                }
            }
        );
    });

// =========================================
// ELIMINAR MENSAJE
// =========================================

document
    .querySelectorAll(".btnEliminarMensaje")
    .forEach(boton => {

        boton.addEventListener(
            "click",
            async () => {

                const mensajeId =
                    boton.dataset.id;

                const mensajeActual =
                    mensajes.find(
                        mensaje =>
                            mensaje.id === mensajeId
                    );

                if (!mensajeActual) {
                    return;
                }

                const confirmar =
                    confirm(
                        "¿Seguro que querés eliminar este mensaje?"
                    );

                if (!confirmar) {
                    return;
                }

                try {

                    await updateDoc(
                        doc(
                            db,
                            "mensajes",
                            mensajeId
                        ),
                        {
                            eliminado: true,
                            fechaEliminacion:
                                serverTimestamp()
                        }
                    );

                    await addDoc(
                        collection(
                            db,
                            "actividad"
                        ),
                        {
                            usuario:
                                usuario?.nombre ||
                                usuario?.usuario ||
                                "Usuario",

                            modulo:
                                "Mensajería",

                            accion:
                                "Eliminar mensaje",

                            descripcion:
                                `Eliminó un mensaje: "${mensajeActual.mensaje}"`,

                            mensajeId:
                                mensajeId,

                            fecha:
                                serverTimestamp(),

                            jornada:
                                jornada
                        }
                    );

                    cargarMensajeria();

                } catch (error) {

                    console.error(
                        "Error eliminando mensaje:",
                        error
                    );

                    alert(
                        "No se pudo eliminar el mensaje."
                    );
                }
            }
        );
    });

    // =========================================
    // NUEVO MENSAJE
    // =========================================

    document
        .getElementById("btnNuevoMensaje")
        .addEventListener(
            "click",
            () => {

                const lista =
                    document.getElementById(
                        "listaMensajes"
                    );


                if (
                    document.getElementById(
                        "formularioNuevoMensaje"
                    )
                ) {
                    return;
                }


                const formulario =
                    document.createElement("div");


                formulario.id =
                    "formularioNuevoMensaje";


                formulario.className =
                    "formulario-mensaje";


                formulario.innerHTML = `

<h3>
    Nuevo mensaje
</h3>


<label>
    Dirigido a
</label>

<select id="destinatarioMensaje">

    <option value="">
        Seleccionar destinatario
    </option>

    <option value="admin">
        Admin
    </option>

    <option value="cocina">
        Cocina
    </option>

    <option value="salon">
        Salón
    </option>

</select>


<label>
    Mensaje
</label>

<textarea
    id="textoNuevoMensaje"
    placeholder="Escribí tu mensaje..."
    rows="4"
></textarea>


                    <div class="acciones-mensaje">

                        <button
                            id="cancelarNuevoMensaje"
                            class="btn-secundario"
                        >
                            Cancelar
                        </button>


                        <button
                            id="enviarNuevoMensaje"
                            class="btn-principal"
                        >
                            Enviar
                        </button>

                    </div>

                `;


                lista.prepend(formulario);

                const perfilUsuario = usuario?.perfil || "";

const selectDestinatario =
    document.getElementById("destinatarioMensaje");

if (perfilUsuario === "salon") {
    selectDestinatario
        .querySelector('option[value="salon"]')
        ?.remove();
}

if (perfilUsuario === "cocina") {
    selectDestinatario
        .querySelector('option[value="cocina"]')
        ?.remove();
}

if (perfilUsuario === "admin") {
    selectDestinatario
        .querySelector('option[value="admin"]')
        ?.remove();
}


                document
                    .getElementById(
                        "textoNuevoMensaje"
                    )
                    .focus();


                // CANCELAR

                document
                    .getElementById(
                        "cancelarNuevoMensaje"
                    )
                    .addEventListener(
                        "click",
                        () => {

                            formulario.remove();

                        }
                    );


// ENVIAR

document
    .getElementById(
        "enviarNuevoMensaje"
    )
    .addEventListener(
        "click",
        async () => {

const destinatario =
    document
        .getElementById(
            "destinatarioMensaje"
        )
        .value;


const texto =
    document
        .getElementById(
            "textoNuevoMensaje"
        )
        .value
        .trim();


if (!destinatario) {

    alert(
        "Seleccioná a quién va dirigido el mensaje."
    );

    return;
}


if (!texto) {

    alert(
        "Escribí un mensaje."
    );

    return;
}


            try {

                await addDoc(
                    collection(
                        db,
                        "mensajes"
                    ),
                    {

                        usuarioId:
                            usuario?.uid ||
                            "",

                        usuario:
                            usuario?.nombre ||
                            usuario?.usuario ||
                            "Usuario",

                        perfil:
                            usuario?.perfil ||
                            "",

mensaje:
    texto,

destinatario:
    destinatario,

leido:
    false,

fechaLectura:
    null,

leidoPor:
    null,

fecha:
    serverTimestamp(),

                        jornada:
                            jornada,

                        editado:
                            false,

                        eliminado:
                            false

                    }
                );

                await addDoc(
    collection(
        db,
        "actividad"
    ),
    {
        usuario:
            usuario?.nombre ||
            usuario?.usuario ||
            "Usuario",

        modulo:
            "Mensajería",

        accion:
            "Crear mensaje",

descripcion:
    `Envió un mensaje a ${destinatario}: "${texto}"`,

        fecha:
            serverTimestamp(),

        jornada:
            jornada
    }
);


                alert(
                    "Mensaje enviado correctamente."
                );


                formulario.remove();


                // Recargar la mensajería
                cargarMensajeria();

            } catch (error) {

                console.error(
                    "Error guardando mensaje:",
                    error
                );


                alert(
                    "No se pudo enviar el mensaje."
                );

            }

        }
    );

            }
        );

}