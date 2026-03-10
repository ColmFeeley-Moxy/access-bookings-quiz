const loginSection = document.getElementById("login");
const quizSection = document.getElementById("quiz");
const resultsSection = document.getElementById("results");

const loginForm = document.getElementById("loginForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const loginError = document.getElementById("loginError");

const welcomeEl = document.getElementById("welcome");
const questionEl = document.getElementById("question");
const questionWrap = document.getElementById("questionWrap");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const nextLabel = document.getElementById("nextLabel");
const progressEl = document.getElementById("progress");
const progressFill = document.getElementById("progressFill");
const scoreEl = document.getElementById("score");

const API_BASE_URL = "https://zp13fu2v8g.execute-api.eu-west-2.amazonaws.com";
const SAVE_RESULTS_URL = `${API_BASE_URL}/results`;
const QUIZ_VERSION = "accessbookings_v1";

const quiz = [
  {
    question: "Which Marriott brand is known for bold, playful and social hotel spaces?",
    choices: ["Moxy Hotels", "AC Hotels", "Residence Inn", "Element"],
    correctIndex: 0,
  },
  {
    question: "Which brand focuses on refined, design-led hospitality inspired by European style?",
    choices: ["Courtyard", "AC Hotels", "Moxy Hotels", "Element"],
    correctIndex: 1,
  },
  {
    question: "Which Marriott brand is designed primarily for longer stays with kitchen facilities?",
    choices: ["Residence Inn", "Moxy Hotels", "AC Hotels", "Courtyard"],
    correctIndex: 0,
  },
  {
    question: "Which brand emphasises wellbeing, sustainability and longer-stay comfort?",
    choices: ["Element by Westin", "Moxy Hotels", "Courtyard", "AC Hotels"],
    correctIndex: 0,
  },
  {
    question: "Hotel Co 51 operates multiple Marriott brands across Europe.",
    choices: ["True", "False"],
    correctIndex: 0,
  },
  {
    question: "What is the AC Hotel Inverness on-site restaurant called, offering dishes made with locally sourced ingredients?",
    choices: ["Beira", "The Highlands Kitchen", "River Ness Grill", "The Caledonian Table"],
    correctIndex: 0,
  },
  {
    question: "Which Moxy hotel would be best suited for a group attending an event at the Copper Box Arena in London?",
    choices: ["Moxy London Stratford", "Moxy London Excel", "Moxy London Heathrow", "Moxy London Earls Court"],
    correctIndex: 0,
  },
  {
    question: "Which Moxy would you recommend for someone attending an event in Edinburgh city centre?",
    choices: ["Moxy Edinburgh Fountainbridge", "Moxy Edinburgh Airport", "Moxy Glasgow SEC", "Moxy York"],
    correctIndex: 0,
  },
  {
    question: "True or False: Business travellers choose Moxy Hotels because they love that we're simple, affordable, and casual.",
    choices: ["True", "False"],
    correctIndex: 0,
  },
  {
    question: "Which is the oldest Moxy Hotel in the UK?",
    choices: ["Moxy Aberdeen Airport", "Moxy London Stratford", "Moxy York", "Moxy Glasgow SEC"],
    correctIndex: 0,
  },
];

let user = null;
let currentIndex = 0;
let score = 0;
let activeQuestion = null;
let answeredThisQuestion = false;

// ── Helpers ──────────────────────────────────────────────

function shuffleAnswers(question) {
  const answers = question.choices.map((text, index) => ({
    text,
    isCorrect: index === question.correctIndex,
  }));
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  return {
    ...question,
    choices: answers.map((a) => a.text),
    correctIndex: answers.findIndex((a) => a.isCorrect),
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setScreen(which) {
  loginSection.classList.toggle("hidden", which !== "login");
  quizSection.classList.toggle("hidden", which !== "quiz");
  resultsSection.classList.toggle("hidden", which !== "results");
}

function getResultMessage(s, total) {
  const pct = s / total;
  if (pct === 1)  return "Perfect score! You're a Hotel Co 51 expert. 🌟";
  if (pct >= 0.8) return "Excellent work — you clearly know your brands!";
  if (pct >= 0.6) return "Good effort! A little more time with the portfolio and you'll nail it.";
  if (pct >= 0.4) return "A decent start — revisit the Hotel Co 51 brand guide to sharpen up.";
  return "Worth another look at the brand portfolio before your next booking.";
}

function getResultEmoji(s, total) {
  const pct = s / total;
  if (pct === 1)  return "🏆";
  if (pct >= 0.8) return "🎉";
  if (pct >= 0.5) return "👍";
  return "💡";
}

// ── Progress ─────────────────────────────────────────────

function updateProgress() {
  const pct = (currentIndex / quiz.length) * 100;
  progressFill.style.width = `${Math.max(pct, 5)}%`;
  progressEl.textContent = `Question ${currentIndex + 1} of ${quiz.length}`;
  scoreEl.textContent = `Score: ${score}`;
}

function popScore() {
  scoreEl.classList.remove("pop");
  void scoreEl.offsetWidth;
  scoreEl.classList.add("pop");
  setTimeout(() => scoreEl.classList.remove("pop"), 300);
}

// ── Question rendering ────────────────────────────────────

function renderQuestion() {
  answeredThisQuestion = false;
  feedbackEl.textContent = "";
  feedbackEl.classList.remove("visible");
  nextBtn.disabled = true;
  nextLabel.textContent = currentIndex === quiz.length - 1 ? "Finish Quiz" : "Next Question";

  updateProgress();

  activeQuestion = shuffleAnswers(quiz[currentIndex]);
  questionEl.textContent = activeQuestion.question;
  choicesEl.innerHTML = "";

  questionWrap.style.animation = "none";
  void questionWrap.offsetWidth;
  questionWrap.style.animation = "";

  activeQuestion.choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = text;
    btn.style.animationDelay = `${i * 0.06}s`;
    btn.addEventListener("click", () => handleChoice(i));
    choicesEl.appendChild(btn);
  });
}

function handleChoice(selectedIndex) {
  if (answeredThisQuestion) return;
  answeredThisQuestion = true;

  const buttons = Array.from(choicesEl.querySelectorAll("button"));

  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === activeQuestion.correctIndex) b.classList.add("correct");
  });

  if (selectedIndex === activeQuestion.correctIndex) {
    score += 1;
    feedbackEl.textContent = "✅ Correct!";
    popScore();
  } else {
    buttons[selectedIndex].classList.add("wrong");
    feedbackEl.textContent = `❌ Correct answer: ${activeQuestion.choices[activeQuestion.correctIndex]}`;
  }

  scoreEl.textContent = `Score: ${score}`;
  feedbackEl.classList.add("visible");
  nextBtn.disabled = false;
}

// ── Results & Save ────────────────────────────────────────

async function saveResultToAWS() {
  const payload = {
    name: user.name,
    email: user.email,
    score,
    quizVersion: QUIZ_VERSION,
  };
  const res = await fetch(SAVE_RESULTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 409) return { status: "already_submitted" };
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Save failed (${res.status}). ${text}`);
  }
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error("Save failed (success=false).");
  return { status: "saved" };
}

async function showResults() {
  document.getElementById("resultsIcon").textContent = getResultEmoji(score, quiz.length);
  document.getElementById("resultsTitle").textContent = "Quiz Complete!";
  document.getElementById("resultsSubtitle").textContent = `Well done, ${user.name}!`;
  document.getElementById("resultsScoreNum").textContent = score;
  document.getElementById("resultsScoreDenom").textContent = `/ ${quiz.length}`;
  document.getElementById("resultsMsg").textContent = getResultMessage(score, quiz.length);

  progressFill.style.width = "100%";
  setScreen("results");

  const saveStatus = document.getElementById("saveStatus");
  const learnMoreBtn = document.getElementById("learnMoreBtn");

  saveStatus.textContent = "Saving your result…";

  try {
    const result = await saveResultToAWS();
    if (result.status === "already_submitted") {
      saveStatus.textContent = "ℹ️ Our records show you've already submitted this quiz.";
    } else {
      saveStatus.textContent = "✅ Your result has been saved.";
    }
  } catch (err) {
    saveStatus.textContent = `⚠️ Couldn't save automatically — please let the organiser know. (${err.message})`;
  }

  learnMoreBtn.style.display = "flex";
  learnMoreBtn.addEventListener("click", () => window.open("https://hotelco51.com/", "_blank"));
}

// ── Login ────────────────────────────────────────────────

function validateField(input, errorEl, test, msg) {
  if (!test) {
    input.classList.add("input-error");
    errorEl.textContent = msg;
    return false;
  }
  input.classList.remove("input-error");
  errorEl.textContent = "";
  return true;
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();

  const nameOk  = validateField(nameInput,  nameError,  name.length >= 2,    "Please enter your full name.");
  const emailOk = validateField(emailInput, emailError, isValidEmail(email), "Please enter a valid email address.");

  if (!nameOk || !emailOk) return;

  user = { name, email };
  sessionStorage.setItem("quizUser", JSON.stringify(user));
  startQuiz();
});

nameInput.addEventListener("blur", () => {
  if (nameInput.value.trim()) {
    validateField(nameInput, nameError, nameInput.value.trim().length >= 2, "Please enter your full name.");
  }
});

emailInput.addEventListener("blur", () => {
  if (emailInput.value.trim()) {
    validateField(emailInput, emailError, isValidEmail(emailInput.value.trim()), "Please enter a valid email address.");
  }
});

// ── Next / Finish ────────────────────────────────────────

nextBtn.addEventListener("click", () => {
  if (nextBtn.disabled) return;
  if (currentIndex === quiz.length - 1) {
    showResults();
    return;
  }
  currentIndex += 1;
  renderQuestion();
});

// ── Start ────────────────────────────────────────────────

function startQuiz() {
  currentIndex = 0;
  score = 0;
  activeQuestion = null;
  answeredThisQuestion = false;
  welcomeEl.textContent = `Hi, ${user.name} 👋`;
  setScreen("quiz");
  renderQuestion();
}

setScreen("login");

// ── Aurora Background ─────────────────────────────────────

(function initAurora() {
  const canvas = document.getElementById("auroraCanvas");
  const ctx = canvas.getContext("2d");

  // Brand colour palette — warm oranges, soft greens, muted blues, dusty pinks
  const brandColours = [
    "#DE9941", // orange
    "#EBB677", // light orange
    "#F3CB98", // cream
    "#A0CB6E", // green
    "#BAD797", // light green
    "#AFD385", // mid green
    "#6974B5", // blue
    "#848EC2", // mid blue
    "#A1A6CD", // light blue
    "#C66678", // pink
    "#D39EAA", // light pink
    "#CA8291", // mid pink
  ];

  // Each blob: position, size, colour, drift velocity, phase offset for breathing
  const BLOB_COUNT = 7;
  let blobs = [];

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return { r, g, b };
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initBlobs() {
    blobs = [];
    for (let i = 0; i < BLOB_COUNT; i++) {
      const colour = brandColours[Math.floor(Math.random() * brandColours.length)];
      const rgb = hexToRgb(colour);
      blobs.push({
        x:      Math.random() * canvas.width,
        y:      Math.random() * canvas.height,
        // Base radius — large soft blobs
        baseR:  canvas.width * (0.22 + Math.random() * 0.22),
        // Breathing amplitude
        breathAmp: canvas.width * (0.04 + Math.random() * 0.06),
        // Individual drift speeds — very slow
        dx: (Math.random() - 0.5) * 0.28,
        dy: (Math.random() - 0.5) * 0.28,
        // Phase for breathing animation, staggered
        phase: Math.random() * Math.PI * 2,
        // Breathing speed
        breathSpeed: 0.003 + Math.random() * 0.003,
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        // Max opacity — keep translucent so blobs layer beautifully
        opacity: 0.13 + Math.random() * 0.10,
      });
    }
  }

  let t = 0;

  function draw() {
    t++;

    // Fill base background colour
    ctx.fillStyle = "#F3CB98";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each blob as a large radial gradient circle
    blobs.forEach(blob => {
      // Breathing: radius pulses gently
      blob.phase += blob.breathSpeed;
      const r = blob.baseR + Math.sin(blob.phase) * blob.breathAmp;

      // Drift
      blob.x += blob.dx;
      blob.y += blob.dy;

      // Soft wrap-around — blobs reappear on the other side rather than bouncing
      if (blob.x < -r)             blob.x = canvas.width  + r;
      if (blob.x >  canvas.width  + r) blob.x = -r;
      if (blob.y < -r)             blob.y = canvas.height + r;
      if (blob.y >  canvas.height + r) blob.y = -r;

      // Radial gradient: colour at centre fading to transparent
      const grad = ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, r
      );
      grad.addColorStop(0,   `rgba(${blob.r},${blob.g},${blob.b},${blob.opacity})`);
      grad.addColorStop(0.5, `rgba(${blob.r},${blob.g},${blob.b},${blob.opacity * 0.5})`);
      grad.addColorStop(1,   `rgba(${blob.r},${blob.g},${blob.b},0)`);

      ctx.beginPath();
      ctx.arc(blob.x, blob.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  initBlobs();
  draw();

  window.addEventListener("resize", () => {
    resize();
    initBlobs();
  });
})();