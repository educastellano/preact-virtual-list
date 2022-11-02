import { useEffect, useState, useRef } from 'preact/hooks'
import { html } from 'htm/preact'

const styleOuter = 'height:100%; overflow-y: scroll;'
const styleInner = 'position:relative; overflow:hidden; width:100%; min-height:100%;'
const styleContent = 'position:absolute; top:0; left:0; height:100%; width:100%; overflow:visible;'

export default function FixedSizeList({ items, itemHeight, itemRender, overscanCount=5, ...props }) {

  const ref = useRef()
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    setHeight(ref.current.offsetHeight)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const onResize = () => {
    if (height !== ref.current.offsetHeight) {
      setHeight(ref.current.offsetHeight)
    }
  }

  const onScroll = () => {
    // console.log('onScroll')
    // TODO: debounce
    setScrollTop(ref.current.scrollTop)
  }

  let startIndex = (scrollTop / itemHeight) || 0
  let visibleItemsCount = (height / itemHeight) || 0
  if (overscanCount) {
    startIndex = Math.max(0, startIndex - (startIndex % overscanCount))
    visibleItemsCount += overscanCount
  }
  const endIndex = startIndex + 1 + visibleItemsCount
  const itemsVisible = items.slice(startIndex, endIndex)

  // console.log({ scrollTop, height, startIndex, endIndex, visibleItemsCount, itemsVisible })

  return html`
    <div style="${styleOuter}" ref=${ref} onScroll=${onScroll} ...${props}>
      <div style="${styleInner} height:${items.length * itemHeight}px;">
        <div style="${styleContent} top:${startIndex * itemHeight}px;">
          ${itemsVisible.map(itemRender)}
        </div>
      </div>
    </div>
  `
}
