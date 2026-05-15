let modules = {};
let currentModule = null;
let currentIndex = 0;
let wrongQuestions = [];


// ==========================
// 1. CARGAR CONFIG (modules.json)
// ==========================
window.onload = function () {
  fetch("modules.json")
    .then(res => res.json())
    .then(data => loadModules(data));
};

// ==========================
// 2. CARGAR TODOS LOS EXCEL
// ==========================
function loadModules(config) {
  config.forEach(module => {
    fetch(module.file)
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        modules[module.name] = json;

        renderModules();
      });
  });
}

// ==========================
// 3. MOSTRAR BOTONES DE MÓDULOS
// ==========================
function renderModules() {
  const container = document.getElementById("modules");
  container.innerHTML = "";

  Object.keys(modules).forEach(name => {
    const btn = document.createElement("button");
    btn.innerText = name;
    btn.onclick = () => selectModule(name);
    container.appendChild(btn);
  });
}

// ==========================
// 4. SELECCIONAR MÓDULO
// ==========================
function selectModule(name) {
  currentModule = name;
  currentIndex = 0;
  showCard();
}

// ==========================
// 5. MOSTRAR PREGUNTA
// ==========================
function showCard() {
  const q = modules[currentModule][currentIndex];

  document.getElementById("question").innerText = q.Question;

  document.getElementById("answer").innerHTML = `
    <button class="answer-btn" onclick="checkAnswer('Answer 1', this)">${q["Answer 1"]}</button>
    <button class="answer-btn" onclick="checkAnswer('Answer 2', this)">${q["Answer 2"]}</button>
    <button class="answer-btn" onclick="checkAnswer('Answer 3', this)">${q["Answer 3"]}</button>
    <button class="answer-btn" onclick="checkAnswer('Answer 4', this)">${q["Answer 4"]}</button>
  `;

  document.getElementById("explain").innerHTML = "";
  updateProgress(); // <--- AÑADE ESTA LÍNEA
}

// ==========================
// 6. COMPROBAR RESPUESTA
// ==========================
function checkAnswer(option, btn) {
  const q = modules[currentModule][currentIndex];

  const selected = q[option];
  const correct = q["Correct Answer"];
  const explain = q["Answer Explain"];

  const buttons = document.querySelectorAll(".answer-btn");

  // Desactivar botones
  buttons.forEach(b => b.disabled = true);

  // Colorear según acierto
  if (selected === correct) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("incorrect");

    // Guardar pregunta fallada
    wrongQuestions.push(q);

    // Marcar la correcta en verde
    buttons.forEach(b => {
      if (b.innerText === correct) {
        b.classList.add("correct");
      }
    });
  }

  // Mostrar explicación
  document.getElementById("explain").innerHTML = `
    <b>Explicación:</b><br>${explain}
  `;
}


// ==========================
// 7. SIGUIENTE PREGUNTA
// ==========================
function nextCard() {
  currentIndex++;

  // Si se acabaron las preguntas normales
  if (currentIndex >= modules[currentModule].length) {

    // Si hay falladas → repetirlas
    if (wrongQuestions.length > 0) {
      modules[currentModule] = wrongQuestions;
      wrongQuestions = [];
      currentIndex = 0;
      alert("Repasemos las preguntas que fallaste");
    } else {
      alert("🎉 ¡Has completado el módulo!");
      currentIndex = 0;
    }
  }

  showCard();
}

function updateProgress() {
  const total = modules[currentModule].length;
  const current = currentIndex + 1;

  // Texto
  document.getElementById("progress-text").innerText =
    `Pregunta ${current} de ${total}`;

  // Barra
  const percent = (current / total) * 100;
  document.getElementById("progress-bar-fill").style.width = percent + "%";
}
