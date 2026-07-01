const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.crearUsuario = onCall(async (request) => {

    const datos = request.data;

    if (
        !datos.nombre ||
        !datos.apellido ||
        !datos.dni ||
        !datos.usuario ||
        !datos.email ||
        !datos.password ||
        !datos.perfil
    ) {
        throw new HttpsError(
            "invalid-argument",
            "Faltan datos obligatorios."
        );
    }

    const usuarioExistente = await db
        .collection("usuarios")
        .where("usuario", "==", datos.usuario)
        .get();

    if (!usuarioExistente.empty) {
        throw new HttpsError(
            "already-exists",
            "El nombre de usuario ya existe."
        );
    }

    const nuevoUsuario = await admin.auth().createUser({

        email: datos.email,

        password: datos.password,

        displayName: datos.nombre + " " + datos.apellido

    });

    await db.collection("usuarios").doc(nuevoUsuario.uid).set({

        nombre: datos.nombre,

        apellido: datos.apellido,

        dni: datos.dni,

        usuario: datos.usuario,

        email: datos.email,

        perfil: datos.perfil,

        activo: true,

        fechaCreacion: admin.firestore.FieldValue.serverTimestamp()

    });

    return {

        ok: true

    };

});