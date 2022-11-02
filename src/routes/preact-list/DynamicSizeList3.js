import { useEffect, useState, useRef } from 'preact/hooks'
import { html } from 'htm/preact'

/*
* Virtual list of items with different heights
*   - Uses IntersectionObserver on every element in the list
*/
export default function DynamicSizeList ({ 
  count, 
  estimatedItemHeight = 20, 
  itemRender, 
  overscanCount = 5,
  reverse = false,
  onIndexChange = function () {},
  ...props 
}) {
  const ref = useRef()
  const observer = useRef()
  const content = useRef()
  const heights = useRef(new Array(count))
  const [height, setHeight] = useState(0)
  const [{ startIndex, endIndex }, setIndexes] = useState({ startIndex: 0, endIndex: 0 })

  useEffect(() => {
    setHeight(ref.current.offsetHeight)
    observer.current = new window.IntersectionObserver((entries, observer) => {
      computeIndexes()
    }, {})
    observer.current.observe(content.current)
    window.addEventListener('resize', onResize)
    if (reverse) {
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
    onIndexChange({ startIndex, endIndex })
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

  const computeIndexes = () => {
    // Compute next startIndex
    let startIndex = 0
    let acc = 0
    while (acc < ref.current.scrollTop && startIndex < count) {
      acc += heights.current[startIndex] || getEstimatedItemHeight(startIndex)
      startIndex++
    }

    // Compute next endIndex
    let endIndex = startIndex
    let visibleHeight = 0
    while (visibleHeight < ref.current.offsetHeight && endIndex < count) {
      visibleHeight += heights.current[endIndex] || getEstimatedItemHeight(endIndex)
      endIndex++
    }
    
    // Add some buffer
    if (overscanCount) {
      startIndex = Math.max(0, startIndex - overscanCount)
      endIndex = Math.min(count - 1, endIndex)
    }

    // Set new indexes
    setIndexes({ startIndex, endIndex })
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
      <div key=${index} style=${reverse ? 'transform: rotate(180deg); direction: ltr;' : ''}>
        ${itemRender(index)}
      </div>
    `)
  }

  console.log({ startIndex, endIndex, heights })

  return html`
    <div ref=${ref} ...${props} style="height:100%; overflow-y: scroll; ${reverse ? `transform: rotate(180deg); direction: rtl;` : ''}">
      <div style="position:relative; overflow:hidden; width:100%; min-height:100%; height:${fullHeight}px;">
        <div ref=${content} style="position:absolute; top:${topOffset}px; left:0; height:100%; width:100%; overflow:visible;">
          ${components}
        </div>
      </div>
    </div>
  `
}
