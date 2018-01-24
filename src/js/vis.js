Tracker = window.Tracker || {}
Tracker.vis = {

  /**
   * Display a bar visualisation
   * @param {string} con - Container
   * @param {Object} set - Data set
   */
  bar(con, set) {
    if (ent.length === 0) return

    let data = set.data

    let lw = 0

    let addEntry = (v, row) => {
      let entry = document.createElement('div')
      let height = v / max * 100

      entry.className = 'psa sw1'
      entry.style.height = `${height}%`
      entry.style.bottom = `${lw}%`
      entry.style.backgroundColor = Tracker.config.ui.colour

      document.getElementById(row).appendChild(entry)

      lw += height
    }

    let newCol = id => {
      lw = 0

      let col = document.createElement('div')
      let inn = document.createElement('div')

      col.className = 'dib hf psr'
      col.style.width = `${100 / Tracker.config.ui.view}%`

      inn.className = 'sw1 hf cn bb'
      inn.id = id

      col.appendChild(inn)

      document.getElementById(con).appendChild(col)
    }

    let arr

    if (set.type === 'daily') {
      arr = Tracker.data.listValuesByDay(Tracker.data.sortEntries(data))
    } else {
      arr = Tracker.data.listValues(data)
    }

    let max = Tracker.data.max(arr)

    for (let i = 0, l = arr.length; i < l; i++) {
      let id = `${con}-${i}`
      document.getElementById(id) === null && newCol(id)
      addEntry(arr[i], id)
    }
  },

  /**
   * Display peak days chart
   * @param {string} mode - Hours or days
   * @param {Object[]} peaks - Peaks
   * @param {string=} con - Container
   */
  peakChart(mode, peaks, con) {
    if (peaks.length === 0) return
    if (['hours', 'days'].indexOf(mode) < 0) return

    let peak = Math.max(...peaks)

    for (let i = 0, l = peaks.length; i < l; i++) {
      let col = document.createElement('div')
      let inn = document.createElement('div')
      let id = `${con}-${i}`

      col.className = 'dib hf psr'
      col.style.width = `${100 / peaks.length}%`
      col.id = id

      inn.className = 'psa b0 sw1 bb'
      inn.style.height = `${peaks[i] / peak * 100}%`

      if (mode === 'hours') {
        inn.style.backgroundColor = i === (new Date).getHours() ? Tracker.config.ui.accent : Tracker.config.ui.colour
        inn.style.borderColor = i === (new Date).getHours() ? Tracker.config.ui.accent : Tracker.config.ui.colour
      } else {
        inn.style.backgroundColor = i === (new Date).getDay() ? Tracker.config.ui.accent : Tracker.config.ui.colour
        inn.style.borderColor = i === (new Date).getDay() ? Tracker.config.ui.accent : Tracker.config.ui.colour
      }

      document.getElementById(con).appendChild(col)
      document.getElementById(id).appendChild(inn)
    }
  }
}
