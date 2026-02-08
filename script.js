const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

const barthyContainer = document.getElementById("barthyContainer");
const meepsContainer = document.getElementById("meepsContainer");
const dragonContainer = document.getElementById("dragonContainer");

const barthyImage = document.getElementById("barthyImage");
const meepsImage = document.getElementById("meepsImage");
const dragonImage = document.getElementById("dragonImage");
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
const endScreen = document.getElementById("endScreen");
const restartBtn = document.getElementById("restartBtn");

const bgMusic = document.getElementById("bgMusic");
const yaySound = document.getElementById("yaySound");
const lonelyAudio = document.getElementById("lonelyAudio");
const slipSound = document.getElementById("slipSound");
const dragonSound = document.getElementById("dragonSound");

let currentState = null;
let animationTimeout = null;

let typewriterTimeout = null;
let typewriterSpeed = 35;
let resolveCurrentDialogue = null;

/* =====================================================
   POSITION MEMORY SYSTEM
===================================================== */

const characterMemory = {
  barthy: {
    x: -200,
    scale: "scale-large"
  },
  meeps: {
    x: -200,
    scale: "scale-small"
  },
  dragon: {
    x: 700,
    y: 500,
    scaleValue: 0.6,
    scale: "scale-extra-large"
  },
  scene: { x: 0 }
};


function applyCharacterPositions() {
  barthyContainer.style.left = characterMemory.barthy.x + "px";
  meepsContainer.style.right = characterMemory.meeps.x + "px";
  dragonContainer.style.left = characterMemory.dragon.x + "px";
  dragonContainer.style.bottom = characterMemory.dragon.y + "px";
  dragonContainer.style.transform =
    `scale(${characterMemory.dragon.scaleValue})`;
}

function applyScenePosition() {
  sceneImage.style.left = characterMemory.scene.x + "px";
  sceneImage.style.transform = "translateX(0)";
}


function setCharacterScale(img, scaleClass, characterKey) {
  img.classList.remove("scale-small", "scale-large");
  if (scaleClass) {
    img.classList.add(scaleClass);
    characterMemory[characterKey].scale = scaleClass;
  }
}

function modifyPositionOffset(state) {
  let changed = false;
  if (state.barthyOffsetX !== undefined) {
    characterMemory.barthy.x += state.barthyOffsetX;
    changed = true;
  }
  if (state.meepsOffsetX !== undefined) {
    characterMemory.meeps.x += state.meepsOffsetX;
    changed = true;
  }
  if (changed) {
    // Disable transition temporarily
    const oldBarthyTransition = barthyContainer.style.transition;
    const oldMeepsTransition = meepsContainer.style.transition;
    barthyContainer.style.transition = "none";
    meepsContainer.style.transition = "none";
    applyCharacterPositions();
    // Force reflow
    barthyContainer.offsetHeight;
    // Restore transition
    barthyContainer.style.transition = oldBarthyTransition;
    meepsContainer.style.transition = oldMeepsTransition;
  }
}

function applySceneOffset(state) {
  if (state.sceneOffsetX !== undefined) {
    characterMemory.scene.x = state.sceneOffsetX;
  }
  applyScenePosition();
}

function applyPositionMemory() {
  barthyContainer.style.left = characterMemory.barthy.x + "px";
  meepsContainer.style.right = characterMemory.meeps.x + "px";
  dragonContainer.style.left = characterMemory.dragon.x + "px";
}

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

function showDragon() {
  dragonImage.style.visibility = "visible";
  dragonImage.style.opacity = "1";
}

function hideDragon() {
  dragonImage.style.visibility = "hidden";
  dragonImage.style.opacity = "0";
}


function showScene(src, fullscreen = false) {
  sceneImage.src = src;
  if (fullscreen)
    sceneImage.classList.add("fullscreen-overlay");
  else
    sceneImage.classList.remove("fullscreen-overlay");
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
  if (imgEl.complete) showFn();
  else imgEl.onload = showFn;
}


/* =====================================================
   UI HELPERS
===================================================== */

function measureDialogueSize(text, textElement, boxElement) {

  // reset current box size
  boxElement.style.width = "auto";
  boxElement.style.height = "auto";

  // create a fresh measuring box
  const measureBox = document.createElement("div");
  measureBox.className = "dialogue-box";

  const measureText = document.createElement("p");

  // copy font styles from real element
  const computed = window.getComputedStyle(textElement);
  measureText.style.fontFamily = computed.fontFamily;
  measureText.style.fontSize = computed.fontSize;
  measureText.style.letterSpacing = computed.letterSpacing;
  measureText.style.whiteSpace = "normal";

  measureText.textContent = text;

  measureBox.appendChild(measureText);
  document.body.appendChild(measureBox);

  const rect = measureBox.getBoundingClientRect();

  document.body.removeChild(measureBox);

  // apply exact size
  boxElement.style.width = rect.width + "px";
  boxElement.style.height = rect.height + "px";
}



function hideDialogue() {

  barthyBox.classList.add("hidden");
  meepsBox.classList.add("hidden");

  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = null;
  }

  if (resolveCurrentDialogue) {
    resolveCurrentDialogue();
    resolveCurrentDialogue = null;
  }

}

function showDialogue(speaker, text) {

  return new Promise(resolve => {

    resolveCurrentDialogue = resolve;

    if (!speaker || !text) {
      resolveCurrentDialogue = null;
      resolve();
      return;
    }

    const textElement =
      speaker === "barthy" ? barthyText : meepsText;

    const boxElement =
      speaker === "barthy" ? barthyBox : meepsBox;

    boxElement.classList.remove("hidden");

    if (typewriterTimeout) {
      clearTimeout(typewriterTimeout);
      typewriterTimeout = null;
    }

    measureDialogueSize(text, textElement, boxElement);

    textElement.textContent = "";

    let index = 0;

    function typeNext() {

      if (index < text.length) {

        textElement.textContent += text[index];
        index++;

        typewriterTimeout =
          setTimeout(typeNext, typewriterSpeed);

      }
      else {

        resolveCurrentDialogue = null;

        setTimeout(resolve, 1000);

      }

    }

    typeNext();

  });

}



function showChoices() {
  document.getElementById("choices").style.display = "flex";
}

function hideChoices() {
  document.getElementById("choices").style.display = "none";
}


function showEndScreen() {
  endScreen.classList.remove("hidden");
}

function hideEndScreen() {
  endScreen.classList.add("hidden");
}

function resetGame() {
  characterMemory.barthy.x = -200;
  characterMemory.meeps.x = -200;
  characterMemory.dragon.x = 700;
  characterMemory.dragon.y = 500;
  characterMemory.dragon.scaleValue = 0.6;
  characterMemory.scene.x = 0;

  hideDragon();
  hideScene();
  hideDialogue();
  hideChoices();
  hideEndScreen();
  applyCharacterPositions();
  resumeBackgroundMusic();
  goToState("intro");
}

/* =====================================================
   MODAL SYSTEM
===================================================== */

function showModalPrompt({ text, yes, no }) {
  modalText.textContent = text;
  modal.classList.remove("hidden");
  modalYes.onclick = () => {
    modal.classList.add("hidden");
    if (yes === "meeps_approach_barthy") {
      stopLonelyMusic();
    }
    goToState(yes);
  };
  modalNo.onclick = () => {
    modal.classList.add("hidden");
    if (no === "meeps_calls_back") {
      stopLonelyMusic();
    }
    if (no === "end_sad") {
      stopLonelyMusic();
    }
    goToState(no);
  };
}


/* =====================================================
   ANIMATION SYSTEM
===================================================== */

function playAnimation(animation, stateNext) {

  if (!animation) return;

  const animations = Array.isArray(animation)
    ? animation
    : [animation];

  let finishedCount = 0;

  animations.forEach(anim => {

    const { character, direction, distance, duration, deltaY } = anim;

    const container =
      character === "barthy"
        ? barthyContainer
        : character === "meeps"
        ? meepsContainer
        : dragonContainer;

    const memory = characterMemory[character];

    const property =
      character === "barthy"
        ? "left"
        : character === "meeps"
        ? "right"
        : "left";

    const multiplier = direction === "left" ? -1 : 1;

    const endX = memory.x + (distance * multiplier);

    const img =
      character === "barthy"
        ? barthyImage
        : character === "meeps"
        ? meepsImage
        : dragonImage;

    // START wiggle
    img.classList.add("walk-wiggle");


    // ONLY dragon uses Y animation
    if (character === "dragon") {

      const endY = memory.y + (deltaY || 0);

      const startScale = memory.scaleValue ?? 0.6;
      const endScale = anim.scaleTo ?? startScale;

      container.style.transition = `
        ${property} ${duration}ms ease,
        bottom ${duration}ms ease,
        transform ${duration}ms ease
      `;

      container.style[property] = endX + "px";
      container.style.bottom = endY + "px";
      container.style.transform = `scale(${endScale})`;

      setTimeout(() => {

        memory.x = endX;
        memory.y = endY;
        memory.scaleValue = endScale;

        container.style.transition = "";

        finishedCount++;

        if (finishedCount === animations.length && stateNext) {
          goToState(stateNext);
        }

      }, duration);

    }

    // Barthy and Meeps use original animation
    else {

      container.style.transition = `${property} ${duration}ms linear`;
      container.style[property] = endX + "px";

      setTimeout(() => {

        memory.x = endX;
        container.style.transition = "";
        img.classList.remove("walk-wiggle");

        finishedCount++;

        if (finishedCount === animations.length && stateNext) {
          goToState(stateNext);
        }

      }, duration);

    }

  });

}
function createFallingHeart() {
  const heart = document.createElement("div");
  heart.classList.add("heart");
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.top = "-40px";
  heart.style.animationDuration =
    (Math.random() * 2 + 3) + "s";
  heart.style.opacity = Math.random();
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 5000);
}

function fireLoveExplosion() {
  const duration = 5000;
  const intervalTime = 80;
  const total = duration / intervalTime;
  let count = 0;
  const interval = setInterval(() => {
    /* Use default confetti */
    confetti({
      particleCount: 5,
      spread: 120,
      colors: ["#ff4d88", "#ff99cc", "#ffd700", "#ffffff"],
      origin: {
        x: Math.random(),
        y: Math.random() * 0.6
      }
    });
    createFallingHeart();
    count++;
    if (count >= total) {
      clearInterval(interval);
    }
  }, intervalTime);
}

/* =====================================================
   STATE ENGINE
===================================================== */

function goToState(stateKey) {

  const state = states[stateKey];
  currentState = stateKey;

  if (animationTimeout) clearTimeout(animationTimeout);

  hideScene();
  hideDialogue();
  hideChoices();
  hideEndScreen();

  /* ---------- SCENE MODE ---------- */

  if (state.sceneImage) {

    hideBarthy();
    hideMeeps();

    showScene(state.sceneImage, state.fullscreen === true);

    applySceneOffset(state);
    modifyPositionOffset(state);
    applyPositionMemory();
  }

  /* ---------- CHARACTER MODE ---------- */

  else {

    hideScene();

    /* Barthy */

    if (state.barthyImage) {

      setImageSafely(barthyImage, state.barthyImage, showBarthy);

      setCharacterScale(
        barthyImage,
        state.barthyScale || characterMemory.barthy.scale,
        "barthy"
      );

    } else hideBarthy();

    /* Meeps */

    if (state.meepsImage) {

      setImageSafely(meepsImage, state.meepsImage, showMeeps);

      setCharacterScale(
        meepsImage,
        state.meepsScale || characterMemory.meeps.scale,
        "meeps"
      );

    } else hideMeeps();

    /* Dragon */

    if (state.dragonImage) {

      setImageSafely(dragonImage, state.dragonImage, showDragon);

      applyCharacterPositions();

    } else hideDragon();

    /* Apply remembered positions */
    modifyPositionOffset(state);
    applyPositionMemory();

  }

  /* ---------- DIALOGUE ---------- */

  if (state.effect === "endScreen") {
    showEndScreen();
    return;
  }

  let dialoguePromise = Promise.resolve();

  if (state.text) {
    dialoguePromise = showDialogue(state.speaker, state.text);
  }

  /* ---------- EFFECTS ---------- */

  if (state.effect === "loveExplosion") {
    fireLoveExplosion();
  }

  if (stateKey === "barthy_falling") {
    slipSound.currentTime = 0;
    slipSound.play();
  }

  if (stateKey === "dragon_enters") {
    dragonSound.currentTime = 0;
    dragonSound.volume = 0.7;
    dragonSound.play().catch(() => {});
  }

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
    playAnimation(state.animation, state.next);
    return;
  }

  /* ---------- AUTO NEXT ---------- */

  if (state.next) {

    dialoguePromise.then(() => {

      const waitTime =
        state.delay !== undefined
          ? state.delay
          : (state.text ? 0 : 2000);

      animationTimeout = setTimeout(() => {

        goToState(state.next);

      }, waitTime);

    });

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
    // meepsOffsetX: 20,
    speaker: "meeps",
    text: "Hi Barthy!",
    next: "barthy_meeps_walking"
  },

  barthy_meeps_walking: {
    barthyImage: "assets/barthy_walking.png",
    meepsImage: "assets/meeps_walking.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    animation: [
      {
        character: "barthy",
        direction: "right",
        distance: 260,
        duration: 1200
      },
      {
        character: "meeps",
        direction: "right",
        distance: 260,
        duration: 1200,
      }
    ],
    next: "hug"
  },

  hug: {
    sceneImage: "assets/hug.png",
    delay: 1000,
    sceneOffsetX: 60,
    barthyOffsetX: -60,
    meepsOffsetX: -60,
    delay: 2000,
    next: "barthy_vals_1"
  },

  barthy_vals_1: {
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "Soo its vals day soon",
    next: "barthy_vals_2"
  },

  barthy_vals_2: {
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "And I don’t have a valentines yet",
    next: "barthy_vals_3"
  },

  barthy_vals_3: {
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "I want to spend valentines day with you",
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
    animation: {
      character: "barthy",
      direction: "left",
      distance: 200,
      duration: 1000,
      
    },
    next: "walk_away_modal"
  },

  walk_away_modal: {
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
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps_wave.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    text: "Wait Barthy, come back!",
    next: "meeps_calls_back_walk"
  },

  meeps_calls_back_walk: {
    barthyImage: "assets/barthy_walking_happy.png",
    meepsImage: "assets/meeps_wave.png",
    animation: {
      character: "barthy",
      direction: "right",
      distance: 200,
      duration: 1000,
    },
    next: "barthy_returns"
  },

  barthy_returns: {
    barthyImage: "assets/barthy_walking_happy.png",
    meepsImage: "assets/meeps_grin.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    delay: 2000,
    text: "Ask me again.. Hehhe",
    next: "ask_valentine"
  },

  barthy_falling: {
    barthyImage: "assets/barthy_falling.png",
    meepsImage: "assets/meeps_grin.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    barthyOffsetX: -80,
    next: "barthy_fell"
  },

  barthy_fell: {
    barthyImage: "assets/barthy_fall.png",
    meepsImage: "assets/meeps_shocked.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    next: "barthy_faint"
  },

  barthy_faint: {
    barthyImage: "assets/barthy_fainted.png",
    meepsImage: "assets/meeps_shocked.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    modal: {
      text: "Is Meeps gonna help Barthy????",
      yes: "meeps_approach_barthy",
      no: "dragon_enters"
    }
  },

  meeps_approach_barthy: {
    barthyImage: "assets/barthy_fainted.png",
    meepsImage: "assets/meeps_walking.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    animation: {
      character: "meeps",
      direction: "right",
      distance: 320,
      duration: 1200,
    },
    delay: 5000,
    next: "kiss_repeat"
  },

  kiss_repeat: {
    sceneImage: "assets/meeps_kissing_barthy.png",
    sceneOffsetX: -150,
    next: "embrace"
  },

  embrace: {
    sceneImage: "assets/embrace.png",
    sceneOffsetX: -150,
    next: "meeps_relief_line"
  },

  meeps_relief_line: {
    barthyImage: "assets/barthy_sad.png",
    meepsImage: "assets/meeps_grin.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    barthyOffsetX: 220,
    meepsOffsetX: -300,
    speaker: "meeps",
    text: "I'm glad you're okay Barthy. I was just joking",
    next: "ask_valentine_again"
  },


  ask_valentine_again: {
    barthyImage: "assets/barthy.png",
    meepsImage: "assets/meeps_grin.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    delay: 1000,
    text: "Ask me again.. hehe",
    next: "ask_valentine"
  },

  yes_happy: {
    barthyImage: "assets/barthy_jumping.png",
    meepsImage: "assets/meeps.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "YAAYY!! I'm so excited to be spending Valentines with you",
    effect: "loveExplosion",
    next: "end_happy"
  },

  end_happy: {
    barthyImage: "assets/barthy_happy.png",
    meepsImage: "assets/meeps.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "We'll be making our own potteries and candles, and enjoy some delicious food for dinner! It'll be really funnn!!",
    next: "end_2"
  },

  end_2: {
    barthyImage: "assets/barthy_happy.png",
    meepsImage: "assets/meeps_excited.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    text: "Woohoo! That sounds really fun.. I can't wait!",
    next: "love_line_1"
  },

  love_line_1: {
    barthyImage: "assets/barthy_happy.png",
    meepsImage: "assets/meeps_excited.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "I love you sooo much",
    next: "love_line_2"
  },

  love_line_2: {
    barthyImage: "assets/barthy_happy.png",
    meepsImage: "assets/meeps_excited.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "meeps",
    text: "Togetha forevaaa <3",
    next: "end_3"
  },

  end_3: {
    sceneImage: "assets/kiss.png",
    sceneOffsetX: 20,
    next: "end_screen_happy"
  },

  dragon_enters: {
    dragonImage: "assets/dragon_fire.png",
    animation: {
      character: "dragon",
      direction: "left",
      distance: 1400,
      deltaY: -1500,
      scaleTo: 2.0,
      duration: 6000
    },
    next: "dragon_fire_overlay"
  },

  dragon_fire_overlay: {
    sceneImage: "assets/elmo.gif",
    sceneOffsetX: 0,
    fullscreen: true,
    delay: 4000,
    next: "end_screen_sad"
  },

  end_sad: {
    barthyImage: "assets/barthy_sad.png",
    meepsImage: "assets/meeps_sad.png",
    barthyScale: "scale-large",
    meepsScale: "scale-small",
    speaker: "barthy",
    text: "Oh well… maybe next year",
    next: "dragon_enters",
    delay: 2000
  },

  end_screen_happy: {
    effect: "endScreen"
  },

  end_screen_sad: {
    effect: "endScreen"
  },
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

yesBtn.onclick = () => {

  // stopLonelyAudio();

  // rewind so it can replay instantly if clicked again
  yaySound.currentTime = 0;

  yaySound.play();

  goToState("yes_happy");
};

noBtn.onclick = () => {
  // pauseBackgroundMusic();
  playLonelyMusic();
  goToState("no_cry");

}
restartBtn.onclick = resetGame;

/* =====================================================
   START GAME
===================================================== */

startBtn.onclick = () => {

  // hide start screen
  startScreen.classList.add("hidden");

  // start music
  bgMusic.volume = 0.5;
  bgMusic.play();

  // start game
  goToState("intro");
};

// goToState("intro");
// playBackgroundMusic();

/* =====================================================
   MUSIC
===================================================== */

let bgMusicWasPlaying = false;

function playBackgroundMusic() {
  bgMusic.volume = 0.5;
  bgMusic.play().catch(() => {});
}

function resumeBackgroundMusic() {
  if (bgMusicWasPlaying) {
    bgMusic.play().catch(() => {});
  }
}

function pauseBackgroundMusic() {
  if (!bgMusic.paused) {
    bgMusicWasPlaying = true;
    bgMusic.pause();
  }
}

function playLonelyMusic() {
  pauseBackgroundMusic();
  lonelyAudio.currentTime = 0;
  lonelyAudio.volume = 0.6;
  lonelyAudio.play().catch(() => {});
}

function stopLonelyMusic() {
  lonelyAudio.pause();
  lonelyAudio.currentTime = 0;
  resumeBackgroundMusic();
}


