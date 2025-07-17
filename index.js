// index.js
const root = document.getElementById("root");

export function mostrarSelector() {
  root.innerHTML = "";

  const contenedor = document.createElement("section");
  contenedor.className = "formulario";

  const h2 = document.createElement("h2");
  h2.textContent = "¿Quién eres?";

  const btnAdmin = document.createElement("button");
  btnAdmin.textContent = "Administrador";
  btnAdmin.onclick = () =>
    import('./login/admin.js').then(m => m.mostrarAdminLogin());

  const btnProfesor = document.createElement("button");
  btnProfesor.textContent = "Profesor";
  btnProfesor.onclick = () =>
    import('./login/profesor.js').then(m => m.mostrarLoginProfesor());

  contenedor.append(h2, btnAdmin, btnProfesor);
  root.append(contenedor);
}

function verificarSesionProfesor() {
  const sesion = JSON.parse(localStorage.getItem("profesorSesion"));
  if (!sesion) return;

  fetch(`https://app-backend-07.onrender.com/alumno?correo=${encodeURIComponent(sesion.correo)}`)
    .then(res => res.json())
    .then(alumnos => {
      sesion.alumnos = alumnos;
      import("./login/profesor.js").then(m => m.mostrarPanelProfesor(sesion));
    })
    .catch(() => {
      localStorage.removeItem("profesorSesion");
      mostrarSelector();
    });
}


verificarSesionProfesor() || mostrarSelector();
