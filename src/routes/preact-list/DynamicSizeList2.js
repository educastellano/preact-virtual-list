import { useEffect, useState, useRef } from 'preact/hooks'
import { html } from 'htm/preact'

const styleOuter = 'height:100%; overflow-y: scroll;'
const styleInner = 'position:relative; overflow:hidden; width:100%; min-height:100%;'
const styleContent = 'position:absolute; top:0; left:0; height:100%; width:100%; overflow:visible;'
const styleTop = 'position:absolute; left:0; height:16px; width:100%; background:tomato;'
const styleBottom = 'position:absolute; left:0; height:16px; width:100%; background:tomato;'

/*
* Virtual list of items with different heights
*   - Uses IntersectionObserver on a 'top' and 'bottom' elements
*/
export default function DynamicSizeList ({ count, estimatedItemHeight = 20, itemRender, overscanCount = 5, ...props }) {
  const ref = useRef()
  const observer = useRef()
  const top = useRef()
  const bottom = useRef()
  const heights = useRef(new Array(count))
  const [height, setHeight] = useState(0)
  const [{ startIndex, endIndex }, setIndexes] = useState({ startIndex: 0, endIndex: 0 })
  const startIndexRef = useRef(startIndex)

  useEffect(() => {
    setHeight(ref.current.offsetHeight)
    observer.current = new window.IntersectionObserver(onIntersect, {})
    observer.current.observe(top.current)
    observer.current.observe(bottom.current)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      observer.current.disconnect()
    }
  }, [])

  const onResize = () => {
    if (height !== ref.current.offsetHeight) {
      setHeight(ref.current.offsetHeight)
    }
  }

  const onIntersect = (entries, observer) => {
    // Measure item heights
    const elements = getRenderedElements()
    for (let i = 0; i < elements.length; i++) {
      const absIndex = startIndexRef.current + i
      heights.current[absIndex] = elements[i].offsetHeight
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
    // TODO: maybe use a safer way to get these elements
    return ref.current.children[0].children[1].children
  }

  const computeOffsetAtIndex = index => {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += heights.current[i] || estimatedItemHeight
    }
    return offset
  }

  const topOffset = computeOffsetAtIndex(startIndex)
  const bottomOffset = computeOffsetAtIndex(endIndex)
  const fullHeight = computeOffsetAtIndex(count)

  const components = []
  for (let index = startIndex; index < endIndex; index++) {
    const component = itemRender(index)
    component.key = index
    components.push(component)
  }

  return html`
    <div style="${styleOuter}" ref=${ref} ...${props}>
      <div style="${styleInner} height:${fullHeight}px;">
        <div ref=${top} style="${styleTop} top:${topOffset}px"></div>
        <div style="${styleContent} top:${topOffset}px;">
          ${components}
        </div>
        <div ref=${bottom} style="${styleBottom} top:${bottomOffset}px"></div>
      </div>
    </div>
  `
}
