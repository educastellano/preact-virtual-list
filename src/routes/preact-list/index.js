import { html } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks'
import FixedSizeList from './FixedSizeList'
import DynamicSizeList from './DynamicSizeList3'
import style from './style.css'

const itemsFixedSize = Array(500).fill().map((item, index) => ({ 
  id: index, 
  name: `Item #${index}` 
}))

const itemsDynamicSize = Array(500).fill().map((item, index) => ({ 
  id: index, 
  name: `#${index} - 
    ${Array(1 + Math.round(Math.random() * 50)).fill()
      .reduce((acc, c) => `bla ${acc}`, '')}
  `
}))

const fetchItems = async (startIndex=0, endIndex) => {
  return new Promise((resolve, reject) => {
    // const items = Array(100).fill().map((item, index) => ({ 
    //   id: startIndex + index, 
    //   name: `#${startIndex + index} - 
    //     ${Array(1 + Math.round(Math.random() * 100)).fill()
    //       .reduce((acc, c) => `bla ${acc}`, '')}
    //   `
    // }))
    setTimeout(() => resolve(itemsDynamicSize.slice(startIndex, endIndex)), 1000)
  })
}

export default function PreactList() {

  const [items, setItems] = useState([])

  const onIndexChange = (startIndex, endIndex) => {
    fetchItems(startIndex, endIndex).then(items => setItems(items))
  }

  return html`
    <div class=${style.page}>
      <h1>preact-list</h1>
      <div class=${style.content}>
        <${FixedSizeList}
          class=${style.list}
          items=${itemsFixedSize}
          itemHeight=${36}
          itemRender=${item => html`
            <div class=${style.fixedSizeItem}>
              ${item.name}
            </div>
          `}
        />
        <${DynamicSizeList}
          class=${style.list}
          count=${itemsDynamicSize.length}
          estimatedItemHeight=${36}
          itemRender=${index => html`
            <div class=${style.dynamicSizeItem} data-index=${index} style=${index % 2 === 0 ? `` : `background-color: #eee`}>
              ${itemsDynamicSize[index].name}
            </div>`
          }
        />
      </div>
    </div>
  `
}


// <${DynamicSizeList}
//   class=${style.list}
//   count=${itemsDynamicSize.length}
//   estimatedItemHeight=${28}
//   itemRender=${index => index in items 
//     ? html`
//       <div class=${style.dynamicSizeItem}>
//         ${items[index].name}
//       </div>`
//     : html`<div class=${style.placeholder}></div>`
//   }
//   onIndexChange=${onIndexChange}
// />