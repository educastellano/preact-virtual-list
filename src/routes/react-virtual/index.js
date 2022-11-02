import { h } from 'preact';
import Example from './Example'
import style from './style.css'

export default function ReactVirtual() {
  return (
    <div class={style.page}>
      <h1>react-virtual</h1>
      <Example />
    </div>
  )
}
