import { h } from 'preact';
import List from './List'
import style from './style.css'

const items = Array(500).fill({})

export default function PreactIntersectionObserver() {
  return (
    <div class={style.page}>
      <h1>preact-intersection-observer</h1>
      {/*<Example />*/}
      {/*<iframe srcdoc={html} width="100%" height="500px" />*/}
      <List items={items} />
    </div>
  )
}
