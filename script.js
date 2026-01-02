import { updateGround, setupGround } from "./ground.js"
import { updateclouds, setupclouds } from "./clouds.js"
import { updateDino, setupDino, getDinoRect, setDinoLose } from "./dino.js"
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js"

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001

const worldElem = document.querySelector("[data-world]")
const scoreElem = document.querySelector("[data-score]")
const startScreenElem = document.querySelector("[data-start-screen]")

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)

let lastTime
let speedScale
let score
let highscore = 0

// Start game on key press or touch
document.addEventListener("keydown", handleStart, { once: true })
document.addEventListener("touchstart", handleStart, { once: true, passive: false })

function update(time) {
  if (lastTime == null) {
    lastTime = time
    window.requestAnimationFrame(update)
    return
  }
  const delta = time - lastTime

  updateclouds(delta, speedScale)
  updateGround(delta, speedScale)
  updateDino(delta, speedScale)
  updateCactus(delta, speedScale)
  updateSpeedScale(delta)
  updateScore(delta)

  if (checkLose()) return handleLose()

  lastTime = time
  window.requestAnimationFrame(update)
}

function checkLose() {
  const dinoRect = getDinoRect()
  return getCactusRects().some(rect => isCollision(rect, dinoRect))
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  )
}

function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE
}

function updateScore(delta) {
  score += delta * 0.01
  scoreElem.textContent = Math.floor(score)

  if (score > highscore) highscore = Math.floor(score)
}

function handleStart(e) {
  e.preventDefault() // prevent scrolling on touch
  lastTime = null
  speedScale = 1
  score = 0
  setupclouds()
  setupGround()
  setupDino()
  setupCactus()
  startScreenElem.classList.add("hide")
  window.requestAnimationFrame(update)
}

function handleLose() {
  setDinoLose()
  setTimeout(() => {
    startScreenElem.classList.remove("hide")
    document.addEventListener("keydown", handleStart, { once: true })
    document.addEventListener("touchstart", handleStart, { once: true, passive: false })
  }, 500)
}

function setPixelToWorldScale() {
  let worldToPixelScale
  const vw = window.innerWidth
  const vh = window.innerHeight

  if (vw / vh < WORLD_WIDTH / WORLD_HEIGHT) {
    worldToPixelScale = vw / WORLD_WIDTH
  } else {
    worldToPixelScale = vh / WORLD_HEIGHT
  }

  worldToPixelScale = Math.min(worldToPixelScale, 20) // cap for mobile screens
  worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
  worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}
