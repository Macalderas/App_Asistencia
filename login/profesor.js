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

  fetch("http://localhost:3000/profesores/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password })
  })
    .then(res => {
      if (!res.ok) throw new Error("Credenciales incorrectas");
      return res.json();
    })
    .then(profesor => {
      fetch(`http://localhost:3000/alumnos?correo=${encodeURIComponent(correo)}`)
        .then(res => res.json())
        .then(alumnos => {
          profesor.alumnos = alumnos;
          mostrarPanelProfesor(profesor);
        });
    })
    .catch(err => {
      console.error(err);
      alert("Correo o contraseña incorrectos");
    });
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
    alert("Recuperación disponible solo desde el backend."); 
    mostrarLoginProfesor();
  });

  const volver = crearBoton("Volver", mostrarLoginProfesor);
  contenedor.append(titulo, correo, btnBuscar, volver);
  root.appendChild(contenedor);
}

export function mostrarPanelProfesor(profesor) {
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

  const cerrar = crearBoton("Cerrar sesión", () => {
    localStorage.removeItem("profesorSesion");
    mostrarSelector();
  });

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
  let nuevoEstado;
  if (ultima === null || ultima === undefined) {
    nuevoEstado = true;
  } else if (ultima === true) {
    nuevoEstado = false;
  } else {
    nuevoEstado = null;
  }

  alumno.asistencias.push(nuevoEstado);

  fetch(`http://localhost:3000/alumnos/${alumno.id}/asistencia`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asistencias: alumno.asistencias })
  })
  .then(() => mostrarPanelProfesor(profesor))
  .catch(err => console.error("Error actualizando asistencia", err));
}

function marcarAsistenciaTodos(profesor, estado) {
  profesor.alumnos.forEach(alumno => {
    if (!alumno.asistencias) {
      alumno.asistencias = [];
    }
    alumno.asistencias.push(estado);

    fetch(`http://localhost:3000/alumnos/${alumno.id}/asistencia`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asistencias: alumno.asistencias })
    }).catch(err => console.error("Error actualizando asistencia", err));
  });

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

  const alumno = profesor.alumnos[alumnoIndex];
  alumno.uniforme = nuevasFaltas;

  fetch(`http://localhost:3000/alumnos/${alumno.id}/uniforme`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uniforme: alumno.uniforme })
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al actualizar uniforme");
    return res.json();
  })
  .then(() => {
    return fetch(`http://localhost:3000/alumnos?correo=${encodeURIComponent(profesor.correo)}`);
  })
  .then(res => res.json())
  .then(nuevosAlumnos => {
    profesor.alumnos = nuevosAlumnos;
    mostrarPanelProfesor(profesor);
  })
  .catch(err => {
    console.error("Error guardando uniforme:", err);
    alert("Error al guardar uniforme");
  });
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

  const nuevoAlumno = {
    nombre,
    grado,
    asistencias: [],
    uniforme: [],
    correoProfesor: profesor.correo
  };

  fetch("http://localhost:3000/alumnos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoAlumno)
  })
  .then(res => res.json())
  .then(data => {
    profesor.alumnos.push({ ...nuevoAlumno, id: data.id });
    mostrarPanelProfesor(profesor);
  })
  .catch(err => {
    console.error(err);
    alert("Error al guardar el alumno");
  });
}

function eliminarAlumno(profesor, alumnoIndex) {
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
  titulo.textContent = "Confirmar eliminación";
  contenido.appendChild(titulo);

  const mensaje = document.createElement("p");
  mensaje.textContent = "¿Estás seguro de eliminar este alumno?";
  contenido.appendChild(mensaje);

  const btnConfirmar = crearBoton("Sí, eliminar", () => {
    const alumno = profesor.alumnos[alumnoIndex];
    fetch(`http://localhost:3000/alumnos/${alumno.id}`, {
      method: "DELETE"
    })
    .then(() => {
      profesor.alumnos.splice(alumnoIndex, 1);
      mostrarPanelProfesor(profesor);
    })
    .catch(err => {
      console.error(err);
      alert("Error al eliminar alumno");
    });
    document.body.removeChild(modal);
  });

  const btnCancelar = crearBoton("Cancelar", () => {
    document.body.removeChild(modal);
  });

  contenido.appendChild(btnConfirmar);
  contenido.appendChild(btnCancelar);

  modal.appendChild(contenido);
  document.body.appendChild(modal);
}

function mostrarProyeccionIndividual(profesor, alumnoIndex) {
  const alumno = profesor.alumnos[alumnoIndex];
  const asistencias = alumno.asistencias || [];

  const ventana = window.open("", "_blank", "width=400,height=400");
  ventana.document.write(`<h2>Proyección de asistencia - ${alumno.nombre}</h2>`);

  const presentes = asistencias.filter(a => a === true).length;
  const ausentes = asistencias.filter(a => a === false).length;
  const sinMarcar = asistencias.filter(a => a === null || a === undefined).length;

  ventana.document.write(`<p>Presentes: ${presentes}</p>`);
  ventana.document.write(`<p>Ausentes: ${ausentes}</p>`);
  ventana.document.write(`<p>Sin marcar: ${sinMarcar}</p>`);

  ventana.document.write(`<canvas id="graficaIndividual" width="300" height="300"></canvas>`);

  const script = ventana.document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/chart.js";
  script.onload = () => {
    const ctx = ventana.document.getElementById("graficaIndividual").getContext("2d");
    new ventana.Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Presentes", "Ausentes", "Sin marcar"],
        datasets: [{
          label: "Asistencia",
          data: [presentes, ausentes, sinMarcar],
          backgroundColor: [
            "rgba(40, 167, 69, 0.7)",
            "rgba(220, 53, 69, 0.7)",
            "rgba(255, 193, 7, 0.7)"
          ]
        }]
      }
    });
  };
  ventana.document.head.appendChild(script);
}

function obtenerResumenAsistenciaPorGrado(profesor) {
  const resumen = {};
  profesor.grados.forEach(g => {
    resumen[g] = { presentes: 0, ausentes: 0 };
  });

  profesor.alumnos.forEach(alumno => {
    const asistencias = alumno.asistencias || [];
    const ultimo = asistencias.length ? asistencias[asistencias.length - 1] : null;

    if (ultimo === true) resumen[alumno.grado].presentes++;
    else if (ultimo === false) resumen[alumno.grado].ausentes++;
  });

  return resumen;
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
