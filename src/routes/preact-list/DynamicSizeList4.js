import { useEffect, useState, useRef } from 'preact/hooks'
import { html } from 'htm/preact'

const styleOuter = 'height:100%; overflow-y: scroll;'
const styleInner = 'position:relative; overflow:hidden; width:100%; min-height:100%;'
const styleContent = 'position:absolute; top:0; left:0; height:100%; width:100%; overflow:visible;'

/*
* Virtual list of items with different heights
*   - Uses IntersectionObserver on the items (WiP)
*/
export default function DynamicSizeList ({ count, estimatedItemHeight = 20, itemRender, overscanCount = 6, ...props }) {
  const ref = useRef()
  const observer = useRef()
  const [height, setHeight] = useState(0)
  const [{ startIndex, endIndex }, setIndexes] = useState({ startIndex: 0, endIndex: 20 + overscanCount }) // TODO compute initial endIndex

  useEffect(() => {
    setHeight(ref.current.offsetHeight)
    observer.current = new window.IntersectionObserver(onIntersect, {})
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      observer.current.disconnect()
    }
  }, [])

  useEffect(() => {
    observer.current.disconnect()
    for (const element of getRenderedElements()) {
      observer.current.observe(element)
    }
  }, [startIndex, endIndex])

  const onResize = () => {
    if (height !== ref.current.offsetHeight) {
      setHeight(ref.current.offsetHeight)
    }
  }



  // 0 5

  // 6 true
  // 0 false

  // ---

  // 5 10

  // 4 true
  // 10 false

  // const scrollingDown = trueNum > endIndex || falseNum <= startIndex
  // const scrollingUp   = trueNum < startIndex || falseNum >= endIndex

  // if scrolling down
  //   true expand endIndex
  //   false reduce startIndex
  // else scrolling up
  //   true expand startIndex
  //   false reduce endIndex

  const onIntersect = (entries, observer) => {
    // TODO calculate heights instead?
    // const threshold = (index1, index2) => Math.abs(index1 - index2) > 3
    const thres = 4

    let direction = 0
    let startIndexNext
    let endIndexNext
    for (const entry of entries) {
      const index = parseInt(entry.target.dataset.index)
      console.log(entry.isIntersecting, index)
      if (isNaN(index) || typeof index !== 'number') {
        continue
      }

      if (entry.isIntersecting) {
        if (index > endIndex - thres) {
          // debugger
          direction = 1
          startIndexNext = startIndex + overscanCount
          endIndexNext = Math.min(endIndex + overscanCount, count)
        }
        else if (index < startIndex) {
          // debugger
          direction = -1
          startIndexNext = Math.max(0, startIndex - overscanCount)
          endIndexNext = endIndex - overscanCount
        }
        else {}
      }
    }

    console.log({ startIndexNext, endIndexNext })

    // Set new indexes
    startIndexNext = typeof startIndexNext === 'number' ? startIndexNext : startIndex
    endIndexNext = typeof endIndexNext === 'number' ? endIndexNext : endIndex
    setIndexes({ 
      startIndex: startIndexNext, 
      endIndex: endIndexNext
    })
  }

  const getRenderedElements = () => {
    // TODO: maybe use a safer way to get these elements
    return ref.current.children[0].children[0].children
  }

  const components = []
  for (let index = startIndex; index < endIndex; index++) {
    const component = itemRender(index)
    component.key = index
    component.props['data-index'] = index
    components.push(component)
  }

  return html`
    <div style="${styleOuter}" ref=${ref} ...${props}>
      <div style="${styleInner} height:${count * estimatedItemHeight}px;">
        <div style="${styleContent} top:${startIndex * estimatedItemHeight}px;">
          ${components}
        </div>
      </div>
    </div>
  `
}
