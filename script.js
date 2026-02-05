const barthyImage = document.getElementById("barthyImage");
const meepsImage = document.getElementById("meepsImage");
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

/* -------- Helpers -------- */

function showBarthy() {
  barthyImage.style.visibility = "visible";
  barthyImage.style.opacity = "1";
}

function hideBarthy() {
  barthyImage.style.visibility = "hidden";
  barthyImage.style.opacity = "0";
}


function showMeeps() {
  meepsImage.style.visibility = "visible";
  meepsImage.style.opacity = "1";
}

function hideMeeps() {
  meepsImage.style.visibility = "hidden";
  meepsImage.style.opacity = "0";
}


function showScene(src) {
  sceneImage.src = src;
  sceneImage.classList.remove("hidden");
}

function hideScene() {
  sceneImage.classList.add("hidden");
}

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

function showModalPrompt({ text, yes, no }) {
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
    keepCharacters: true,
    speaker: "meeps",
    text: "Hi Barthy",
    next: "barthy_meeps_walking"
  },

  barthy_meeps_walking: {
    barthyImage: "assets/barthy_walking.png",
    meepsImage: "assets/meeps_walking.png"
  },

  hug: {
    sceneImage: "assets/hug.png",
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
    sceneImage: "assets/kiss.png",
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

  hideScene();
  hideDialogue();
  hideChoices();

  if (state.sceneImage) {
    hideBarthy();
    hideMeeps();
    showScene(state.sceneImage);
  } else {
    hideScene();

    if (state.keepCharacters) {
      showBarthy();
      showMeeps();
    } else {
      if (state.barthyImage) {
        setImageSafely(barthyImage, state.barthyImage, showBarthy);
      } else {
        hideBarthy();
      }

      if (state.meepsImage) {
        setImageSafely(meepsImage, state.meepsImage, showMeeps);
      } else {
        hideMeeps();
      }
    }
  }

  if (stateKey === "barthy_meeps_walking") {
    barthyImage.classList.add("walking-left");
    meepsImage.classList.add("walking-right");

    setTimeout(() => {
      barthyImage.classList.remove("walking-left");
      meepsImage.classList.remove("walking-right");
      goToState("hug");
    }, 1200);
    return;
  }

  if (state.speaker && state.text) {
    if (state.speaker === "barthy") {
      barthyText.textContent = state.text;
      barthyBox.classList.remove("hidden");
    }
    if (state.speaker === "meeps") {
      meepsText.textContent = state.text;
      meepsBox.classList.remove("hidden");
    }
  }

  if (state.choices) {
    showChoices();
    return;
  }

  if (state.modal) {
    setTimeout(() => showModalPrompt(state.modal), 800);
    return;
  }

  if (state.next) {
    setTimeout(() => goToState(state.next), 1500);
  }
}

function setImageSafely(imgEl, src, showFn) {
  imgEl.style.visibility = "hidden";
  imgEl.style.opacity = "0";

  // Clear previous handler
  imgEl.onload = null;

  // Assign src first
  imgEl.src = src;

  // If already loaded (cached)
  if (imgEl.complete) {
    showFn();
  } else {
    imgEl.onload = () => {
      showFn();
    };
  }
}


/* -------- Hover -------- */

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

/* -------- Clicks -------- */

yesBtn.addEventListener("click", () => goToState("yes_happy"));
noBtn.addEventListener("click", () => goToState("no_cry"));

/* -------- START -------- */

goToState("intro");
