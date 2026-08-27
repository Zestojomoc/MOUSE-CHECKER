import './style.css'
const tests = [
  ['left', 'Left click', 'Primary button'], ['right', 'Right click', 'Secondary button'],
  ['middle', 'Middle click', 'Scroll wheel'], ['back', 'Back button', 'Side button'],
  ['forward', 'Forward button', 'Side button'], ['scroll-up', 'Scroll up', 'Wheel movement'],
  ['scroll-down', 'Scroll down', 'Wheel movement'], ['movement', 'Movement', 'Pointer tracking'],
  ['hold', 'Click & hold', 'Button pressure'], ['double', 'Double click', 'Two quick clicks'],
]

document.querySelector('#app').innerHTML = `
  <header class="site-header"><a class="brand" href="/" aria-label="Mouse Checker home"><span class="brand-mark">M</span> Mouse Checker</a><div class="header-note"><span class="live-dot"></span> Browser input utility</div></header>
  <main>
    <section class="intro"><div><p class="eyebrow">INPUT DIAGNOSTICS / 01</p><h1>Every click,<br><em>accounted for.</em></h1></div><div class="intro-copy"><p>Test your mouse buttons, wheel, and movement in real time. A quiet little check for the hardware you use every day.</p><span class="scroll-cue">Move your mouse anywhere in the test area <span aria-hidden="true">↘</span></span></div></section>
    <section class="workbench" aria-label="Mouse test area">
      <div class="tester-panel"><div class="panel-top"><span>LIVE TEST AREA</span><span class="panel-coordinate" id="coordinates">000 / 000</span></div>
        <div class="test-stage" id="test-stage" tabindex="0" aria-label="Interactive mouse testing area"><div class="stage-grid" aria-hidden="true"></div><div class="movement-pulse" id="movement-pulse"></div><div class="mouse-illustration" aria-hidden="true"><div class="mouse-shell"><div class="mouse-left" data-button="left"></div><div class="mouse-right" data-button="right"></div><div class="mouse-divider"></div><div class="mouse-wheel" data-button="middle"><span></span></div><div class="mouse-side side-back" data-button="back"></div><div class="mouse-side side-forward" data-button="forward"></div><div class="scroll-arrows"><span data-scroll-arrow="up">↑</span><span data-scroll-arrow="down">↓</span></div></div></div><div class="stage-hint" id="stage-hint"><span class="hint-key">⌁</span><span>Interact with your mouse</span></div><div class="event-toast" id="event-toast" aria-live="polite">Awaiting input</div></div>
        <div class="panel-bottom"><span>RIGHT CLICK ENABLED</span><span id="hold-status">Ready to hold</span></div></div>
      <aside class="status-panel" aria-labelledby="status-title"><div class="status-heading"><div><p class="eyebrow">YOUR SESSION</p><h2 id="status-title">Test status</h2></div><button class="reset-button" id="reset" type="button"><span aria-hidden="true">↺</span> Reset</button></div><div class="progress-wrap"><div class="progress-label"><span id="progress-count">0 inputs detected</span><span id="progress-percent">0%</span></div><div class="progress-track"><div id="progress-bar"></div></div></div><div class="status-list" id="status-list">${tests.map(([id, label, detail]) => `<div class="status-row" data-status="${id}"><div class="status-icon" aria-hidden="true">${id === 'movement' ? '✦' : id === 'double' ? '2×' : id === 'hold' ? '◷' : '·'}</div><div class="status-name"><strong>${label}</strong><small>${detail}</small></div><span class="status-badge">Waiting</span></div>`).join('')}</div><p class="status-footnote"><span class="green-dot"></span> Working states persist until reset</p></aside>
    </section>
    <section class="info-strip"><div><span class="strip-number">01</span><strong>What gets checked</strong><p>Browser-detectable inputs only: buttons, scrolling, movement, holding, and double clicks.</p></div><div><span class="strip-number">02</span><strong>Good to know</strong><p>Side buttons are optional. Their absence is never treated as a failure.</p></div><div><span class="strip-number">03</span><strong>Hardware note</strong><p>This reports browser input, not internal hardware health or sensor performance.</p></div></section>
  </main><footer><span>Mouse Checker <span class="muted">/ a focused browser utility</span></span><span>NO DATA COLLECTED</span></footer>
`

const stage = document.querySelector('#test-stage')
const rows = Object.fromEntries(tests.map(([id]) => [id, document.querySelector(`[data-status="${id}"]`)]))
const activeButtons = new Set()
let detected = new Set()
let lastClick = 0
let scrollArrowTimer

function markWorking(id) {
  if (detected.has(id)) return
  detected.add(id)
  rows[id].dataset.state = 'working'
  rows[id].querySelector('.status-badge').textContent = 'Working'
  updateProgress()
}
function updateProgress() {
  document.querySelector('#progress-count').textContent = `${detected.size} input${detected.size === 1 ? '' : 's'} detected`
  document.querySelector('#progress-percent').textContent = `${Math.round((detected.size / tests.length) * 100)}%`
  document.querySelector('#progress-bar').style.width = `${(detected.size / tests.length) * 100}%`
}
function showEvent(message) { document.querySelector('#event-toast').textContent = message; document.querySelector('#stage-hint').classList.add('is-hidden') }
function setButton(button, pressed) {
  const element = document.querySelector(`[data-button="${button}"]`)
  if (element) element.classList.toggle('is-pressed', pressed)
  if (pressed) activeButtons.add(button); else activeButtons.delete(button)
}

function preventSideNavigation(event) {
  if (event.button >= 3 && stage.matches(':hover')) event.preventDefault()
}

['pointerdown', 'mousedown', 'mouseup', 'auxclick'].forEach((eventName) => {
  document.addEventListener(eventName, preventSideNavigation, { capture: true, passive: false })
})

stage.addEventListener('contextmenu', (event) => event.preventDefault())
stage.addEventListener('pointerdown', (event) => {
  event.preventDefault()
  const button = ['left', 'middle', 'right', 'forward', 'back'][event.button]
  if (!button) return
  markWorking(button); markWorking('hold'); setButton(button, true)
  document.querySelector('#hold-status').textContent = `${button} button held`; showEvent(`${button} button pressed`)
})
stage.addEventListener('pointerup', (event) => {
  const button = ['left', 'middle', 'right', 'forward', 'back'][event.button]
  if (!button) return
  setButton(button, false); document.querySelector('#hold-status').textContent = 'Ready to hold'; showEvent(`${button} button released`)
})
stage.addEventListener('pointerleave', () => { activeButtons.forEach((button) => setButton(button, false)); document.querySelector('#hold-status').textContent = 'Ready to hold' })
stage.addEventListener('dblclick', (event) => { event.preventDefault(); markWorking('double'); showEvent('Double click detected') })
stage.addEventListener('wheel', (event) => {
  event.preventDefault()
  const direction = event.deltaY < 0 ? 'up' : 'down'
  markWorking(`scroll-${direction}`)
  const wheel = document.querySelector('.mouse-wheel'); wheel.classList.remove('wheel-up', 'wheel-down'); void wheel.offsetWidth; wheel.classList.add(`wheel-${direction}`)
  const arrows = document.querySelectorAll('[data-scroll-arrow]')
  arrows.forEach((arrow) => arrow.classList.toggle('is-active', arrow.dataset.scrollArrow === direction))
  clearTimeout(scrollArrowTimer)
  scrollArrowTimer = setTimeout(() => arrows.forEach((arrow) => arrow.classList.remove('is-active')), 450)
  showEvent(`Scroll ${direction} detected`)
}, { passive: false })
stage.addEventListener('pointermove', (event) => {
  markWorking('movement'); const rect = stage.getBoundingClientRect()
  document.querySelector('#coordinates').textContent = `${String(Math.round(event.clientX - rect.left)).padStart(3, '0')} / ${String(Math.round(event.clientY - rect.top)).padStart(3, '0')}`
  const pulse = document.querySelector('#movement-pulse'); pulse.style.left = `${event.clientX - rect.left}px`; pulse.style.top = `${event.clientY - rect.top}px`; showEvent('Movement detected')
})
stage.addEventListener('click', () => { const now = Date.now(); if (now - lastClick < 400) markWorking('double'); lastClick = now })

document.querySelector('#reset').addEventListener('click', () => {
  detected = new Set()
  tests.forEach(([id]) => { rows[id].dataset.state = 'waiting'; rows[id].querySelector('.status-badge').textContent = 'Waiting' })
  activeButtons.forEach((button) => setButton(button, false)); document.querySelector('#stage-hint').classList.remove('is-hidden'); document.querySelector('#event-toast').textContent = 'Awaiting input'; document.querySelector('#coordinates').textContent = '000 / 000'; updateProgress()
})
