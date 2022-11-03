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
  const [{ startIndex, endIndex }, setIndexes] = useState({ startIndex: 0, endIndex: 0 })
  const startIndexPrev = useRef(startIndex)
  const endIndexPrev = useRef(endIndex)
  const indexDiffToRender = useRef((overscanCount + (overscanCount & 1)) / 2)

  useEffect(() => {
    observer.current = new window.IntersectionObserver((entries, observer) => {
      computeIndexes()
    }, {})
    observer.current.observe(content.current)
    if (reverse) {
      ref.current.addEventListener('wheel', event => {
        event.preventDefault()
        ref.current.scrollTop -= event.deltaY
      })
    }
    return () => {
      observer.current.disconnect()
    }
  }, [count])

  useEffect(() => {
    startIndexPrev.current = startIndex
    endIndexPrev.current = endIndex
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

  const getEstimatedItemHeight = index => {
    if (typeof estimatedItemHeight === 'function') {
      return estimatedItemHeight(index)
    }
    return estimatedItemHeight
  }

  const getRenderedElements = () => {
    return content.current.children
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
    if (Math.abs(startIndex - startIndexPrev.current) >= indexDiffToRender.current || 
        Math.abs(endIndex - endIndexPrev.current) >= indexDiffToRender.current) {
      setIndexes({ startIndex, endIndex })
    }
  }

  const computeOffset = (startIndex, endIndex) => {
    let offset = 0
    for (let i = startIndex; i < endIndex; i++) {
      offset += heights.current[i] || getEstimatedItemHeight(i)
    }
    return offset
  }

  const topOffset = computeOffset(0, startIndex)
  const fullHeight = topOffset + computeOffset(startIndex, count)

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
