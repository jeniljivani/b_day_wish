/* =========================================================
   BIRTHDAY LOVE EXPERIENCE
   Edit only the CONFIG object below for your person.
   ========================================================= */
const CONFIG = {
  name: "My Love",
  birthday: "", // YYYY-MM-DD — add the real birthday here
  startYear: 2026,
  enableMusic: true
};

$(function () {
  /* ---------- Personal setup data ---------- */
  let personalData = {
    name: CONFIG.name || "My Love",
    birthday: CONFIG.birthday || "",
    imageData: ""
  };

  /* ---------- Preloader ---------- */
  window.setTimeout(() => $("#preloader").addClass("hide"), 650);

  function applyPersonalData(){
    const name = personalData.name || "My Love";
    $("#herNameHeading, #finalName").text(name);
    document.title = `Happy Birthday ${name} ♡`;

    $("#personMemoryTitle").text(`For ${name}, always. ♡`);
    $("#personSweetMessage").text(
      `You are one of those rare people who make a beautiful memory simply by being there. I hope every little moment in this birthday world makes you smile. ♡`
    );

    if(personalData.imageData){
      $("#personPhoto").attr("src", personalData.imageData).closest(".person-photo-frame").removeClass("no-photo");
      const clock = document.getElementById("analogClock");
      if(clock){
        clock.style.setProperty("--clock-photo", `url("${personalData.imageData}")`);
        clock.classList.add("has-person-photo");
      }
    }else{
      $("#personPhoto").removeAttr("src").closest(".person-photo-frame").addClass("no-photo");
      const clock = document.getElementById("analogClock");
      if(clock){
        clock.style.removeProperty("--clock-photo");
        clock.classList.remove("has-person-photo");
      }
    }
  }
  applyPersonalData();

  /* ---------- Personal setup + Velvet Curtain Reveal ---------- */
  const setupExperience = document.getElementById("setupExperience");
  const setupIntro = document.getElementById("setupIntro");
  const setupFormScreen = document.getElementById("setupForm");
  const curtainReveal = document.getElementById("curtainReveal");
  const setupLoader = document.getElementById("setupLoader");
  const setupForm = document.getElementById("personalSetupForm");
  const imageInput = document.getElementById("personImage");
  const imagePreview = document.getElementById("imagePickerPreview");
  let selectedImageData = "";

  document.body.classList.add("setup-locked");

  $("#startCreating").on("click", function(){
    $(this).prop("disabled", true);
    setupLoader.classList.add("is-visible");
    window.setTimeout(() => {
      setupIntro.classList.remove("is-active");
      setupFormScreen.classList.add("is-active");
      setupLoader.classList.remove("is-visible");
      $(this).prop("disabled", false);
    }, 1050);
  });

  $("#personName").on("input", function(){
    this.value = this.value.replace(/\s{2,}/g," ").replace(/^\s+/,"");
    $("#nameError").text("");
  });

  $("#personBirthday").attr("max", new Date().toISOString().slice(0,10)).on("change", function(){
    $("#dateError").text("");
  });

  imageInput?.addEventListener("change", function(){
    const file = this.files && this.files[0];
    $("#imageError").text("");
    if(!file) return;

    if(file.size > 8 * 1024 * 1024){
      this.value = "";
      selectedImageData = "";
      $("#imageError").text("Please choose an image smaller than 8 MB.");
      return;
    }

    if(!/^image\/(jpeg|png|webp|gif)$/.test(file.type)){
      this.value = "";
      selectedImageData = "";
      $("#imageError").text("Please choose a JPG, PNG, WEBP or GIF image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      selectedImageData = String(e.target.result || "");
      imagePreview.innerHTML = `<img src="${selectedImageData}" alt="Selected birthday photo"><strong>Picture selected ♡</strong><small>Click to choose another</small>`;
      $(".image-picker").addClass("has-image");
    };
    reader.readAsDataURL(file);
  });

  setupForm?.addEventListener("submit", function(event){
    event.preventDefault();

    const name = String($("#personName").val() || "").trim();
    const birthday = String($("#personBirthday").val() || "");
    let valid = true;

    $("#nameError,#imageError,#dateError").text("");

    if(name.length < 2){
      $("#nameError").text("Please enter her name.");
      valid = false;
    }
    if(!selectedImageData){
      $("#imageError").text("Please choose a picture.");
      valid = false;
    }
    if(!birthday){
      $("#dateError").text("Please choose her birthday.");
      valid = false;
    }

    if(!valid) return;

    personalData = {name,birthday,imageData:selectedImageData};
    applyPersonalData();
    updateLiveAge();

    setupFormScreen.classList.remove("is-active");
    curtainReveal.classList.add("is-active");
    curtainReveal.setAttribute("aria-hidden","false");

    window.setTimeout(() => {
      curtainReveal.classList.add("open");
    }, 260);

    window.setTimeout(() => {
      setupExperience.classList.add("is-finished");
      document.body.classList.remove("setup-locked");
      window.scrollTo({top:0,behavior:"instant"});
      $("#preloader").removeClass("hide");
      window.setTimeout(() => $("#preloader").addClass("hide"), 420);
    }, 2250);

    window.setTimeout(() => {
      setupExperience.style.display = "none";
    }, 2850);
  });

  /* ---------- Live age: calendar-accurate years / months / days ---------- */
  function daysInMonth(year, monthIndex){
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function normalizeDateOnly(date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  function addYearsClamped(date, years){
    const year = date.getFullYear() + years;
    const month = date.getMonth();
    const day = Math.min(date.getDate(), daysInMonth(year, month));
    return new Date(year, month, day, 0, 0, 0, 0);
  }

  function addMonthsClamped(date, months){
    const total = date.getFullYear() * 12 + date.getMonth() + months;
    const year = Math.floor(total / 12);
    const month = ((total % 12) + 12) % 12;
    const day = Math.min(date.getDate(), daysInMonth(year, month));
    return new Date(year, month, day, 0, 0, 0, 0);
  }

  function calendarAge(birthDate, now){
    const birth = normalizeDateOnly(birthDate);
    const today = normalizeDateOnly(now);

    if(birth > today){
      return {years:0, months:0, days:0, hours:0, minutes:0, seconds:0};
    }

    // First resolve complete calendar years.
    let years = today.getFullYear() - birth.getFullYear();
    let yearAnchor = addYearsClamped(birth, years);
    if(yearAnchor > today){
      years -= 1;
      yearAnchor = addYearsClamped(birth, years);
    }

    // Then resolve complete calendar months inside the remaining year.
    let months = (today.getFullYear() - yearAnchor.getFullYear()) * 12 +
                 (today.getMonth() - yearAnchor.getMonth());
    if(months < 0) months = 0;

    let monthAnchor = addMonthsClamped(yearAnchor, months);
    if(monthAnchor > today){
      months -= 1;
      monthAnchor = addMonthsClamped(yearAnchor, months);
    }

    // Remaining whole calendar days can never exceed the current month's length.
    const days = Math.floor((today.getTime() - monthAnchor.getTime()) / 86400000);

    // Time is deliberately separate from Y/M/D. Birthday input has no time, so midnight is used.
    const elapsedToday = Math.max(0, now.getTime() - today.getTime());
    const hours = Math.floor(elapsedToday / 3600000);
    const minutes = Math.floor((elapsedToday % 3600000) / 60000);
    const seconds = Math.floor((elapsedToday % 60000) / 1000);

    return {years, months, days, hours, minutes, seconds};
  }

  function updateLiveAge(){
    const value = personalData.birthday || CONFIG.birthday;
    if(!value){
      $("#liveAgeYears,#liveAgeMonths,#liveAgeDays").text("0");
      $("#liveAgeHours,#liveAgeMinutes,#liveAgeSeconds").text("00");
      return;
    }

    const parts = String(value).split("-").map(Number);
    if(parts.length !== 3 || parts.some(Number.isNaN)) return;

    const birth = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    const now = new Date();

    // Reject invalid dates (e.g. 2025-02-31) instead of allowing JS to roll them into another month.
    if(birth.getFullYear() !== parts[0] || birth.getMonth() !== parts[1] - 1 || birth.getDate() !== parts[2] || birth > now){
      return;
    }

    const age = calendarAge(birth, now);
    $("#liveAgeYears").text(age.years);
    $("#liveAgeMonths").text(age.months);
    $("#liveAgeDays").text(age.days);
    $("#liveAgeHours").text(String(age.hours).padStart(2,"0"));
    $("#liveAgeMinutes").text(String(age.minutes).padStart(2,"0"));
    $("#liveAgeSeconds").text(String(age.seconds).padStart(2,"0"));
  }

  updateLiveAge();
  setInterval(updateLiveAge,1000);

  /* Touch fallback for the age hover card */
  $(".live-age-card").on("click",function(){
    if(window.matchMedia("(hover: none)").matches){
      $(this).toggleClass("age-touch-open");
    }
  });
  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $(entry.target).addClass("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $(".reveal").each(function(){ revealObserver.observe(this); });

  /* ---------- Type only the initial cake message when the section enters view ---------- */
  const messageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.typed !== "true") {
          el.dataset.typed = "true";
          const text = el.dataset.typingText || el.textContent.trim() || "Make a wish first... then blow the candles. ✨";
          el.dataset.typingText = text;
          typeElement(el, text, Number(el.dataset.typingSpeed) || 28);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll("[data-type-on-view=\"true\"]").forEach(el => messageObserver.observe(el));

  /* ---------- Smooth navigation ---------- */
  $(".scroll-to").on("click", function(){
    const target = $(this).data("target");
    if ($(target).length) $("html, body").animate({scrollTop: $(target).offset().top - 20}, 800);
  });

  /* ---------- Gift opening ---------- */
  $("#giftBox").on("click", function(){
    $("#giftWrap").addClass("opened");
    $(this).css({transform:"translateY(-16px) scale(.92)"});
    $(".gift-lid").css({transform:"translateY(-45px) rotate(-8deg)", transition:"transform .7s"});
    $(".gift-spark").css("animation-duration", ".6s");
    setTimeout(() => {
      $("#heroOpenMessage").addClass("show");
      burstConfetti(window.innerWidth/2, window.innerHeight*.46, 70);
    }, 500);
  });

  /* ---------- Live clock ---------- */
  function updateClock(){
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    $(".hour-hand").css("transform", `translateX(-50%) rotate(${hours * 30}deg)`);
    $(".minute-hand").css("transform", `translateX(-50%) rotate(${minutes * 6}deg)`);
    $(".second-hand").css("transform", `translateX(-50%) rotate(${seconds * 6}deg)`);
    const date = now.toLocaleDateString([], {weekday:"long", year:"numeric", month:"long", day:"numeric"});
    $("#liveDate").text(date);
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ---------- Existing age card — now uses the entered birthday ---------- */
  function updateAge(){
    const value = personalData.birthday || CONFIG.birthday;
    const birth = value ? new Date(value + "T00:00:00") : null;
    const now = new Date();
    if (!birth || Number.isNaN(birth.getTime()) || birth > now) {
      $("#ageYears").text("♡");
      $("#ageDetail").text("Your next beautiful chapter is waiting ♡");
      return;
    }
    const age = calendarAge(birth, now);
    $("#ageYears").text(age.years);
    $("#ageDetail").text(`${age.months} months • ${age.days} days into this beautiful chapter`);
  }
  updateAge();
  setInterval(updateAge,1000);

  /* ---------- Count-up stats ---------- */
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = $(entry.target);
      const target = el.data("count");
      if (target === "∞") {
        el.text("∞");
        countObserver.unobserve(entry.target);
        return;
      }
      $({n:0}).animate({n:Number(target)}, {
        duration:1100,
        step:function(){ el.text(Math.floor(this.n)); },
        complete:function(){ el.text(target); }
      });
      countObserver.unobserve(entry.target);
    });
  }, {threshold:.5});
  $("[data-count]").each(function(){countObserver.observe(this);});

  /* ---------- Cake ---------- */
  let candlesOut = 0;
  $(".candle").on("click", function(){
    if ($(this).hasClass("off")) return;
    $(this).addClass("off");
    candlesOut++;
    if (candlesOut === $(".candle").length) {
      typeText("#cakeMessage", "Wish made. ♡ May this year be your softest, happiest chapter yet.", 28);
      $("#relightCake").removeClass("d-none");
      burstConfetti(window.innerWidth/2, window.innerHeight*.62, 110);
    } else {
      typeText("#cakeMessage", `${$(".candle").length - candlesOut} candle${$(".candle").length-candlesOut===1?"":"s"} left... keep going ✨`, 28);
    }
  });
  $("#relightCake").on("click", function(){
    $(".candle").removeClass("off");
    candlesOut = 0;
    typeText("#cakeMessage", "Make a wish first... then blow the candles. ✨", 28);
    $(this).addClass("d-none");
  });

  /* ---------- Surprise messages ---------- */
  const modalEl = document.getElementById("messageModal");
  const modal = new bootstrap.Modal(modalEl);
  $(".message-tile").on("click", function(){
    const message = String($(this).data("message") || "");
    modal.show();
    typeText("#modalMessage", message, 34);
  });

  /* ---------- Teddy image puzzle: drag ANY piece onto ANY piece ---------- */
  const puzzle = {
    size: 3,
    tiles: [0,1,2,3,4,5,6,7,8],
    solved: [0,1,2,3,4,5,6,7,8],
    moves: 0,
    complete: false
  };

  let puzzleDrag = {active:false, source:null, pointerId:null};

  function tileBackground(tileNumber){
    const row = Math.floor(tileNumber / 3);
    const col = tileNumber % 3;
    return `background-position:${col * 50}% ${row * 50}%;`;
  }

  function shuffledPuzzle(){
    let arr;
    do{
      arr = [...puzzle.solved].sort(() => Math.random() - 0.5);
    }while(arr.every((v,i) => v === puzzle.solved[i]));
    return arr;
  }

  function placedCount(){
    return puzzle.tiles.reduce((sum,tile,i) => sum + (tile === puzzle.solved[i] ? 1 : 0),0);
  }

  function renderPuzzle(){
    const board = document.getElementById("slidingPuzzle");
    if(!board) return;
    board.innerHTML = "";

    puzzle.tiles.forEach((tile,index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "puzzle-tile";
      button.dataset.index = String(index);
      button.style.cssText = tileBackground(tile);
      button.setAttribute("aria-label",`Teddy puzzle piece ${tile + 1}, position ${index + 1}`);
      button.draggable = false;

      button.addEventListener("click",() => {
        // Keyboard/tap fallback: select two pieces by tapping them.
        handlePuzzleTap(index);
      });
      button.addEventListener("pointerdown",event => startPuzzleDrag(event,index));
      button.addEventListener("pointerenter",event => hoverPuzzleTarget(event,index));
      button.addEventListener("pointerup",event => finishPuzzleDrag(event,index));
      button.addEventListener("pointercancel",cancelPuzzleDrag);

      board.appendChild(button);
    });

    const placed = placedCount();
    $("#puzzleMoves,#puzzleMovesSide").text(puzzle.moves);
    $("#puzzlePieceCount").text(placed);
    $("#puzzleStatus").text(`${placed} / 9 pieces`);

    if(puzzle.complete) $("#puzzleBoard").addClass("puzzle-complete");
  }

  let selectedPuzzleIndex = null;

  function handlePuzzleTap(index){
    if(puzzle.complete) return;
    if(selectedPuzzleIndex === null){
      selectedPuzzleIndex = index;
      $(`.puzzle-tile[data-index="${index}"]`).addClass("dragging");
      $("#puzzleHint").text("Now tap the piece you want to swap with. ♡");
      return;
    }
    if(selectedPuzzleIndex === index){
      selectedPuzzleIndex = null;
      $(".puzzle-tile").removeClass("dragging");
      $("#puzzleHint").text("Drag any piece onto any other piece to swap them. ♡");
      return;
    }
    swapPuzzlePieces(selectedPuzzleIndex,index);
    selectedPuzzleIndex = null;
    $(".puzzle-tile").removeClass("dragging");
  }

  function startPuzzleDrag(event,index){
    if(puzzle.complete) return;
    puzzleDrag = {active:true,source:index,pointerId:event.pointerId};
    event.currentTarget.classList.add("dragging");
    event.currentTarget.setPointerCapture?.(event.pointerId);
    document.getElementById("slidingPuzzle")?.classList.add("dragging-board");
    event.preventDefault();
  }

  function hoverPuzzleTarget(event,index){
    if(!puzzleDrag.active || index === puzzleDrag.source) return;
    $(".puzzle-tile").removeClass("drop-target");
    event.currentTarget.classList.add("drop-target");
  }

  function finishPuzzleDrag(event,index){
    if(!puzzleDrag.active) return;
    const source = puzzleDrag.source;
    $(".puzzle-tile").removeClass("drop-target dragging");
    document.getElementById("slidingPuzzle")?.classList.remove("dragging-board");

    if(source !== null && source !== index){
      swapPuzzlePieces(source,index);
    }else{
      $("#puzzleHint").text("Pick any piece and drop it on another piece to swap them. ♡");
    }
    puzzleDrag = {active:false,source:null,pointerId:null};
  }

  function cancelPuzzleDrag(){
    $(".puzzle-tile").removeClass("drop-target dragging");
    document.getElementById("slidingPuzzle")?.classList.remove("dragging-board");
    puzzleDrag = {active:false,source:null,pointerId:null};
  }

  function swapPuzzlePieces(a,b){
    if(a === b || puzzle.complete) return;
    [puzzle.tiles[a],puzzle.tiles[b]] = [puzzle.tiles[b],puzzle.tiles[a]];
    puzzle.moves++;
    renderPuzzle();

    if(puzzle.tiles.every((tile,i) => tile === puzzle.solved[i])){
      puzzle.complete = true;
      $("#puzzleHint").text("Perfect. Every little piece found its place. ♡");
      typeText("#puzzleResult","You did it. And somehow, every little piece still reminds me of you. ♡",28);
      burstConfetti(window.innerWidth/2,window.innerHeight*.55,70);
      renderPuzzle();
    }else{
      $("#puzzleHint").text("Beautiful swap. Keep putting the teddy together. ♡");
    }
  }

  function resetPuzzle(){
    puzzle.tiles = [...puzzle.solved];
    puzzle.moves = 0;
    puzzle.complete = false;
    selectedPuzzleIndex = null;
    $("#puzzleBoard").removeClass("puzzle-complete");
    $("#puzzleResult").empty().removeClass("typing-active");
    $("#puzzleHint").text("Drag any piece onto any other piece to swap them. ♡");
    renderPuzzle();
  }

  function shufflePuzzle(){
    puzzle.tiles = shuffledPuzzle();
    puzzle.moves = 0;
    puzzle.complete = false;
    selectedPuzzleIndex = null;
    $("#puzzleBoard").removeClass("puzzle-complete");
    $("#puzzleResult").empty().removeClass("typing-active");
    $("#puzzleHint").text("Grab any piece, drag it over another piece, and release. ♡");
    renderPuzzle();
  }

  function showPuzzleHint(){
    if(puzzle.complete){
      $("#puzzleHint").text("Already complete. You two fit perfectly. ♡");
      return;
    }
    $(".puzzle-tile").removeClass("hint-piece");
    const wrong = puzzle.tiles.findIndex((tile,index) => tile !== puzzle.solved[index]);
    if(wrong >= 0){
      $(`.puzzle-tile[data-index="${wrong}"]`).addClass("hint-piece");
      $("#puzzleHint").text("Hint: this highlighted square needs a different teddy piece.");
      setTimeout(() => $(".puzzle-tile").removeClass("hint-piece"),1600);
    }
  }

  resetPuzzle();
  shufflePuzzle();
  $("#shufflePuzzle").on("click",shufflePuzzle);
  $("#resetPuzzle").on("click",resetPuzzle);
  $("#hintPuzzle").on("click",showPuzzleHint);

  /* ---------- Scratch card ---------- */
  initScratchCard();

  /* ---------- Music ---------- */
  const music = document.getElementById("bgMusic");
  let musicAvailable = false;
  music.addEventListener("canplay", () => musicAvailable = true);
  $("#musicToggle").on("click", function(){
    if (!CONFIG.enableMusic) return showToast("Music is disabled in CONFIG.");
    if (!musicAvailable) {
      showToast("No music file is configured yet.");
      return;
    }
    if (music.paused) {
      music.play().then(() => {
        $(this).addClass("playing").html('<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 8.5a5.5 5.5 0 0 1 0 7"/><path d="M19 6a9 9 0 0 1 0 12"/></svg>');
      }).catch(() => showToast("Tap again after interacting with the page."));
    } else {
      music.pause();
      $(this).removeClass("playing").html('<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9 4 6m0-6-4 6"/></svg>');
    }
  });

  /* ---------- Background particles ---------- */
  initParticles();
});

/* =========================================================
   Romantic typewriter effect
   ========================================================= */
const typewriterTimers = new WeakMap();

function typeText(selector, text, speed = 34){
  const el = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!el) return;
  typeElement(el, text, speed);
}

function startViewTyping(el){
  if (!el || !el.matches || !el.matches("[data-type-on-view=\"true\"]")) return;
  if (el.dataset.typed === "true") return;
  const text = el.dataset.typingText || el.textContent.trim();
  if (!text) return;
  el.dataset.typingText = text;
  el.dataset.typed = "true";
  typeElement(el, text, Number(el.dataset.typingSpeed) || 28);
}

function typeElement(el, text, speed = 34){
  const previous = typewriterTimers.get(el);
  if (previous) clearInterval(previous);
  el.textContent = "";
  el.classList.add("typing-active");
  let index = 0;
  const timer = setInterval(() => {
    el.textContent += text.charAt(index++);
    if (index >= text.length) {
      clearInterval(timer);
      typewriterTimers.delete(el);
      window.setTimeout(() => el.classList.remove("typing-active"), 650);
    }
  }, Math.max(12, speed));
  typewriterTimers.set(el, timer);
}

/* =========================================================
   Scratch card
   ========================================================= */
function initScratchCard(){
  const canvas = document.getElementById("scratchCanvas");
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const ctx = canvas.getContext("2d", {willReadFrequently:true});
  let drawing = false, revealed = false;

  function resize(){
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = wrap.clientWidth * ratio;
    canvas.height = wrap.clientHeight * ratio;
    canvas.style.width = wrap.clientWidth + "px";
    canvas.style.height = wrap.clientHeight + "px";
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0,0,wrap.clientWidth,wrap.clientHeight);
    g.addColorStop(0,"#c6c2c3"); g.addColorStop(.45,"#eee9e9"); g.addColorStop(1,"#aaa5a6");
    ctx.fillStyle = g; ctx.fillRect(0,0,wrap.clientWidth,wrap.clientHeight);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.font = "700 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH TO REVEAL ♡", wrap.clientWidth/2, wrap.clientHeight/2);
    revealed = false;
  }
  resize();
  window.addEventListener("resize", resize);

  function pos(e){
    const r = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return {x:point.clientX-r.left, y:point.clientY-r.top};
  }
  function scratch(e){
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(p.x,p.y,25,0,Math.PI*2); ctx.fill();
    checkReveal();
  }
  function start(e){drawing=true;scratch(e)}
  function stop(){drawing=false}

  canvas.addEventListener("mousedown",start);
  canvas.addEventListener("mousemove",scratch);
  window.addEventListener("mouseup",stop);
  canvas.addEventListener("touchstart",start,{passive:false});
  canvas.addEventListener("touchmove",scratch,{passive:false});
  window.addEventListener("touchend",stop);

  function checkReveal(){
    if (revealed) return;
    const sample = document.createElement("canvas");
    sample.width = 60; sample.height = 35;
    const sctx = sample.getContext("2d");
    sctx.drawImage(canvas,0,0,60,35);
    const data = sctx.getImageData(0,0,60,35).data;
    let transparent=0;
    for(let i=3;i<data.length;i+=4) if(data[i]<80) transparent++;
    const pct = transparent/(data.length/4);
    if(pct > .55){
      revealed = true;
      ctx.clearRect(0,0,wrap.clientWidth,wrap.clientHeight);
      showToast("Secret unlocked. Keep that sentence close. ♡");
      burstConfetti(window.innerWidth/2, window.innerHeight*.5, 45);
    }
  }
}

/* =========================================================
   Tiny confetti without external library
   ========================================================= */
function burstConfetti(x,y,count){
  const layer = document.createElement("div");
  layer.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden";
  document.body.appendChild(layer);
  for(let i=0;i<count;i++){
    const p=document.createElement("span");
    p.textContent = Math.random()>.45 ? "♡" : "✦";
    p.style.cssText=`
      position:absolute;left:${x}px;top:${y}px;
      color:${["#d98ea2","#e8b0bd","#9c6675","#f0c8d1"][i%4]};
      font-size:${10+Math.random()*18}px;
      opacity:1;transform:translate(-50%,-50%);
      transition:transform ${900+Math.random()*900}ms cubic-bezier(.2,.8,.2,1),opacity 1200ms ease;
    `;
    layer.appendChild(p);
    const dx=(Math.random()-.5)*window.innerWidth*.75;
    const dy=(Math.random()-.8)*window.innerHeight*.75;
    requestAnimationFrame(()=>{p.style.transform=`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random()*540}deg)`;p.style.opacity="0"});
  }
  setTimeout(()=>layer.remove(),2200);
}

function showToast(text){
  $("#toastText").text(text);
  bootstrap.Toast.getOrCreateInstance(document.getElementById("loveToast"), {delay:3000}).show();
}

/* =========================================================
   Lightweight ambient particles
   ========================================================= */
function initParticles(){
  const canvas=document.getElementById("particlesCanvas");
  if(!canvas) return;
  const ctx=canvas.getContext("2d");
  let particles=[];
  function resize(){canvas.width=innerWidth;canvas.height=innerHeight;particles=Array.from({length:Math.min(55,Math.floor(innerWidth/25))},()=>({
    x:Math.random()*canvas.width,y:Math.random()*canvas.height,
    r:.5+Math.random()*1.6,v:.08+Math.random()*.25,
    drift:(Math.random()-.5)*.15,phase:Math.random()*Math.PI*2
  }));}
  resize(); addEventListener("resize",resize);
  function frame(t){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.y-=p.v; p.x+=p.drift+Math.sin(t*.0004+p.phase)*.05;
      if(p.y<-10){p.y=canvas.height+10;p.x=Math.random()*canvas.width}
      if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;
      ctx.globalAlpha=.35;ctx.fillStyle="#c98498";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
