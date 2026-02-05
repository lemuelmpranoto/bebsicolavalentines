const sceneImage = document.getElementById("sceneImage");

const barthyBox = document.getElementById("barthyBox");
const meepsBox = document.getElementById("meepsBox");
const barthyText = document.getElementById("barthyText");
const meepsText = document.getElementById("meepsText");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

const modal = document.getElementById("modal");
const modalText = document.getElementById("modalText");
const modalYes = document.getElementById("modalYes");
const modalNo = document.getElementById("modalNo");

let currentState = null;

/* -------- STATES -------- */

const states = {
  intro: {
    image: "assets/barthy.png",
    speaker: "barthy",
    text: "Meepssss",
    next: "meeps_hi"
  },

  meeps_hi: {
    image: "assets/meeps.png",
    speaker: "meeps",
    text: "Hi Barthy",
    next: "hug"
  },

  hug: {
    image: "assets/barthy.png",
    speaker: "barthy",
    text: "*Barthy and Meeps hug*",
    next: "ask_valentine"
  },

  ask_valentine: {
    image: "barthy_neutral.jpeg",
    speaker: "barthy",
    text: "Would you be my valentines?",
    choices: true
  },

  no_cry: {
    image: "barthy_cry.jpeg",
    speaker: "barthy",
    text: "Barthy sad… Barthy lonely…",
    next: "walk_away"
  },

  walk_away: {
    image: "barthy_walk.jpeg",
    speaker: "barthy",
    text: "*Barthy starts walking away*",
    modal: {
      text: "Is Meeps really letting Barthy walk away heartbroken?",
      yes: "barthy_faint",
      no: "meeps_calls_back"
    }
  },

  meeps_calls_back: {
    image: "meeps_calling.jpeg",
    speaker: "meeps",
    text: "Wait Barthy, come back!",
    next: "barthy_returns"
  },

  barthy_returns: {
    image: "barthy_smile.jpeg",
    speaker: "meeps",
    text: "Ask me again.. Hehhe",
    next: "ask_valentine"
  },

  barthy_faint: {
    image: "barthy_faint.jpeg",
    speaker: "barthy",
    text: "*Barthy faints*",
    modal: {
      text: "Is Meeps gonna help Barthy????",
      yes: "kiss_repeat",
      no: "end_sad"
    }
  },

  kiss_repeat: {
    image: "kiss.jpeg",
    speaker: "meeps",
    text: "*Meeps kisses Barthy. They hug.*",
    next: "ask_valentine_again"
  },

  ask_valentine_again: {
    image: "barthy_smile.jpeg",
    speaker: "meeps",
    text: "Ask me again.. hehe",
    next: "ask_valentine"
  },

  yes_happy: {
    image: "barthy_happy.jpeg",
    speaker: "barthy",
    text: "Yaay! I'm so excited to be your valentines",
    next: "end_happy"
  },

  end_happy: {
    image: "photo.jpeg",
    speaker: "meeps",
    text: "Pottery. Candles. Dinner. Valentines together"
  },

  end_sad: {
    image: "photo.jpeg",
    speaker: "barthy",
    text: "Oh well… maybe next year"
  }
};

/* -------- CORE LOGIC -------- */

function goToState(stateKey) {
  const state = states[stateKey];
  currentState = stateKey;

  sceneImage.src = state.image;

  hideDialogue();
  hideChoices();
  hideModal();

  if (state.speaker === "barthy") {
    barthyText.textContent = state.text;
    barthyBox.classList.remove("hidden");
  }

  if (state.speaker === "meeps") {
    meepsText.textContent = state.text;
    meepsBox.classList.remove("hidden");
  }

  if (state.choices) {
    showChoices();
    return;
  }

  if (state.modal) {
    setTimeout(() => showModal(state.modal), 1000);
    return;
  }

  if (state.next) {
    setTimeout(() => goToState(state.next), 1500);
  }
}

/* -------- MODAL -------- */

function showModal({ text, yes, no }) {
  modalText.textContent = text;
  modal.classList.remove("hidden");

  modalYes.onclick = () => {
    hideModal();
    goToState(yes);
  };

  modalNo.onclick = () => {
    hideModal();
    goToState(no);
  };
}

function hideModal() {
  modal.classList.add("hidden");
}

/* -------- UI -------- */

function hideDialogue() {
  barthyBox.classList.add("hidden");
  meepsBox.classList.add("hidden");
}

function showChoices() {
  yesBtn.style.display = "inline-block";
  noBtn.style.display = "inline-block";
}

function hideChoices() {
  yesBtn.style.display = "none";
  noBtn.style.display = "none";
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
