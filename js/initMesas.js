import { db } from "./firebase.js";

import {
    collection,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const TOTAL_MESAS = 20;

async function crearMesas() {

    let creadas = 0;

    for (let i = 1; i <= TOTAL_MESAS; i++) {

        const referencia = doc(db, "mesas", String(i));

        const existe = await getDoc(referencia);

        if (existe.exists()) {
            continue;
        }

        await setDoc(referencia, {

            numero: i,

            estado: "Libre",

            personas: 0,

            mozo: "",

            total: 0

        });

        creadas++;

    }

    alert(`${creadas} mesas creadas correctamente.`);

}

crearMesas();