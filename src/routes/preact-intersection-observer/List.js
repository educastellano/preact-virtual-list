import { useEffect } from 'preact/hooks'
import { html } from 'htm/preact'
import style from './style.css'

export default function VirtualList({ items }) {

  useEffect(() => {
    const observer = new window.IntersectionObserver((entries, observer) => {
      console.log({ entries, observer })
    }, {
      root: document.querySelector(`.${style.list}`),
      // rootMargin: '0px',
      // threshold: 1.0
    })
  }, [])

  return html`
    <div class=${style.list}>
      ${items.map((item, index) => 
        html`<div class=${style.item}>${index}</div>`
      )}
    </div>
  `
}
