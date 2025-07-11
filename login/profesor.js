import { mostrarSelector } from "../index.js";

const root = document.getElementById("root");

export function mostrarLoginProfesor() {
  root.innerHTML = "";
  const contenedor = document.createElement("section");
  contenedor.className = "formulario";

  const titulo = document.createElement("h2");
  titulo.textContent = "Login Profesor";

  const correo = crearInput("email", "correoProfesorLogin", "Correo del profesor");
  const password = crearInput("password", "passwordProfesorLogin", "Contraseña");
  const btnEntrar = crearBoton("Entrar", loginProfesor);
  const btnRecuperar = crearBoton("¿Olvidaste tu contraseña?", mostrarRecuperar);
  const volver = crearBoton("Volver", mostrarSelector);

  contenedor.append(titulo, correo, password, btnEntrar, btnRecuperar, volver);
  root.appendChild(contenedor);
}

function loginProfesor() {
  const correo = document.getElementById("correoProfesorLogin").value;
  const password = document.getElementById("passwordProfesorLogin").value;

  const profesores = JSON.parse(localStorage.getItem("profesores")) || [];
  const profesorIndex = profesores.findIndex(p => p.correo === correo && p.password === password);

  if (profesorIndex >= 0) {
    if (!profesores[profesorIndex].alumnos) {
      profesores[profesorIndex].alumnos = [];
      localStorage.setItem("profesores", JSON.stringify(profesores));
    }
    mostrarPanelProfesor(profesores[profesorIndex]);
  } else {
    alert("Credenciales incorrectas");
  }
}

function mostrarRecuperar() {
  root.innerHTML = "";
  const contenedor = document.createElement("section");
  contenedor.className = "formulario";

  const titulo = document.createElement("h2");
  titulo.textContent = "Recuperar contraseña";

  const correo = crearInput("email", "correoRecuperar", "Correo del profesor");
  const btnBuscar = crearBoton("Recuperar", () => {
    const email = document.getElementById("correoRecuperar").value;
    const profesores = JSON.parse(localStorage.getItem("profesores")) || [];
    const profesor = profesores.find(p => p.correo === email);
    if (profesor) {
      alert(`Tu contraseña es: ${profesor.password}`);
      mostrarLoginProfesor();
    } else {
      alert("Correo no encontrado");
    }
  });

  const volver = crearBoton("Volver", mostrarLoginProfesor);
  contenedor.append(titulo, correo, btnBuscar, volver);
  root.appendChild(contenedor);
}

function mostrarPanelProfesor(profesor) {
  root.innerHTML = "";

  const contenedor = document.createElement("section");
  contenedor.className = "formulario";

  const titulo = document.createElement("h2");
  titulo.textContent = `Bienvenido, ${profesor.correo}`;

  const nivel = document.createElement("p");
  nivel.textContent = `Nivel: ${profesor.nivel}`;

  const gradosTitulo = document.createElement("p");
  gradosTitulo.textContent = "Grados asignados:";

  const listaGrados = document.createElement("ul");
  profesor.grados.forEach(g => {
    const li = document.createElement("li");
    li.textContent = g;
    listaGrados.appendChild(li);
  });

  const resumenTitulo = document.createElement("h3");
  resumenTitulo.textContent = "Proyección de asistencia por grado";

  const resumen = obtenerResumenAsistenciaPorGrado(profesor);
  const listaResumen = document.createElement("ul");

  Object.entries(resumen).forEach(([grado, datos]) => {
    const li = document.createElement("li");
    li.textContent = `Grado ${grado}: Presentes ${datos.presentes}, Ausentes ${datos.ausentes}`;
    listaResumen.appendChild(li);
  });

  const contenedorGrafica = document.createElement("div");
  contenedorGrafica.className = "proyeccion-asistencia";
  const canvas = document.createElement("canvas");
  canvas.id = "graficaAsistencia";
  contenedorGrafica.appendChild(canvas);

  const btnGuardarAsistencia = crearBoton("Guardar asistencia", () => {
    alert("Asistencia guardada correctamente.");
  });
  btnGuardarAsistencia.style.marginTop = "10px";
  contenedorGrafica.appendChild(btnGuardarAsistencia);

  const formAgregar = document.createElement("section");
  formAgregar.className = "formulario";
  formAgregar.style.marginTop = "20px";

  const tituloAgregar = document.createElement("h3");
  tituloAgregar.textContent = "Agregar alumno";

  const inputNombreAlumno = crearInput("text", "nombreAlumno", "Nombre del alumno");
  const selectGradoAlumno = document.createElement("select");
  selectGradoAlumno.id = "gradoAlumno";
  profesor.grados.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    selectGradoAlumno.appendChild(opt);
  });

  const btnAgregarAlumno = crearBoton("Agregar alumno", () => {
    agregarAlumno(profesor);
  });

  formAgregar.append(tituloAgregar, inputNombreAlumno, selectGradoAlumno, btnAgregarAlumno);

  const alumnosTitulo = document.createElement("h3");
  alumnosTitulo.textContent = "Lista de alumnos";

  const contenedorBotonesAsistencia = document.createElement("div");
  contenedorBotonesAsistencia.className = "grupo-botones-asistencia";

  const btnTodosPresentes = crearBoton("Marcar todos como PRESENTES", () => {
    marcarAsistenciaTodos(profesor, true);
  });

  const btnTodosAusentes = crearBoton("Marcar todos como AUSENTES", () => {
    marcarAsistenciaTodos(profesor, false);
  });

  const btnEnviarReporteTodos = crearBoton("Enviar reporte para todos", () => {
    enviarReporteUniformeTodos(profesor);
  });

  const btnEnviarAvisoTodos = crearBoton("Enviar aviso a todos", () => {
    enviarAvisoATodos(profesor);
  });

  contenedorBotonesAsistencia.append(
    btnTodosPresentes,
    btnTodosAusentes,
    btnEnviarReporteTodos,
    btnEnviarAvisoTodos
  );

  const listaAlumnos = document.createElement("ul");
  listaAlumnos.id = "listaAlumnos";

  profesor.alumnos.forEach((alumno, index) => {
    const li = document.createElement("li");

    const nombreAlumno = document.createElement("span");
    nombreAlumno.textContent = `${alumno.nombre} (Grado: ${alumno.grado})`;
    nombreAlumno.className = "nombreAlumno";

    const botones = document.createElement("div");
    botones.className = "accionesAlumno";

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = () => eliminarAlumno(profesor, index);

    const btnAsistencia = document.createElement("button");

    // Estado asistencia usando tu lógica mejorada
    const asistencias = alumno.asistencias || [];
    const ultimaAsistencia = asistencias.length > 0 ? asistencias[asistencias.length - 1] : null;

    if (ultimaAsistencia === true) {
      btnAsistencia.textContent = "Presente";
      btnAsistencia.classList.add("presente");
    } else if (ultimaAsistencia === false) {
      btnAsistencia.textContent = "Ausente";
      btnAsistencia.classList.add("ausente");
    } else {
      btnAsistencia.textContent = "Sin marcar";
      btnAsistencia.classList.add("sin-marcar");
    }

    btnAsistencia.onclick = () => toggleAsistencia(profesor, index, btnAsistencia);

    const btnUniforme = document.createElement("button");
    btnUniforme.textContent = "Uniforme";
    btnUniforme.onclick = () => marcarUniforme(profesor, index);

    const btnEnviarReporte = document.createElement("button");
    btnEnviarReporte.textContent = "Enviar reporte";
    btnEnviarReporte.onclick = () => enviarReporteUniforme(profesor, index);

    const btnEnviarCorreo = document.createElement("button");
    btnEnviarCorreo.textContent = "Enviar correo";
    btnEnviarCorreo.onclick = () => enviarCorreoIndividual(profesor, alumno);

    const btnProyeccionIndividual = crearBoton("Ver proyección individual", () => {
      mostrarProyeccionIndividual(profesor, index);
    });

    botones.append(
      btnEliminar,
      btnAsistencia,
      btnUniforme,
      btnEnviarReporte,
      btnEnviarCorreo,
      btnProyeccionIndividual
    );

    li.appendChild(nombreAlumno);
    li.appendChild(botones);

    if (alumno.uniforme && alumno.uniforme.length > 0) {
      const aviso = document.createElement("span");
      aviso.textContent = "🚫 Falta uniforme";
      aviso.className = "aviso-uniforme";
      li.appendChild(aviso);
    }

    listaAlumnos.appendChild(li);
  });

  const cerrar = crearBoton("Cerrar sesión", mostrarSelector);

  contenedor.append(
    titulo,
    nivel,
    gradosTitulo,
    listaGrados,
    resumenTitulo,
    listaResumen,
    contenedorGrafica,
    formAgregar,
    alumnosTitulo,
    contenedorBotonesAsistencia,
    listaAlumnos,
    cerrar
  );

  root.appendChild(contenedor);

  // Gráfica general con Chart.js
  const labels = Object.keys(resumen);
  const dataPresentes = labels.map(l => resumen[l].presentes);
  const dataAusentes = labels.map(l => resumen[l].ausentes);

  const ctx = canvas.getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Presentes",
          data: dataPresentes,
          backgroundColor: "rgba(40, 167, 69, 0.7)"
        },
        {
          label: "Ausentes",
          data: dataAusentes,
          backgroundColor: "rgba(220, 53, 69, 0.7)"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          precision: 0,
          stepSize: 1
        }
      }
    }
  });
}

function toggleAsistencia(profesor, alumnoIndex, btn) {
  const alumno = profesor.alumnos[alumnoIndex];
  if (!alumno.asistencias) {
    alumno.asistencias = [];
  }

  const ultima = alumno.asistencias.length ? alumno.asistencias[alumno.asistencias.length - 1] : null;

  // Ciclo entre 3 estados: null/undefined -> true -> false -> null/undefined
  let nuevoEstado;
  if (ultima === null || ultima === undefined) {
    nuevoEstado = true;
  } else if (ultima === true) {
    nuevoEstado = false;
  } else {
    nuevoEstado = null;
  }

  alumno.asistencias.push(nuevoEstado);

  btn.textContent = nuevoEstado === true ? "Presente" : nuevoEstado === false ? "Ausente" : "Sin marcar";
  btn.classList.toggle("presente", nuevoEstado === true);
  btn.classList.toggle("ausente", nuevoEstado === false);
  btn.classList.toggle("sin-marcar", nuevoEstado === null);

  const profesores = JSON.parse(localStorage.getItem("profesores")) || [];
  const profIndex = profesores.findIndex(p => p.correo === profesor.correo);
  if (profIndex < 0) return;

  profesores[profIndex] = profesor;
  localStorage.setItem("profesores", JSON.stringify(profesores));
}

function marcarAsistenciaTodos(profesor, estado) {
  profesor.alumnos.forEach(alumno => {
    if (!alumno.asistencias) {
      alumno.asistencias = [];
    }
    alumno.asistencias.push(estado);
  });

  const profesores = JSON.parse(localStorage.getItem("profesores")) || [];
  const profIndex = profesores.findIndex(p => p.correo === profesor.correo);
  if (profIndex < 0) return;

  profesores[profIndex] = profesor;
  localStorage.setItem("profesores", JSON.stringify(profesores));

  mostrarPanelProfesor(profesor);
}

function marcarUniforme(profesor, alumnoIndex) {
  const alumno = profesor.alumnos[alumnoIndex];
  const faltas = alumno.uniforme || [];

  const partes = ["Zapatos", "Playera", "Pantalón", "Suéter", "Corte de pelo", "Otro"];

  const modal = document.createElement("div");
  modal.style = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; justify-content: center;
    align-items: center; z-index: 1000;
  `;

  const contenido = document.createElement("div");
  contenido.style = `
    background: white; padding: 20px; border-radius: 8px; min-width: 300px;
  `;

  const titulo = document.createElement("h3");
  titulo.textContent = "Faltas de uniforme";
  contenido.appendChild(titulo);

  partes.forEach(parte => {
    const label = document.createElement("label");
    label.style.display = "block";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = parte;
    if (faltas.includes(parte)) checkbox.checked = true;
    label.appendChild(checkbox);
    label.append(" " + parte);
    contenido.appendChild(label);
  });

  const btnConfirmar = crearBoton("Confirmar", () => {
    actualizarUniforme(profesor, alumnoIndex, contenido.querySelectorAll("input[type='checkbox']"));
    document.body.removeChild(modal);
  });

  const btnCancelar = crearBoton("Cancelar", () => {
    document.body.removeChild(modal);
  });

  contenido.appendChild(document.createElement("hr"));
  contenido.appendChild(btnConfirmar);
  contenido.appendChild(btnCancelar);

  modal.appendChild(contenido);
  document.body.appendChild(modal);
}

function actualizarUniforme(profesor, alumnoIndex, checkboxes) {
  const nuevasFaltas = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const profesores = JSON.parse(localStorage.getItem("profesores")) || [];
  const profIndex = profesores.findIndex(p => p.correo === profesor.correo);
  if (profIndex < 0) return;

  profesor.alumnos[alumnoIndex].uniforme = nuevasFaltas;
  profesores[profIndex] = profesor;

  localStorage.setItem("profesores", JSON.stringify(profesores));
  mostrarPanelProfesor(profesor);
}

function enviarReporteUniforme(profesor, alumnoIndex) {
  const alumno = profesor.alumnos[alumnoIndex];
  const faltas = alumno.uniforme || [];

  if (faltas.length === 0) {
    alert("El alumno no tiene faltas de uniforme para reportar.");
    return;
  }

  const asunto = encodeURIComponent(`Reporte de faltas de uniforme de ${alumno.nombre}`);
  const cuerpo = encodeURIComponent(
    `Hola,\n\nSe informa que el alumno ${alumno.nombre} del grado ${alumno.grado} presenta las siguientes faltas en su uniforme:\n- ${faltas.join("\n- ")}\n\nSaludos,\nProfesor ${profesor.correo}`
  );

  window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
}

function enviarReporteUniformeTodos(profesor) {
  const alumnosConFaltas = profesor.alumnos.filter(alumno => alumno.uniforme?.length);

  if (alumnosConFaltas.length === 0) {
    alert("Ningún alumno tiene faltas de uniforme para reportar.");
    return;
  }

  let cuerpoTexto = `Hola,\n\nReporte de faltas de uniforme:\n\n`;

  alumnosConFaltas.forEach(alumno => {
    cuerpoTexto += `Alumno: ${alumno.nombre} (Grado: ${alumno.grado})\nFaltas:\n- ${alumno.uniforme.join("\n- ")}\n\n`;
  });

  cuerpoTexto += `Saludos,\nProfesor ${profesor.correo}`;

  const asunto = encodeURIComponent("Reporte de faltas de uniforme - Todos");
  const cuerpo = encodeURIComponent(cuerpoTexto);

  window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
}

function enviarAvisoATodos(profesor) {
  const mensaje = prompt("Escribe el mensaje o aviso para enviar a todos:");

  if (!mensaje?.trim()) {
    alert("El mensaje no puede estar vacío.");
    return;
  }

  const asunto = encodeURIComponent("Aviso importante del profesor");
  const cuerpo = encodeURIComponent(
    `Estimados alumnos y padres de familia,\n\n${mensaje.trim()}\n\nSaludos,\nProfesor ${profesor.correo}`
  );

  window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
}

function enviarCorreoIndividual(profesor, alumno) {
  const mensaje = prompt(`Mensaje para ${alumno.nombre}:`);
  if (!mensaje?.trim()) {
    alert("El mensaje no puede estar vacío.");
    return;
  }

  const asunto = encodeURIComponent(`Mensaje para ${alumno.nombre}`);
  const cuerpo = encodeURIComponent(
    `Estimado alumno ${alumno.nombre} (Grado: ${alumno.grado}),\n\n${mensaje.trim()}\n\nSaludos,\nProfesor ${profesor.correo}`
  );

  window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
}

function agregarAlumno(profesor) {
  const nombre = document.getElementById("nombreAlumno").value.trim();
  const grado = document.getElementById("gradoAlumno").value;

  if (!nombre) {
    alert("Escribe el nombre del alumno");
    return;
  }

  const profesores = JSON.parse(localStorage.getItem("profesores")) || [];
  const profIndex = profesores.findIndex(p => p.correo === profesor.correo);
  if (profIndex < 0) return;

  profesor.alumnos.push({
    nombre,
    grado,
    asistencias: [],
    uniforme: []
  });

  profesores[profIndex] = profesor;
  localStorage.setItem("profesores", JSON.stringify(profesores));

  mostrarPanelProfesor(profesor);
}

function eliminarAlumno(profesor, alumnoIndex) {
  const modal = document.createElement("div");
  modal.style = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; justify-content: center;
    align-items: center; z-index: 9999;
  `;

  const contenido = document.createElement("div");
  contenido.style = `
    background: white; padding: 20px; border-radius: 8px;
    min-width: 300px; text-align: center;
  `;

  const titulo = document.createElement("h3");
  titulo.textContent = "Eliminar alumno";

  const mensaje = document.createElement("p");
  mensaje.textContent = "Ingresa tu contraseña para confirmar:";

  const input = document.createElement("input");
  input.type = "password";
  input.placeholder = "Contraseña";
  input.style = "width: 100%; padding: 8px; margin: 10px 0;";

  const error = document.createElement("p");
  error.style = "color: red; font-size: 14px; display: none; margin-top: 5px;";
  error.textContent = "Contraseña incorrecta";

  const btnConfirmar = crearBoton("Confirmar", () => {
    if (input.value === profesor.password) {
      if (!confirm("¿Estás seguro de eliminar al alumno?")) return;

      profesor.alumnos.splice(alumnoIndex, 1);
      const profesores = JSON.parse(localStorage.getItem("profesores")) || [];
      const profIndex = profesores.findIndex(p => p.correo === profesor.correo);
      if (profIndex >= 0) {
        profesores[profIndex] = profesor;
        localStorage.setItem("profesores", JSON.stringify(profesores));
      }
      mostrarPanelProfesor(profesor);
      modal.remove();
    } else {
      error.style.display = "block";
      input.value = "";
      btnConfirmar.disabled = true;
    }
  });

  btnConfirmar.disabled = true;

  input.addEventListener("input", () => {
    btnConfirmar.disabled = input.value.trim() === "";
    error.style.display = "none";
  });

  const btnCancelar = crearBoton("Cancelar", () => modal.remove());

  contenido.append(titulo, mensaje, input, error, btnConfirmar, btnCancelar);
  modal.appendChild(contenido);
  document.body.appendChild(modal);
  input.focus();
}



function obtenerResumenAsistenciaPorGrado(profesor) {
  const resumen = {};
  profesor.grados.forEach(grado => {
    resumen[grado] = { presentes: 0, ausentes: 0 };
  });

  profesor.alumnos.forEach(alumno => {
    const asistencias = alumno.asistencias || [];
    const ultima = asistencias.length > 0 ? asistencias[asistencias.length - 1] : null;
    if (ultima === true) {
      resumen[alumno.grado].presentes++;
    } else if (ultima === false) {
      resumen[alumno.grado].ausentes++;
    }
  });

  return resumen;
}

// FUNCION NUEVA: Proyección individual en gráfica de barras con modal

function mostrarProyeccionIndividual(profesor, alumnoIndex) {
  const alumno = profesor.alumnos[alumnoIndex];
  const asistencias = alumno.asistencias || [];

  // Contar estados
  const presentes = asistencias.filter(a => a === true).length;
  const ausentes = asistencias.filter(a => a === false).length;
  const sinMarcar = asistencias.filter(a => a === null || a === undefined).length;

  // Crear modal
  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContenido = document.createElement("div");
  modalContenido.className = "modal-contenido";

  const titulo = document.createElement("h3");
  titulo.textContent = `Proyección de asistencia - ${alumno.nombre}`;

  // Canvas para gráfica
  const canvas = document.createElement("canvas");
  canvas.id = "graficaProyeccionIndividual";

  // Botón cerrar
  const btnCerrar = document.createElement("button");
  btnCerrar.textContent = "Cerrar";
  btnCerrar.onclick = () => {
    modal.remove();
  };

  modalContenido.append(titulo, canvas, btnCerrar);
  modal.appendChild(modalContenido);
  document.body.appendChild(modal);

  // Crear gráfica con Chart.js
  const ctx = canvas.getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Presente", "Ausente", "Sin marcar"],
      datasets: [{
        label: "Asistencias",
        data: [presentes, ausentes, sinMarcar],
        backgroundColor: [
          "rgba(40, 167, 69, 0.7)",   // verde
          "rgba(220, 53, 69, 0.7)",   // rojo
          "rgba(255, 193, 7, 0.7)"    // amarillo
        ],
        borderColor: [
          "rgba(40, 167, 69, 1)",
          "rgba(220, 53, 69, 1)",
          "rgba(255, 193, 7, 1)"
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          stepSize: 1,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// FUNCIONES UTILES PARA CREAR ELEMENTOS

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
