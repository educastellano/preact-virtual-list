import { useEffect, useState, useRef } from 'preact/hooks'
import { html } from 'htm/preact'

/*
* Virtual list of items with different heights
*   - Uses IntersectionObserver top/btm
*/
export default function DynamicSizeList ({ 
  count,
  estimatedItemHeight = 20,
  visibleItemsCount = 15,
  overscanCount = 5,
  itemRender,
  ...props
}) {
  const ref = useRef()
  const top = useRef()
  const btm = useRef()
  const observer = useRef()
  const [{ startIndex, endIndex }, setIndexes] = useState({ startIndex: 0, endIndex: visibleItemsCount-1 })
  const startIndexRef = useRef(startIndex)
  const endIndexRef = useRef(endIndex)

  useEffect(() => {
    observer.current = new window.IntersectionObserver(onIntersect, {})
    observer.current.observe(top.current)
    observer.current.observe(btm.current)
  }, [])

  const onIntersect = (entries, observer) => {
    for (const entry of entries) {
      if (entry.target === top.current) {
        console.log('top', entry.isIntersecting)
        if (entry.isIntersecting) {
          const startIndex = Math.max(0, startIndexRef.current - visibleItemsCount)
          const endIndex = Math.max(visibleItemsCount-1, endIndexRef.current - visibleItemsCount)
          startIndexRef.current = startIndex
          endIndexRef.current = endIndex
          setIndexes({ startIndex, endIndex })
        }
      } 
      else if (entry.target === btm.current) {
        console.log('btm', entry.isIntersecting)
        if (entry.isIntersecting) {
          const startIndex = startIndexRef.current + visibleItemsCount
          const endIndex = Math.min(count - 1 - visibleItemsCount, endIndexRef.current + visibleItemsCount)
          startIndexRef.current = startIndex
          endIndexRef.current = endIndex
          setIndexes({ startIndex, endIndex })
        }
      }
      else {
        console.log('intersected something else')
      }
    }
  }

  const topHeight = startIndex - 1 * estimatedItemHeight
  const btmHeight = count * estimatedItemHeight - endIndex * estimatedItemHeight

  const components = []
  for (let index = startIndex; index < endIndex; index++) {
    const component = itemRender(index)
    component.key = index
    components.push(component)
  }

  console.log({ startIndex, endIndex })

  return html`
    <div style="height:500px; overflow-y: scroll;" ref=${ref} ...${props}>
      <div ref=${top} style="background:tomato;height:${topHeight}px;" />
      ${components}
      <div ref=${btm} style="background:green;height:${btmHeight}px;" />
    </div>
  `
}
