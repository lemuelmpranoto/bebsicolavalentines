const barthyImage = document.getElementById("barthyImage");
const meepsImage = document.getElementById("meepsImage");

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
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps.png",
    speaker: "barthy",
    text: "Meepssss",
    next: "meeps_hi"
  },

  meeps_hi: {
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps.png",
    speaker: "meeps",
    text: "Hi Barthy",
    next: "hug"
  },

  hug: {
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps.png",
    speaker: "barthy",
    text: "*Barthy and Meeps hug*",
    next: "ask_valentine"
  },

  ask_valentine: {
    barthyImage: "assets/barthy_bouquet.png",
    meepsImage: "assets/meeps.png",
    speaker: "barthy",
    text: "Would you be my valentines?",
    choices: true
  },

  no_cry: {
    barthyImage: "assets/barthy_cry.png",
    meepsImage: "assets/meeps_sad.png",
    speaker: "barthy",
    text: "Barthy sad… Barthy lonely…",
    next: "walk_away"
  },

  walk_away: {
    barthyImage: "assets/barthy_walk.png",
    meepsImage: "assets/meeps_sad.png",
    speaker: "barthy",
    text: "*Barthy starts walking away*",
    modal: {
      text: "Is Meeps really letting Barthy walk away heartbroken?",
      yes: "barthy_faint",
      no: "meeps_calls_back"
    }
  },

  meeps_calls_back: {
    barthyImage: "assets/barthy_turn.png",
    meepsImage: "assets/meeps_calling.png",
    speaker: "meeps",
    text: "Wait Barthy, come back!",
    next: "barthy_returns"
  },

  barthy_returns: {
    barthyImage: "assets/barthy_smile.png",
    meepsImage: "assets/meeps_smile.png",
    speaker: "meeps",
    text: "Ask me again.. Hehhe",
    next: "ask_valentine"
  },

  barthy_faint: {
    barthyImage: "assets/barthy_faint.png",
    meepsImage: "assets/meeps_shocked.png",
    speaker: "barthy",
    text: "*Barthy faints*",
    modal: {
      text: "Is Meeps gonna help Barthy????",
      yes: "kiss_repeat",
      no: "end_sad"
    }
  },

  kiss_repeat: {
    barthyImage: "assets/barthy_happy.png",
    meepsImage: "assets/meeps_happy.png",
    speaker: "meeps",
    text: "*Meeps kisses Barthy. They hug.*",
    next: "ask_valentine_again"
  },

  ask_valentine_again: {
    barthyImage: "assets/barthy_neutral.png",
    meepsImage: "assets/meeps_tease.png",
    speaker: "meeps",
    text: "Ask me again.. hehe",
    next: "ask_valentine"
  },

  yes_happy: {
    barthyImage: "assets/barthy_excited.png",
    meepsImage: "assets/meeps_happy.png",
    speaker: "barthy",
    text: "Yaay! I'm so excited to be your valentines",
    next: "end_happy"
  },

  end_happy: {
    barthyImage: "assets/barthy_happy.png",
    meepsImage: "assets/meeps_happy.png",
    speaker: "meeps",
    text: "Pottery. Candles. Dinner. Valentines together"
  },

  end_sad: {
    barthyImage: "assets/barthy_sad.png",
    meepsImage: "assets/meeps_sad.png",
    speaker: "barthy",
    text: "Oh well… maybe next year"
  }
};

/* -------- CORE -------- */

function goToState(stateKey) {
  const state = states[stateKey];
  currentState = stateKey;

  if (state.barthyImage) {
    barthyImage.src = state.barthyImage;
  }

  if (state.meepsImage) {
    meepsImage.src = state.meepsImage;
  }

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

/* -------- HOVER EFFECTS -------- */

yesBtn.addEventListener("mouseenter", () => {
  if (currentState === "ask_valentine") {
    barthyImage.src = "assets/barthy_bouquet_happy.png";
  }
});

noBtn.addEventListener("mouseenter", () => {
  if (currentState === "ask_valentine") {
    barthyImage.src = "assets/barthy_bouquet_sad.png";
  }
});


/* -------- EVENTS -------- */

yesBtn.addEventListener("click", () => {
  goToState("yes_happy");
});

noBtn.addEventListener("click", () => {
  barthyImage.classList.add("shake");
  setTimeout(() => barthyImage.classList.remove("shake"), 400);
  goToState("no_cry");
});

/* -------- START -------- */

goToState("intro");
