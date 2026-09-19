// Drives a phone made by lib/html.mjs phone(): puts a phrase and a photo on
// its widget, and types phrases out character by character.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function createPhone(el) {
  const base = el.dataset.img
  const text = el.querySelector('[data-widget-text]')
  const photos = el.querySelectorAll('[data-photo]')
  let current = null
  return {
    setText(value) { text.textContent = value },
    setPhoto(key) {
      if (key === current) return
      current = key
      for (const img of photos) {
        img.srcset = [480, 800, 1400].map((w) => `${base}area_${key}-${w}.webp ${w}w`).join(', ')
        img.src = `${base}area_${key}-800.webp`
      }
    },
  }
}

// Types `phrase` through `write`, holds it, erases it. Time-based like the
// film. Resolves false as soon as `alive()` says stop.
export async function typeOut(phrase, write, alive, { perChar = 55, hold = 2000, erase = 18 } = {}) {
  const run = async (ms, backwards) => {
    const start = performance.now()
    for (;;) {
      if (!alive()) return false
      const c = Math.min(phrase.length, Math.floor((performance.now() - start) / ms) + 1)
      write(phrase.slice(0, backwards ? phrase.length - c : c))
      if (c >= phrase.length) return true
      await sleep(16)
    }
  }
  if (!(await run(perChar, false))) return false
  await sleep(hold)
  return alive() && run(erase, true)
}
