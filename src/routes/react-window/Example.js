import { FixedSizeList as List } from 'react-window';
import { html } from 'htm/preact';
 
const Row = ({ index, style }) => (
  html`<div style=${style}>Row ${index}</div>`
)
 
const Example = () => (
  html`<${List}
    height=${150}
    itemCount=${1000}
    itemSize=${35}
    width=${300}
  >
    ${Row}
  <//>`
)

export default Example
