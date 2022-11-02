import { h } from 'preact';
import { Router } from 'preact-router';

import Header from './header';

// Code-splitting is automated for `routes` directory
import Vanilla from '../routes/vanilla';
import ReactWindow from '../routes/react-window'
import ReactVirtual from '../routes/react-virtual'
import PreactList from '../routes/preact-list'

const App = () => (
	<div id="app">
		<Header />
		<Router>
			<Vanilla path="/vanilla" />
			<PreactList path="/preact-list" />
			<ReactWindow path="/react-window/" />
			<ReactVirtual path="/react-virtual/" />
		</Router>
	</div>
)

export default App;
