import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';

const Header = () => (
	<header class={style.header}>
		<h1>Preact App</h1>
		<nav>
			<Link activeClassName={style.active} href="/vanilla">vanilla</Link>
			<Link activeClassName={style.active} href="/preact-intersection-observer">preact-i-o</Link>
			<Link activeClassName={style.active} href="/preact-list">preact-list</Link>
			<Link activeClassName={style.active} href="/react-window">react-window</Link>
			<Link activeClassName={style.active} href="/react-virtual">react-virtual</Link>
		</nav>
	</header>
);

export default Header;
