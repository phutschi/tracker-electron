/**
 * Tracker
 * A data tracking system
 *
 * @author Josh Avanier
 * @version 0.1.0
 * @license MIT
 */

'use strict';

var Tracker = {

  config: {},

  /**
   * Display a table of entries
   * @param {Object[]} set - Data set
   * @param {number=} num - Number of entries to show
   * @param {string=} con - Container
   */
  display(set, num = 50, con = 'setEntries') {
    let ent = set.data

    let index = 0
    for (let i = 0, l = user.datasets.length; i < l; i++) {
      if (set.set === user.datasets[i].set) {
        index = i
        break
      }
    }

    /**
     * Take the last n items of an array
     * @param {Object[]} a - The array
     * @param {number=} n - Number of items
     * @returns {Object[]} An array with the last n items
     */
    let takeRight = (a, n = 1) => {
      const l = a == null ? 0 : a.length
      let slice = (a, s, e) => {
        let l = a == null ? 0 : a.length
        if (!l) return []
        s = s == null ? 0 : s
        e = e === undefined ? l : e
        if (s < 0) s = -s > l ? 0 : (l + s)
        e = e > l ? l : e
        if (e < 0) e += l
        l = s > e ? 0 : ((e - s) >>> 0)
        s >>>= 0
        let i = -1
        const r = new Array(l)
        while (++i < l) r[i] = a[i + s]
        return r
      }
      if (!l) return []
      n = l - n
      return slice(a, n < 0 ? 0 : n, l)
    }

    /**
     * Create cells and store data
     * @param {Object} e - Entry
     * @param {number} i - The array position
     */
    let addRow = (e, i) => {
      let rw = document.getElementById(con).insertRow(i)

      rw.insertCell(0).innerHTML = `${index + 1}-${ent.length - i}`
      rw.insertCell(1).innerHTML = Tracker.time.displayDate(Tracker.time.convert(Tracker.time.parse(e.s)))
      rw.insertCell(2).innerHTML = e.v
      rw.insertCell(3).innerHTML = e.n === undefined ? '' : e.n
    }

    let entries = takeRight(ent, num).reverse()

    for (let i = 0, l = entries.length; i < l; i++) {
      addRow(entries[i], i)
    }
  },

  detail: {

    /**
     * View data set details
     * @param {number} id - Data set ID
     */
    set(id) {
      Tracker.detail.clear()

      let set = user.datasets[id]
      let data = set.data
      let val = Tracker.data.listValues(data)

      Tracker.ui.write('setName', set.set)

      Tracker.vis.bar('setChart', set)

      Tracker.ui.write('entryCount', data.length)
      Tracker.ui.write('sum', Tracker.data.sum(val).toFixed(2))
      Tracker.ui.write('min', Tracker.data.min(val).toFixed(2))
      Tracker.ui.write('max', Tracker.data.max(val).toFixed(2))
      Tracker.ui.write('avg', Tracker.data.avg(val).toFixed(2))
      Tracker.ui.write('std', Tracker.data.sd(val).toFixed(2))

      Tracker.display(set)
    },

    clear() {
      Tracker.ui.empty('setChart')
      Tracker.ui.empty('setEntries')
    }
  },

  /**
   * Generate data set navigation
   * @param {string=} con - Container
   */
  nav(con = 'setList') {
    for (let i = 0, l = user.datasets.length; i < l; i++) {
      if (user.datasets[i].data.length !== 0) {
        let li = document.createElement('li')

        li.className = 'lhd c-pt'
        li.innerHTML = user.datasets[i].set
        li.setAttribute('onclick', `Tracker.detail.set("${i}")`)

        document.getElementById(con).appendChild(li)
      }
    }
  },

  /**
   * Open a tab
   */
  tab(s, g, t, v = false) {
    let x = document.getElementsByClassName(g)
    let b = document.getElementsByClassName(t)

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none'
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = v ? `db mb3 ${t} on bg-cl o5 mr3` : `pv1 ${t} on bg-cl o5 mr3`
    }

    document.getElementById(s).style.display = 'block'
    document.getElementById(`b-${s}`).className = v ? `db mb3 ${t} on bg-cl of mr3` : `pv1 ${t} on bg-cl of mr3`
  },

  /**
   * Refresh
   */
  refresh() {
    Tracker.reset()
    Tracker.init()
  },

  reset() {
    Tracker.ui.empty('setList')
  },

  init() {
    if (localStorage.hasOwnProperty('trackerHistory')) {
      Tracker.console.history = JSON.parse(localStorage.getItem('trackerHistory'))
    } else {
      Tracker.console.history = []
      localStorage.setItem('trackerHistory', JSON.stringify(Tracker.console.history))
    }

    let cmd = document.getElementById('cmd')
    let con = document.getElementById('console')
    let cmdIndex = 1

    cmd.addEventListener('submit', function() {
      if (con.value !== '') {
        Tracker.console.history.push(con.value)

        if (Tracker.console.history.length >= 100) Tracker.console.history.shift()

        localStorage.setItem('trackerHistory', JSON.stringify(Tracker.console.history))

        Tracker.console.parse(con.value)
      }

      con.value = ''
      cmd.style.display = 'none'
      cmdIndex = 1
    })

    document.addEventListener('keydown', function(e) {
      if (e.which >= 65 && e.which <= 90) {
        cmd.style.display = 'block'
        con.focus()
      } else if (e.key === 'Escape') {
        con.value = ''
        cmd.style.display = 'none'
        cmdIndex = 1
      } else if (e.which === 38) {
        cmd.style.display = 'block'
        con.focus()
        cmdIndex++

        if (cmdIndex > Tracker.console.history.length) {
          cmdIndex = Tracker.console.history.length
        }

        con.value = Tracker.console.history[Tracker.console.history.length - cmdIndex]
      } else if (e.which === 40) {
        cmd.style.display = 'block'
        con.focus()
        cmdIndex--

        if (cmdIndex < 1) cmdIndex = 1
        con.value = Tracker.console.history[Tracker.console.history.length - cmdIndex]
      } else if (e.key === 'Tab') {
        e.preventDefault()
        Tracker.nav.horizontal()
      }

      if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
      	e.preventDefault()
      	Tracker.console.importUser()
      	return
      }

      if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
      	e.preventDefault()
      	Tracker.console.exportUser()
      	return
      }
    })

    if (localStorage.hasOwnProperty('trackerUser')) {
      try {
        JSON.parse(localStorage.getItem('trackerUser'))
        user = JSON.parse(localStorage.getItem('trackerUser'))
      } catch(e) {
        return
      }
    } else {
      user.log = []
      localStorage.setItem('trackerUser', JSON.stringify(user))
    }

    Tracker.config = user.config

    document.getElementById('app').style.backgroundColor = Tracker.config.ui.bg
    document.getElementById('app').style.color = Tracker.config.ui.colour

    if (user.datasets.length === 0) {
      Tracker.tab('gui', 'sect', 'tab')
    } else {
      Tracker.nav()
      Tracker.detail.set(0)
    }
  }
}
