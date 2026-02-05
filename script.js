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

        barthyImage.classList.remove("scale-small", "scale-large");

        setImageSafely(barthyImage, state.barthyImage, () => {

          showBarthy();

          if (state.barthyScale) {
            barthyImage.classList.add(state.barthyScale);
          }

        });

      }
      else {
        hideBarthy();
      }

      if (state.meepsImage) {

        meepsImage.classList.remove("scale-small", "scale-large");

        setImageSafely(meepsImage, state.meepsImage, () => {

          showMeeps();

          if (state.meepsScale) {
            meepsImage.classList.add(state.meepsScale);
          }

        });

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
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "Meepssss",
    next: "meeps_hi"
  },

  meeps_hi: {
    //keepCharacters: true,
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps_wave.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    text: "Hi Barthy",
    next: "barthy_meeps_walking"
  },

  barthy_meeps_walking: {
    barthyImage: "assets/barthy_walking.png",
    meepsImage: "assets/meeps_walking.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
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
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "Will you be my valentines?",
    choices: true
  },

  no_cry: {
    barthyImage: "assets/barthy_sad.png",
    meepsImage: "assets/meeps_grin.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "Barthy sad… Barthy lonely…",
    next: "walk_away"
  },

  walk_away: {
    barthyImage: "assets/barthy_walking_sad.png",
    meepsImage: "assets/meeps_grin.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    modal: {
      text: "Is Meeps really letting Barthy walk away heartbroken?",
      yes: "barthy_falling",
      no: "meeps_calls_back"
    }
  },

  meeps_calls_back: {
    barthyImage: "assets/barthy_walking_sad.png",
    meepsImage: "assets/meeps_wave.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    text: "Wait Barthy, come back!",
    next: "barthy_returns"
  },

  barthy_returns: {
    barthyImage: "assets/barthy_walking_happy.png",
    meepsImage: "assets/meeps_grin.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    text: "Ask me again.. Hehhe",
    next: "ask_valentine"
  },

  barthy_falling: {
    barthyImage: "assets/barthy_falling.png",
    meepsImage: "assets/meeps_grin.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    animation: {
      type: "fall",
      duration: 800,
      next: "barthy_fell"
    }
  },

  barthy_fell: {
    barthyImage: "assets/barthy_fall.png",
    meepsImage: "assets/meeps_shocked.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    animation: {
      type: "fall",
      duration: 800,
      next: "barthy_faint"
    }
  },

  barthy_faint: {
    barthyImage: "assets/barthy_fainted.png",
    meepsImage: "assets/meeps_shocked.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    modal: {
      text: "Is Meeps gonna help Barthy????",
      yes: "meeps_approach_barthy",
      no: "end_sad"
    }
  },

  meeps_approach_barthy: {
    barthyImage: "assets/barthy_fainted.png",
    meepsImage: "assets/meeps_walking.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    next: "kiss_repeat"
  },

  kiss_repeat: {
    sceneImage: "assets/meeps_kissing_barthy.png",
    next: "embrace"
  },

  embrace: {
    sceneImage: "assets/embrace.png",
    next: "ask_valentine_again"
  },

  ask_valentine_again: {
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps_grin.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    text: "Ask me again.. hehe",
    next: "ask_valentine"
  },

  yes_happy: {
    barthyImage: "assets/barthy_excited.png",
    meepsImage: "assets/meeps_happy.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "Yaay! I'm so excited to be spending valentines with you",
    next: "end_happy"
  },

  end_happy: {
    barthyImage: "assets/barthy_happy.png",
    meepsImage: "assets/meeps_happy.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    text: "Pottery. Candles. Dinner. Valentines together"
  },

  end_sad: {
    barthyImage: "assets/barthy_sad.png",
    meepsImage: "assets/meeps_sad.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
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
