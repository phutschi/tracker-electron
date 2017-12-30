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
  },

  /**
   * List sectors or projects
   * @param {string} mode - Sector or project
   * @param {string} con - Container
   * @param {Object[]=} ent - Entries
   */
  list(mode, con, ent = Tracker.log) {
    if (ent.length === 0) return

    let list = mode === 'sector' ? Tracker.data.listSectors(ent).sort() : Tracker.data.listProjects(ent).sort()
    let temp = {}

    for (let i = 0, l = list.length; i < l; i++) {
      temp[list[i]] = mode === 'sector' ? Tracker.data.sh(list[i], ent) : Tracker.data.ph(list[i], ent)
    }

    let sorted = Object.keys(temp).sort(function(a,b){return temp[a]-temp[b]})
    sorted = sorted.reverse()

    let sor = []

    for (let key in sorted) {
      let perc = mode === 'sector' ? Tracker.data.sh(sorted[key], ent) : Tracker.data.ph(sorted[key], ent)

      sor.push([sorted[key], perc])
    }

    list = sor

    for (let i = 0, l = list.length; i < l; i++) {
      let sh = mode === 'sector' ? Tracker.data.sh(list[i][0], ent) : Tracker.data.ph(list[i][0], ent)
      let li = document.createElement('li')
      let tl = document.createElement('span')
      let st = document.createElement('span')
      let br = document.createElement('div')
      let dt = document.createElement('div')
      let colour = ''
      let width = 0

      li.className = 'mb2 c-pt'
      tl.className = 'dib xw6 elip'
      st.className = 'rf'
      br.className = 'wf sh1'
      dt.className = 'psr t0 hf lf'

      if (mode === 'sector') {
        colour = Tracker.palette[list[i][0]]
        width = Tracker.data.sp(list[i][0], ent)
      } else if (mode === 'project') {
        colour = Tracker.projectPalette[list[i][0]]
        width = Tracker.data.pp(list[i][0], ent)
      }

      dt.style.backgroundColor = colour || Tracker.config.ui.colour
      dt.style.width = `${width}%`
      st.innerHTML = `${list[i][1].toFixed(2)} h`
      li.setAttribute('onclick', `Tracker.detail.${mode}('${list[i][0]}')`)
      tl.innerHTML = list[i][0]

      li.appendChild(tl)
      li.appendChild(st)

      document.getElementById(con).appendChild(li)
    }
  },

  /**
   * Display a focus distribution bar
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  focusBar(mode, ent = Tracker.log, con = 'focusBar') {
    if (ent.length === 0) return

    let list = mode === 'sector' ? Tracker.data.listSectors(ent) : Tracker.data.listProjects(ent)
    let temp = {}

    for (let i = 0, l = list.length; i < l; i++) {
      temp[list[i]] = mode === 'sector' ? Tracker.data.sp(list[i], ent) : Tracker.data.pp(list[i], ent)
    }

    let sorted = Object.keys(temp).sort(function(a,b){return temp[a]-temp[b]})
    sorted = sorted.reverse()

    let sor = []

    for (let key in sorted) {
      let perc = mode === 'sector' ? Tracker.data.sp(sorted[key], ent) : Tracker.data.pp(sorted[key], ent)

      sor.push([sorted[key], perc])
    }

    for (let i = 0, l = sor.length; i < l; i++) {
      let item = document.createElement('div')
      let colour = mode === 'sector' ? Tracker.palette[sor[i][0]] : Tracker.projectPalette[sor[i][0]]

      item.className = 'psr t0 hf lf'
      item.style.backgroundColor = colour || Tracker.config.ui.colour
      item.style.width = `${sor[i][1]}%`

      document.getElementById(con).appendChild(item)
    }
  },

  /**
   * Create legend
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  legend(mode, ent = Tracker.log, con = 'legend') {
    if (ent.length === 0) return
    if (['sector', 'project'].indexOf(mode) < 0) return

    let list = mode === 'sector' ? Tracker.data.listSectors(ent).sort() : Tracker.data.listProjects(ent).sort()

    let addItem = i => {
      let item = document.createElement('li')
      let code = document.createElement('div')
      let name = document.createElement('div')
      let colour = ''
      let perc = 0

      item.className = 'c3 mb3 f6 lhc'
      code.className = 'dib sh3 sw3 brf mr2 lhs'
      name.className = 'dib'

      if (mode === 'sector') {
        colour = Tracker.palette[i]
        perc = Tracker.data.sp(i, ent)
      } else if (mode === 'project') {
        colour = Tracker.projectPalette[i]
        perc = Tracker.data.pp(i, ent)
      }

      code.style.backgroundColor = colour || Tracker.config.ui.colour
      name.innerHTML = `${i} (${perc.toFixed(2)}%)`

      item.appendChild(code)
      item.appendChild(name)
      document.getElementById(con).appendChild(item)
    }

    for (let i = 0, l = list.length; i < l; i++) {
      addItem(list[i])
    }
  },

  /**
   * Display a focus chart
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Entries
   * @param {string=} con - Container
   */
  focusChart(mode, ent = Tracker.log, con = 'focusChart') {
    if (ent.length === 0) return

    let set = Tracker.data.sortEntries(ent)

    let addItem = i => {
      let list = mode === 'sector' ? Tracker.data.listSectors(i) : Tracker.data.listProjects(i)

      let col = document.createElement('div')
      let inn = document.createElement('div')
      let cor = document.createElement('div')
      let height = list === undefined ? 0 : 1 / list.length * 100

      col.className = 'dib hf psr'
      col.style.width = `${100 / set.length}%`
      inn.className = 'sw1 hf cn bb'
      cor.className = 'psa sw1 b0 bg-noir'
      cor.style.backgroundColor = Tracker.config.ui.colour
      cor.style.height = `${height}%`

      inn.appendChild(cor)
      col.appendChild(inn)
      document.getElementById(con).appendChild(col)
    }

    for (let i = 0, l = set.length; i < l; i++) {
      addItem(set[i])
    }
  }
}
