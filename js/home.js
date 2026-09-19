import { runFilm } from './film.js'
import { createPhone, typeOut } from './phone.js'

const hero = document.querySelector('[data-film]')
const data = JSON.parse(document.getElementById('hero-data').textContent)
const phone = createPhone(hero.querySelector('[data-phone]'))
const field = hero.querySelector('[data-field]')
const chips = [...hero.querySelectorAll('[data-area]')]
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('still')
let cycling = !reduced

const write = (s) => { field.value = s; phone.setText(s) }
const select = (area) => {
  chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.area === area.area)))
  phone.setPhoto(area.key)
}

async function cycle() {
  for (let i = 0; cycling; i++) {
    const area = data.areas[i % data.areas.length]
    select(area)
    if (!(await typeOut(area.phrases[0], write, () => cycling))) return
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}

field.addEventListener('focus', () => { cycling = false; field.select() })
field.addEventListener('input', () => { field.dataset.own = ''; phone.setText(field.value) })
for (const chip of chips) {
  chip.addEventListener('click', () => {
    cycling = false
    const area = data.areas.find((a) => a.area === chip.dataset.area)
    select(area)
    if (!('own' in field.dataset)) write(area.phrases[Math.floor(Math.random() * area.phrases.length)])
  })
}

runFilm(hero, {
  photos: data.flash.map((key) => `${data.img}area_${key}-480.webp`),
  finalPhoto: `${data.img}area_${data.areas[0].key}-480.webp`,
  reduced,
  onDone: () => {
    if (reduced) { select(data.areas[0]); write(data.areas[0].phrases[0]) }
    else { write(''); cycle() }
  },
})

// How it works: the pinned phone shows whichever step is in the middle of the screen.
const howPhone = document.querySelector('[data-how-phone]')
const steps = new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) howPhone.dataset.step = entry.target.dataset.step
}, { rootMargin: '-45% 0px -45% 0px' })
document.querySelectorAll('.how-step').forEach((step) => steps.observe(step))
