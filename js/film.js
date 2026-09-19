// The hero's eight seconds. filmFrame() is pure and time-based: every frame
// asks where the film should be *now*, so a throttled or hidden tab skips
// frames instead of stretching four seconds into a minute.
export const FILM = { count: 4000, hold: 2000, morph: 1100 }

export function filmFrame(t) {
  const { count, hold, morph } = FILM
  if (t < count) {
    const p = Math.max(0, t) / count
    return { phase: 'count', n: Math.max(1, Math.round(80 * p * p)) } // p² starts slow and speeds up
  }
  if (t < count + hold) return { phase: 'hold', n: 80 }
  if (t < count + hold + morph) return { phase: 'morph', n: 80 }
  return { phase: 'done', n: 80 }
}

// Where `el` sits inside `root`, ignoring transforms: the phone is still
// sliding into place when the photo takes off towards it.
function offsetWithin(el, root) {
  let x = 0
  let y = 0
  for (let node = el; node && node !== root; node = node.offsetParent) {
    x += node.offsetLeft
    y += node.offsetTop
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

export function runFilm(root, { photos, finalPhoto, reduced, onDone }) {
  const flash = root.querySelector('[data-film-flash]')
  const number = root.querySelector('[data-film-number]')
  const slot = root.querySelector('[data-widget]')
  const skipEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown']
  let finished = false

  function finish() {
    if (finished) return
    finished = true
    skipEvents.forEach((e) => removeEventListener(e, skip))
    root.dataset.phase = 'done'
    onDone()
  }

  // Skip on any of these, unless the pointer/touch started inside a link in
  // the film itself — the App Store badge needs its click to actually
  // navigate. Links elsewhere on the page (the pinned store bar, nav) aren't
  // covered by the film, so they don't need the exemption.
  const skip = (e) => { if (!e.target?.closest?.('.film-cta a[href]')) finish() }

  if (reduced) {
    root.dataset.reduced = ''
    finish()
    return
  }

  // The CSS fallback already gave the hero back (JS arrived late): don't take it away again.
  if (getComputedStyle(flash).visibility === 'hidden') return finish()

  // The final photo isn't part of the flash rotation, but it still needs to
  // have arrived by the time the flight lands on it.
  new Image().src = finalPhoto

  // Swap only to photos that have arrived, so a slow connection drops frames
  // rather than flashing blanks.
  const ready = []
  for (const src of photos) {
    const img = new Image()
    img.onload = () => ready.push(src)
    img.src = src
  }

  skipEvents.forEach((e) => addEventListener(e, skip, { passive: true }))
  root.dataset.phase = 'count'
  const start = performance.now()
  let shown = 0
  let phase = 'count'

  requestAnimationFrame(function frame(now) {
    if (finished) return
    const f = filmFrame(now - start)
    if (f.n !== shown) {
      shown = f.n
      number.textContent = f.n
      if (f.n === 80) flash.src = finalPhoto
      else if (ready.length) flash.src = ready[f.n % ready.length]
    }
    if (f.phase !== phase) {
      phase = f.phase
      if (phase === 'done') return finish()
      root.dataset.phase = phase
      if (phase === 'morph') {
        const r = offsetWithin(slot, root)
        Object.assign(flash.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` })
      }
    }
    requestAnimationFrame(frame)
  })
}
