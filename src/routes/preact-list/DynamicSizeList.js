import { useEffect, useState, useRef } from 'preact/hooks'
import { html } from 'htm/preact'

const styleOuter = 'height:100%; overflow-y: scroll;'
const styleInner = 'position:relative; overflow:hidden; width:100%; min-height:100%;'
const styleContent = 'position:absolute; top:0; left:0; height:100%; width:100%; overflow:visible;'

export default function DynamicSizeList({ items, estimatedItemHeight=20, itemRender, overscanCount=5, ...props }) {

  const ref = useRef()
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(0)
  const [itemHeights, setItemHeights] = useState([])

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
    console.log('onScroll')
    // TODO: debounce
    setScrollTop(ref.current.scrollTop)
  }


  let startIndex=0, acc=0
  while (acc<scrollTop && startIndex<items.length) {
    acc += itemHeights[startIndex] || estimatedItemHeight
    startIndex++
  }

  let endIndex=startIndex, visibleHeight=0
  while (visibleHeight<height && endIndex<items.length) {
    visibleHeight += itemHeights[endIndex] || estimatedItemHeight
    endIndex++
  }

  if (overscanCount) {
    startIndex = Math.max(0, startIndex - overscanCount)
    endIndex = Math.min(items.length, endIndex + overscanCount)
  }

  const itemsVisible = items.slice(startIndex, endIndex)

  useEffect(() => {
    
    const heights = itemsVisible.reduce((acc, item, index) => {
      const absIndex = startIndex + index
      const prerenderedItem = itemRender(item)
      acc[absIndex] = estimatedItemHeight // TODO measure here the height
      return acc
    }, [])

    const newHeights = []
    for (let i=0; i<Math.max(itemHeights.length, heights.length); i++) {
      newHeights[i] = heights[i] || itemHeights[i] || undefined
    }
    setItemHeights(newHeights)
    
  }, [startIndex, endIndex])

  // console.log({ itemHeights })
  // console.log({ startIndex, endIndex, acc, scrollTop, visibleHeight })
  // console.log({ scrollTop, height, startIndex, endIndex, visibleItemsCount, itemsVisible })

  return html`
    <div style="${styleOuter}" ref=${ref} onScroll=${onScroll} ...${props}>
      <div style="${styleInner} height:${items.length * estimatedItemHeight}px;">
        <div style="${styleContent} top:${startIndex * estimatedItemHeight}px;">
          ${itemsVisible.map((item, index) => {
              const absIndex = startIndex + index
              return itemHeights[absIndex] 
                ? itemRender(item) 
                : placeholderRender(estimatedItemHeight)
            })
          }
        </div>
      </div>
    </div>
  `
}

function placeholderRender(height) {
  return html`
    <div style="height:${height}px;background:#FF7F50;border-bottom:1px solid"></div>
  `
}