const sceneImage = document.getElementById("sceneImage");
const text = document.getElementById("text");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

const modal = document.getElementById("modal");
const modalText = document.getElementById("modalText");
const modalYes = document.getElementById("modalYes");
const modalNo = document.getElementById("modalNo");

let currentState = "intro";

/* -------- STATES -------- */

const states = {
  intro: {
    image: "photo.jpeg",
    text: "Barthy: Meepssss",
    next: "meeps_hi"
  },

  meeps_hi: {
    image: "photo.jpeg",
    text: "Meeps: Hi Barthy",
    next: "hug"
  },

  hug: {
    image: "photo.jpeg",
    text: "*Barthy and Meeps hug*",
    next: "ask_valentine"
  },

  ask_valentine: {
    image: "barthy_neutral.jpeg",
    text: "Barthy: Would you be my valentines?",
    choices: true
  },

  no_cry: {
    image: "barthy_cry.jpeg",
    text: "Barthy sad… Barthy lonely…",
    next: "walk_away"
  },

  walk_away: {
    image: "barthy_walk.jpeg",
    text: "*Barthy starts walking away*",
    modal: {
      text: "Is Meeps really letting Barthy walk away heartbroken?",
      yes: "barthy_faint",
      no: "end_sad"
    }
  },

  barthy_faint: {
    image: "barthy_faint.jpeg",
    text: "*Barthy faints*",
    modal: {
      text: "Is Meeps gonna help Barthy????",
      yes: "kiss_repeat",
      no: "end_sad"
    }
  },

  kiss_repeat: {
    image: "kiss.jpeg",
    text: "*Meeps kisses Barthy. They hug.*",
    next: "ask_valentine_again"
  },

  ask_valentine_again: {
    image: "barthy_smile.jpeg",
    text: "Meeps: Ask me again.. hehe",
    next: "ask_valentine"
  },

  yes_happy: {
    image: "barthy_happy.jpeg",
    text: "Barthy: Yaay! I'm so excited to be your valentines 💖",
    next: "end_happy"
  },

  end_happy: {
    image: "photo.jpeg",
    text: "Pottery. Candles. Dinner. Valentines together 💕",
    choices: false
  },

  end_sad: {
    image: "photo.jpeg",
    text: "Oh well… maybe next year 💔",
    choices: false
  }
};

/* -------- FUNCTIONS -------- */

function goToState(stateKey) {
  const state = states[stateKey];
  currentState = stateKey;

  sceneImage.src = state.image;
  text.textContent = state.text || "";

  yesBtn.style.display = state.choices ? "inline-block" : "none";
  noBtn.style.display = state.choices ? "inline-block" : "none";

  if (state.next && !state.choices && !state.modal) {
    setTimeout(() => goToState(state.next), 1500);
  }

  if (state.modal) {
    setTimeout(() => showModal(state.modal), 1200);
  }
}

function showModal({ text, yes, no }) {
  modalText.textContent = text;
  modal.classList.remove("hidden");

  modalYes.onclick = () => {
    modal.classList.add("hidden");
    goToState(yes);
  };

  modalNo.onclick = () => {
    modal.classList.add("hidden");
    goToState(no);
  };
}

/* -------- EVENTS -------- */

yesBtn.addEventListener("mouseenter", () => {
  if (currentState === "ask_valentine") {
    sceneImage.src = "barthy_happy.jpeg";
  }
});

noBtn.addEventListener("mouseenter", () => {
  if (currentState === "ask_valentine") {
    sceneImage.src = "barthy_sad.jpeg";
  }
});

yesBtn.addEventListener("click", () => {
  goToState("yes_happy");
});

noBtn.addEventListener("click", () => {
  sceneImage.classList.add("shake");
  setTimeout(() => sceneImage.classList.remove("shake"), 400);
  goToState("no_cry");
});

/* -------- START -------- */

goToState("intro");
