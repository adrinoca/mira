import { createPhone } from './phone.js'

// Tap a phrase and the widget beside the list shows it, over that group's photo.
const phone = createPhone(document.querySelector('.aff-preview [data-phone]'))
const buttons = [...document.querySelectorAll('.aff-phrase')]

for (const button of buttons) {
  button.addEventListener('click', () => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)))
    phone.setText(button.dataset.phrase)
    phone.setPhoto(button.dataset.photo)
  })
}
buttons[0]?.setAttribute('aria-pressed', 'true')
