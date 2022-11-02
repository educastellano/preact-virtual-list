import { h } from 'preact';
import Example from './Example'
import style from './style.css';

export default function ReactWindow() {
  return (
    <div class={style.page}>
      <h1>react-window</h1>
      <Example />
    </div>
  )
}
