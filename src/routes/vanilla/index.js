import { h } from 'preact';
import style from './style.css';
import html from './index.html'

export default function Vanilla() {
	return (
		<div class={style.page}>
			<h1>Vanilla</h1>
			<iframe srcdoc={html} width="100%" height="500px" />
		</div>
	)
}
