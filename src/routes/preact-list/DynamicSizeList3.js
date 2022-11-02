import { useEffect, useState, useRef } from 'preact/hooks'
import { html } from 'htm/preact'

// const styleOuter = 'height:100%; overflow-y: scroll;'
// const styleInner = 'position:relative; overflow:hidden; width:100%; min-height:100%;'
// const styleContent = 'position:absolute; top:0; left:0; height:100%; width:100%; overflow:visible;'

/*
* Virtual list of items with different heights
*   - Uses IntersectionObserver on every element in the list
*/
export default function DynamicSizeList ({ count, estimatedItemHeight = 20, itemRender, overscanCount = 5, direction = 1, ...props }) {
  const ref = useRef()
  const observer = useRef()
  const content = useRef()
  const heights = useRef(new Array(count))
  const [height, setHeight] = useState(0)
  const [{ startIndex, endIndex }, setIndexes] = useState({ startIndex: 0, endIndex: 10 })
  const prevStartIndex = useRef(startIndex)

  useEffect(() => {
    setHeight(ref.current.offsetHeight)
    observer.current = new window.IntersectionObserver(onIntersect, {})
    observer.current.observe(content.current)
    window.addEventListener('resize', onResize)
    if (direction === -1) {
      ref.current.addEventListener('wheel', event => {
          event.preventDefault()
          ref.current.scrollTop -= event.deltaY
      })
    }
    return () => {
      window.removeEventListener('resize', onResize)
      observer.current.disconnect()
    }
  }, [count])

  useEffect(() => {
    observer.current.disconnect()
    // Measure item heights and Observe
    const elements = getRenderedElements()
    for (let i = 0; i < elements.length; i++) {
      heights.current[startIndex + i] = elements[i].getBoundingClientRect().height
      observer.current.observe(elements[i])
    }
    observer.current.observe(content.current)

    // 
    const currentFirstIndex = parseInt(content.current.firstElementChild.dataset.index)
    console.log({ currentFirstIndex, startIndex })
    if (startIndex < currentFirstIndex) {
      console.log({ prevStartIndex: prevStartIndex.current, startIndex})
      for (let i=prevStartIndex.current; i<startIndex; i++) {

      }      
    }


  }, [startIndex, endIndex])

  const onResize = () => {
    if (height !== ref.current.offsetHeight) {
      setHeight(ref.current.offsetHeight)
    }
  }

  const getEstimatedItemHeight = index => {
    if (typeof estimatedItemHeight === 'function') {
      return estimatedItemHeight(index)
    }
    return estimatedItemHeight
  }

  const onIntersect = (entries, observer) => {
    computeIndexes()
  }

  const computeIndexes = () => {
    // console.log('computeIndexes()')

    // Compute next startIndex
    let startIndexNext = 0
    let acc = 0
    while (acc < ref.current.scrollTop && startIndexNext < count) {
      acc += heights.current[startIndexNext] || getEstimatedItemHeight(startIndexNext)
      startIndexNext++
    }

    // Compute next endIndex
    let endIndex = startIndexNext
    let visibleHeight = 0
    while (visibleHeight < ref.current.offsetHeight && endIndex < count) {
      visibleHeight += heights.current[endIndex] || getEstimatedItemHeight(endIndex)
      endIndex++
    }
    
    // Add some buffer
    if (overscanCount) {
      startIndexNext = Math.max(0, startIndexNext - overscanCount)
      endIndex = Math.min(count - 1, endIndex)
    }

    // Set new indexes
    setIndexes({ startIndex: startIndexNext, endIndex })
  }

  const getRenderedElements = () => {
    return content.current.children
  }

  const computeOffsetAtIndex = index => {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += heights.current[i] || getEstimatedItemHeight(i)
    }
    return offset
  }

  const fullHeight = computeOffsetAtIndex(count)
  const topOffset = computeOffsetAtIndex(startIndex)

  const components = []
  for (let index = startIndex; index < endIndex; index++) {
    components.push(html`
      <div key=${index} style=${direction === -1 ? 'transform: rotate(180deg); direction: ltr;' : ''}>
        ${itemRender(index)}
      </div>
    `)
  }

  // console.log({ startIndex, endIndex, heights })

  return html`
    <div ref=${ref} ...${props} style="height:100%; overflow-y: scroll; ${direction === -1 ? `transform: rotate(180deg); direction: rtl;` : ''}">
      <div style="position:relative; overflow:hidden; width:100%; min-height:100%; height:${fullHeight}px;">
        <div ref=${content} style="position:absolute; top:${topOffset}px; left:0; height:100%; width:100%; overflow:visible;">
          ${components}
        </div>
      </div>
    </div>
  `
}
