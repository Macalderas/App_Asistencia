import { mostrarSelector } from "../index.js";

const root = document.getElementById("root");

export function mostrarAdminLogin() {
  root.innerHTML = "";

  const contenedor = document.createElement("section");
  contenedor.className = "formulario";

  const titulo = document.createElement("h2");
  titulo.textContent = "Administrador";

  const btnIrALogin = crearBoton("Iniciar sesión", mostrarFormularioLogin);
  const btnIrARegistro = crearBoton("Registrarme", mostrarFormularioRegistro);
  const volver = crearBoton("Volver", mostrarSelector);

  contenedor.append(titulo, btnIrALogin, btnIrARegistro, volver);
  root.appendChild(contenedor);
}

function mostrarFormularioLogin() {
  root.innerHTML = "";
  const contenedor = document.createElement("section");
  contenedor.className = "formulario";

  const titulo = document.createElement("h2");
  titulo.textContent = "Login Administrador";

  const correo = crearInput("email", "adminCorreo", "Correo administrador");
  const password = crearInput("password", "adminPassword", "Contraseña");
  const btnLogin = crearBoton("Entrar", loginAdmin);
  const volver = crearBoton("Volver", mostrarAdminLogin);

  contenedor.append(titulo, correo, password, btnLogin, volver);
  root.appendChild(contenedor);
}

function mostrarFormularioRegistro() {
  root.innerHTML = "";
  const contenedor = document.createElement("section");
  contenedor.className = "formulario";

  const titulo = document.createElement("h2");
  titulo.textContent = "Registrar Administrador";

  const correo = crearInput("email", "nuevoAdminCorreo", "Nuevo correo administrador");
  const password = crearInput("password", "nuevoAdminPassword", "Nueva contraseña");
  const btnRegistrar = crearBoton("Registrar", registrarAdmin);
  const volver = crearBoton("Volver", mostrarAdminLogin);

  contenedor.append(titulo, correo, password, btnRegistrar, volver);
  root.appendChild(contenedor);
}

function registrarAdmin() {
  const correo = document.getElementById("nuevoAdminCorreo").value;
  const password = document.getElementById("nuevoAdminPassword").value;

  if (!correo || !password) {
    alert("Completa los campos");
    return;
  }

  localStorage.setItem("admin", JSON.stringify({ correo, password }));
  alert("Administrador registrado correctamente");
  mostrarAdminLogin();
}

function loginAdmin() {
  const correo = document.getElementById("adminCorreo").value;
  const password = document.getElementById("adminPassword").value;

  const admin = JSON.parse(localStorage.getItem("admin")) || { correo: "admin@correo.com", password: "admin123" };

  if (correo === admin.correo && password === admin.password) {
    mostrarPanelAdmin();
  } else {
    alert("Credenciales incorrectas");
  }
}

function mostrarPanelAdmin() {
  root.innerHTML = "";

  const contenedor = document.createElement("section");
  contenedor.className = "formulario";

  const titulo = document.createElement("h2");
  titulo.textContent = "Panel del Administrador";

  const inputCorreo = crearInput("email", "correoProfesor", "Correo del profesor");
  const inputPassword = crearInput("password", "passwordProfesor", "Contraseña del profesor");

  const selectNivel = document.createElement("select");
  selectNivel.id = "nivelProfesor";
  ["preprimaria", "primaria", "secundaria", "diversificado"].forEach(n => {
  const opt = document.createElement("option");
  opt.value = n;
  opt.textContent = n.charAt(0).toUpperCase() + n.slice(1);
  selectNivel.appendChild(opt);
});


  const inputGrados = crearInput("text", "gradosProfesor", "Grados separados por coma (Ej: 1ro,2do)");

  const btnCrear = crearBoton("Crear profesor", registrarProfesor);
  const volver = crearBoton("Cerrar sesión", mostrarSelector);

  contenedor.append(
    titulo,
    inputCorreo,
    inputPassword,
    selectNivel,
    inputGrados,
    btnCrear,
    volver
  );

  root.appendChild(contenedor);
}

function registrarProfesor() {
  const correo = document.getElementById("correoProfesor").value;
  const password = document.getElementById("passwordProfesor").value;
  const nivel = document.getElementById("nivelProfesor").value;
  const gradosTexto = document.getElementById("gradosProfesor").value;
  const grados = gradosTexto.split(",").map(g => g.trim()).filter(g => g);

  if (!correo || !password || grados.length === 0) {
    alert("Completa todos los campos correctamente");
    return;
  }

  fetch("http://localhost:3000/profesores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password, nivel, grados })
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al registrar");
    return res.json();
  })
  .then(data => {
    alert(data.mensaje || "Profesor registrado correctamente");
    mostrarPanelAdmin();
  })
  .catch(err => {
    console.error(err);
    alert("Hubo un problema al registrar el profesor");
  });
}


function crearInput(type, id, placeholder) {
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.placeholder = placeholder;
  return input;
}

function crearBoton(texto, onClick) {
  const btn = document.createElement("button");
  btn.textContent = texto;
  btn.onclick = onClick;
  return btn;
}