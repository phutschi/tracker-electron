Tracker = window.Tracker || {}
Tracker.console = {
  history: [],

  /**
   * Parse command
   * @param {string} i - Input
   */
  parse(i) {
    let command = i.split(' ')[0].toLowerCase()

    switch (command) {
      case 'add':
        Tracker.console.addData(i);
        break;
      case 'edit':
        Tracker.console.edit(i);
        break;
      case 'delete':
        Tracker.console.delete(i.split(' ')[1]);
        break;
      case 'set':
        Tracker.console.set(i);
        break;
      case 'import':
        Tracker.console.importUser();
        break;
      case 'export':
        Tracker.console.exportUser();
        break;
      case 'rename':
        Tracker.console.rename(i);
        break;
      case 'invert':
        Tracker.console.invert();
        break;
      case 'type':
        Tracker.console.setType(i);
        break;
      default:
        return
    }
  },

  /**
   * Import user data
   */
  importUser() {
    let path = dialog.showOpenDialog({properties: ['openFile']})

		if (!path) return

    let string = ''
    let notif

		try {
			string = fs.readFileSync(path[0], 'utf-8')
		} catch (e) {
      notif = new window.Notification('An error occured while trying to load this file.')
		}

    localStorage.setItem('trackerUser', string)
    user = JSON.parse(localStorage.getItem('user'))

    notif = new window.Notification('Your data was successfully imported.')

		Tracker.refresh()
  },

  /**
   * Export user data
   */
  exportUser() {
    let data = JSON.stringify(JSON.parse(localStorage.getItem('trackerUser')))
    let notif

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined) return
      fs.writeFile(fileName, data, (err) => {
        if (err) {
          notif = new window.Notification(`An error occured creating the file ${err.message}`)

          return
        } else {
          notif = new window.Notification('Your data has been exported.')
        }
      })
    })
  },

  /**
   * Start a log entry
   * @param {Object[]} s - Input array
   */
  addData(s) {
    let start = Tracker.time.toHex(new Date())
    let p = []
    let indices = []
    let value = ''
    let set = ''
    let note = ''

    if (s.includes('"')) {
      p = s.split('')

      for (let i = 0, l = p.length; i < l; i++) {
        p[i] === '"' && indices.push(i)
      }

      for (let i = indices[0] + 1; i < indices[1]; i++) {
        value += p[i]
      }

      for (let i = indices[2] + 1; i < indices[3]; i++) {
        set += p[i]
      }

      for (let i = indices[4] + 1; i < indices[5]; i++) {
        note += p[i]
      }
    } else if (s.includes(';')) {
      p = s.split(';')
      value = p[0].substring(4, p[0].length).trim()
      set = p[1].trim()
      if (p[2] !== undefined) note = p[2].trim()
    } else if (s.includes('|')) {
      p = s.split('|')
      value = p[0].substring(4, p[0].length).trim()
      set = p[1].trim()
      if (p[2] !== undefined) note = p[2].trim()
    } else if (s.includes(',')) {
      p = s.split(',')
      value = p[0].substring(4, p[0].length).trim()
      set = p[1].trim()
      if (p[2] !== undefined) note = p[2].trim()
    }

    let foundSet = false

    for (let i = 0, l = user.datasets.length; i < l; i++) {
      if (set === user.datasets[i].set) {
        foundSet = true

        user.datasets[i].data.push({
          s: start,
          v: value,
          n: note
        })

        Tracker.options.update()
        return
      }
    }

    if (!foundSet) {
      let newData = [{
        s: start,
        v: value,
        n: note
      }]

      user.datasets.push({
        set: set,
        data: newData,
        type: 'daily'
      })
    }

    Tracker.options.update()
  },

  /**
   * Set a config attribute
   * @param {string} i - Input
   */
  set(i) {
    let c = i.split(' ')
    let a = c[1].toLowerCase()

    if (a === 'background' || a === 'bg') {
      Tracker.options.setBG(c[2])
    } else if (a === 'color' || a === 'colour' || a === 'text') {
      Tracker.options.setColour(c[2])
    } else if (a === 'highlight' || a === 'accent') {
      Tracker.options.setAccent(c[2])
    } else if (a === 'view') {
      Tracker.options.setView(c[2])
    } else if (a === 'cal' || a === 'calendar') {
      Tracker.options.setCalendar(c[2])
    } else return
  },

  /**
   * Delete one or more logs
   * @param {string} i - Input
   */
  delete(i) {
    let s = i.split('-')
    user.datasets[Number(s[0]) - 1].data.splice(Number(s[1]) - 1, 1)
    Tracker.options.update()
  },

  /**
   * Edit a log
   * @param {string} i - Input
   */
  edit(i) {
    let c = i.split(' ')
    let a = c[2]
    let id = c[1].split('-')

    let proc = input => {
      let p = input.split('')
      let indices = []
      let key = ''

      for (let i = 0, l = p.length; i < l; i++) {
        p[i] === '"' && indices.push(i)
      }

      for (let i = indices[0] + 1; i < indices[1]; i++) {
        key += p[i]
      }

      return key.trim()
    }

    if (a === 'val' || a === 'value') {
      user.datasets[Number(id[0]) - 1].data[Number(id[1]) - 1].v = proc(i)
    } else if (a === 'note') {
      user.datasets[Number(id[0]) - 1].data[Number(id[1]) - 1].n = proc(i)
    } else if (a === 'time') {
      user.datasets[Number(id[0]) - 1].data[Number(id[1]) - 1].s = Tracker.time.convertDateTime(proc(i))
    } else return

    Tracker.options.update()
  },

  /**
   * Set data set type
   * @param {string} i - Input
   */
  setType(i) {
    let c = i.split(' ')
    let a = c[2]
    let id = Number(c[1]) - 1

    let proc = input => {
      let p = input.split('')
      let indices = []
      let key = ''

      for (let i = 0, l = p.length; i < l; i++) {
        p[i] === '"' && indices.push(i)
      }

      for (let i = indices[0] + 1; i < indices[1]; i++) {
        key += p[i]
      }

      return key.trim()
    }

    user.datasets[id].type = proc(i)
    Tracker.options.update()
  },

  /**
   * Invert interface colours
   */
  invert() {
    let bg = user.config.ui.bg
    let c = user.config.ui.colour

    user.config.ui.bg = c
    user.config.ui.colour = bg

    Tracker.options.update()
  }
}
