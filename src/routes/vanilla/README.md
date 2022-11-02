

- on every intersection cb
  - computes whether to render new items (uses "dir" local var)
  - loadUp() or loadDown() or nothing (dir === -1 or dir === 1 or dir === 0)
    - computes new render area (start & end  - "from/to" indexes to render)
      - (!) here uses fixed entry heights: `inc = visibleHeight / itemHeight`
    - update()
      - removes entries **outside** the render area (start & end)
      - for each entry **inside** the render area (start & end)
        - render(index)
          - paints "#entry"
          - timeout "#entry (loaded)"
