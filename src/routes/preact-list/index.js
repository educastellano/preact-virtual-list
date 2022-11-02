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

const fetchData = async (startIndex, endIndex, ms=1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => 
      resolve(itemsDynamicSize.slice(startIndex, endIndex)), 
      ms
    )
  })
}

const pageSize = 100

export default function PreactList() {

  const [ data, setData ] = useState({ 
    startIndex: 0, 
    messages: [], 
    length: 0
  })

  useEffect(() => {
    fetchData(0, pageSize-1, 0).then(messages => 
      setData({ 
        startIndex: 0, 
        messages, 
        length: itemsDynamicSize.length 
      })
    )
  }, [])

  const onIndexChange = ({ startIndex, endIndex }) => {
    if (!(startIndex >= data.startIndex && endIndex < data.startIndex + data.messages.length)) {
      fetchData(startIndex, startIndex+pageSize-1).then(messages => 
        setData({
          startIndex,
          messages,
          length: itemsDynamicSize.length
        })
      )
    }
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
          count=${data.length}
          estimatedItemHeight=${36}
          reverse=${true}
          onIndexChange=${onIndexChange}
          itemRender=${index => data.messages[index - data.startIndex]
            ? html`
              <div class=${style.dynamicSizeItem} data-index=${index}>
                ${data.messages[index - data.startIndex].name}
              </div>`
            : html`<div class=${style.placeholder}></div>`
          }
        />
      </div>
    </div>
  `
}
