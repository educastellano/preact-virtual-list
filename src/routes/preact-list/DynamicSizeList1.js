import { useEffect, useState, useRef } from 'preact/hooks'
import { html } from 'htm/preact'

const styleOuter = 'height:100%; overflow-y: scroll;'
const styleInner = 'position:relative; overflow:hidden; width:100%; min-height:100%;'
const styleContent = 'position:absolute; top:0; left:0; height:100%; width:100%; overflow:visible;'

/*
* Virtual list of items with different heights
*   - Uses onScroll event
*/
export default function DynamicSizeList ({ count, estimatedItemHeight = 20, itemRender, overscanCount = 5, ...props }) {
  const ref = useRef()
  const content = useRef()
  const heights = useRef(new Array(count))
  const [height, setHeight] = useState(0)
  const [{ startIndex, endIndex }, setIndexes] = useState({ startIndex: 0, endIndex: 0 })
  const startIndexRef = useRef(startIndex)
  const scroll = useRef({ timer: null })

  useEffect(() => {
    setHeight(ref.current.offsetHeight)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    computeIndexes()
  }, [count])

  const onResize = () => {
    if (height !== ref.current.offsetHeight) {
      setHeight(ref.current.offsetHeight)
    }
  }

  const onScroll = () => {
    clearTimeout(scroll.current.timer)
    scroll.current.timer = setTimeout(() => {
      computeIndexes()
    }, 15)
  }

  const computeIndexes = () => {
    console.log('computeIndexes()')

    // Measure item heights
    const elements = getRenderedElements()
    for (let i = 0; i < elements.length; i++) {
      const absIndex = startIndexRef.current + i
      heights.current[absIndex] = elements[i].getBoundingClientRect().height
    }

    // Compute next startIndex
    let startIndex = 0
    let acc = 0
    while (acc < ref.current.scrollTop && startIndex < count) {
      acc += heights.current[startIndex] || estimatedItemHeight
      startIndex++
    }

    // Compute next endIndex
    let endIndex = startIndex
    let visibleHeight = 0
    while (visibleHeight < ref.current.offsetHeight && endIndex < count) {
      visibleHeight += heights.current[endIndex] || estimatedItemHeight
      endIndex++
    }

    // Add some buffer
    if (overscanCount) {
      startIndex = Math.max(0, startIndex - overscanCount)
      endIndex = Math.min(count, endIndex + overscanCount)
    }

    // Set new indexes
    startIndexRef.current = startIndex
    setIndexes({ startIndex, endIndex })
  }

  const getRenderedElements = () => {
    return content.current.children
  }

  const computeOffsetAtIndex = index => {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += heights.current[i] || estimatedItemHeight
    }
    return offset
  }

  const topOffset = computeOffsetAtIndex(startIndex)
  const fullHeight = computeOffsetAtIndex(count)
  
  const components = []
  for (let index = startIndex; index < endIndex; index++) {
    const component = itemRender(index)
    component.key = index
    components.push(component)
  }

  return html`
    <div style="${styleOuter}" ref=${ref} onScroll=${onScroll} ...${props}>
      <div style="${styleInner} height:${fullHeight}px;">
        <div ref=${content} style="${styleContent} top:${topOffset}px;">
          ${components}
        </div>
      </div>
    </div>
  `
}
