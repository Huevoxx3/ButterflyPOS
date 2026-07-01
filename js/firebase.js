// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Configuración del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyD0cEQYnYn6b8CB02NV-_fhfrY8v60Hrvo",
  authDomain: "butterfly-pos.firebaseapp.com",
  projectId: "butterfly-pos",
  storageBucket: "butterfly-pos.firebasestorage.app",
  messagingSenderId: "18862251488",
  appId: "1:18862251488:web:42f59e7d2fde517c209f85"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

