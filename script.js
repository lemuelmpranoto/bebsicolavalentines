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
let animationTimeout = null;


/* =====================================================
   IMAGE HELPERS
===================================================== */

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

function setImageSafely(imgEl, src, showFn) {

  imgEl.style.visibility = "hidden";
  imgEl.style.opacity = "0";

  imgEl.onload = null;
  imgEl.src = src;

  if (imgEl.complete) {
    showFn();
  } else {
    imgEl.onload = showFn;
  }
}


/* =====================================================
   UI HELPERS
===================================================== */

function hideDialogue() {
  barthyBox.classList.add("hidden");
  meepsBox.classList.add("hidden");
}

function showDialogue(speaker, text) {

  if (!speaker || !text) return;

  if (speaker === "barthy") {
    barthyText.textContent = text;
    barthyBox.classList.remove("hidden");
  }

  if (speaker === "meeps") {
    meepsText.textContent = text;
    meepsBox.classList.remove("hidden");
  }
}

function showChoices() {
  yesBtn.style.display = "inline-block";
  noBtn.style.display = "inline-block";
}

function hideChoices() {
  yesBtn.style.display = "none";
  noBtn.style.display = "none";
}


/* =====================================================
   MODAL SYSTEM
===================================================== */

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


/* =====================================================
   ANIMATION SYSTEM
===================================================== */

function playAnimation(animation) {

  if (!animation) return;

  const { type, duration, next } = animation;

  if (type === "walkTogether") {

    barthyImage.classList.add("walking-left");
    meepsImage.classList.add("walking-right");

  }

  if (type === "fall") {

    barthyImage.classList.add("fall");

  }

  animationTimeout = setTimeout(() => {

    barthyImage.classList.remove("walking-left", "fall");
    meepsImage.classList.remove("walking-right");

    if (next) goToState(next);

  }, duration);
}


/* =====================================================
   STATE ENGINE
===================================================== */

function goToState(stateKey) {

  const state = states[stateKey];
  currentState = stateKey;

  if (animationTimeout) {
    clearTimeout(animationTimeout);
  }

  hideScene();
  hideDialogue();
  hideChoices();

  /* ---------- SCENE MODE ---------- */

  if (state.sceneImage) {

    hideBarthy();
    hideMeeps();

    showScene(state.sceneImage);

  }

  /* ---------- CHARACTER MODE ---------- */

  else {

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

  /* ---------- DIALOGUE ---------- */

  showDialogue(state.speaker, state.text);


  /* ---------- CHOICES ---------- */

  if (state.choices) {
    showChoices();
    return;
  }


  /* ---------- MODAL ---------- */

  if (state.modal) {

    setTimeout(() => {
      showModalPrompt(state.modal);
    }, 600);

    return;
  }


  /* ---------- ANIMATION ---------- */

  if (state.animation) {
    playAnimation(state.animation);
    return;
  }


  /* ---------- AUTO NEXT ---------- */

  if (state.next) {

    animationTimeout = setTimeout(() => {
      goToState(state.next);
    }, state.delay || 1500);

  }

}


/* =====================================================
   STATES
===================================================== */

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
    meepsImage: "assets/meeps_walking.png",

    animation: {
      type: "walkTogether",
      duration: 1200,
      next: "hug"
    }
  },

  hug: {
    sceneImage: "assets/hug.png",
    delay: 1000,
    next: "ask_valentine"
  },

  ask_valentine: {
    barthyImage: "assets/barthy_bouquet.png",
    meepsImage: "assets/meeps.png",
    speaker: "barthy",
    text: "Will you be my valentines?",
    choices: true
  },

  no_cry: {
    barthyImage: "assets/barthy_sad.png",
    meepsImage: "assets/meeps.png",
    speaker: "barthy",
    text: "Barthy sad… Barthy lonely…",
    next: "walk_away"
  },

  walk_away: {
    barthyImage: "assets/barthy_walking_sad.png",
    meepsImage: "assets/meeps.png",

    modal: {
      text: "Is Meeps really letting Barthy walk away heartbroken?",
      yes: "barthy_falling",
      no: "meeps_calls_back"
    }
  },

  barthy_falling: {
    barthyImage: "assets/barthy_falling.png",
    meepsImage: "assets/meeps_walking.png",

    animation: {
      type: "fall",
      duration: 800,
      next: "barthy_faint"
    }
  },

  barthy_faint: {
    barthyImage: "assets/barthy_faint.png",
    meepsImage: "assets/meeps_shocked.png",

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


/* =====================================================
   HOVER EVENTS
===================================================== */

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


/* =====================================================
   CLICK EVENTS
===================================================== */

yesBtn.onclick = () => goToState("yes_happy");
noBtn.onclick = () => goToState("no_cry");


/* =====================================================
   START GAME
===================================================== */

goToState("intro");
