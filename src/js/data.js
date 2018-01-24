Date.prototype.subtractDays = function(days) {
  let date = new Date(this.valueOf())
  date.setDate(date.getDate() - days)
  return date
}

Date.prototype.addDays = function(days) {
  let date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}

Tracker = window.Tracker || {}
Tracker.data = {

  /**
   * Get entries by date
   * @param {Object[]} set - Data set
   * @param {Object} d - Date
   * @returns {Object[]} Entries
   */
  getEntriesByDate(set, d) {
    let ent = []

    for (let i = 0, l = Tracker.Tracker.length; i < l; i++) {
      // if (Tracker.log[i].e === 'undefined') continue

      let a = Tracker.time.convert(Tracker.time.parse(Tracker.log[i].s))

      a.getFullYear() === d.getFullYear()
      && a.getMonth() === d.getMonth()
      && a.getDate() === d.getDate()
      && ent.push(Tracker.log[i])
    }

    return ent
  },

  /**
   * Get entries from a certain period
   * @param {Object[]} set - Data set
   * @param {Object} ps - Period start
   * @param {Object=} pe - Period end
   * @returns {Object[]} Entries
   */
  getEntriesByPeriod(set, ps, pe = new Date()) {
    let ent = []

    let span = ((start, stop) => {
      let dates = []
      let current = start

      while (current <= stop) {
        dates.push(new Date(current))
        current = current.addDays(1)
      }

      return dates
    })(ps, pe)

    for (let i = 0, l = span.length; i < l; i++) {
      let a = Tracker.data.getEntriesByDate(span[i])
      for (let o = 0, ol = a.length; o < ol; o++) {
        ent.push(a[o])
      }
    }

    return ent
  },

  /**
   * Get entries from the last n days
   * @param {number} n - The number of days
   * @returns {Object[]} Entries
   */
  getRecentEntries(n) {
    return Tracker.data.getEntriesByPeriod(new Date().subtractDays(n))
  },

  /**
   * Get entries of a specific day of the week
   * @param {number} d - A day of the week (0 - 6)
   * @returns {Object[]} Entries
   */
  getEntriesByDay(d, ent = Tracker.log) {
    if (ent.length === 0) return

    let entries = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && Tracker.time.convert(Tracker.time.parse(ent[i].s)).getDay() === d) {
        entries.push(ent[i])
      }
    }

    return entries
  },

  /**
   * Sort entries by date
   * @param {Object[]=} ent - Entries
   * @param {Object=} end - End date
   */
  sortEntries(ent, end = new Date()) {
    if (ent.length === 0) return

    let days = Tracker.time.listDates(
      Tracker.time.convert(Tracker.time.parse(ent[0].s)), end
    )
    let list = []
    let slots = []

    for (let i = 0, l = days.length; i < l; i++) {
      list.push(
        Tracker.time.date(Tracker.time.toHex(
          new Date(days[i].getFullYear(), days[i].getMonth(), days[i].getDate(), 0, 0, 0)
        ))
      )

      slots.push([])
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      let index = list.indexOf(Tracker.time.date(ent[i].s))
      if (index > -1) slots[index].push(ent[i])
    }

    return slots
  },

  /**
   * Sort entries by day
   * @returns {Object[]} Entries sorted by day
   */
  sortEntriesByDay(ent = Tracker.log) {
    let sort = []

    for (let i = 0; i < 7; i++) {
      sort.push(Tracker.data.getEntriesByDay(i, ent))
    }

    return sort
  },

  /**
   * Get peak days
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Peak days
   */
  peakDays(ent = Tracker.log) {
    if (ent.length === 0) return

    let days = Array(7).fill(0)

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      days[Tracker.time.convert(Tracker.time.parse(ent[i].s)).getDay()] += Tracker.time.duration(ent[i].s, ent[i].e)
    }

    return days
  },

  /**
   * Get peak day
   * @param {Object[]=} pk - Peak days
   * @returns {string} Peak day
   */
  peakDay(pk = Tracker.cache.peakDays) {
    if (pk.length === 0) return
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][pk.indexOf(Math.max(...pk))]
  },

  /**
   * Get peak hours
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Peak hours
   */
  peakHours(ent = Tracker.log) {
    if (ent.length === 0) return

    let hours = Array(24).fill(0)

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      let es = Tracker.time.parse(ent[i].s)
      let index = Tracker.time.convert(es).getHours()

      let time = Tracker.time.duration(ent[i].s, ent[i].e)

      if (time > 1) {
        let remainder = time - Math.floor(time)
        hours[index] += remainder
        time -= remainder
        index++

        while (time > 0) {
          time -= 1
          hours[index] += time
          index++
          if (index > 23) break
        }
      } else {
        hours[index] += time
      }
    }

    return hours
  },

  /**
   * Get peak hour
   * @param {Object[]=} pk - Peak hours
   * @returns {string} Peak hour
   */
  peakHour(pk = Tracker.cache.peakHours) {
    if (pk.length === 0) return
    return `${pk.indexOf(Math.max(...pk))}:00`
  },

  /**
   * List values
   * @param {Object[]} set - Data set
   * @returns {Object[]} List of values
   */
  listValues(set) {
    if (set.length === 0) return

    let list = []

    for (let i = 0, l = set.length; i < l; i++) {
      list.push(Number(set[i].v))
    }

    return list
  },

  /**
   * List values by day
   */
  listValuesByDay(set) {
    let arr = []

    for (let i = 0, l = set.length; i < l; i++) {
      let sum = 0
      for (let o = 0, l = set[i].length; o < l; o++) {
        sum += Number(set[i][o].v)
      }
      arr.push(sum)
    }

    return arr
  },

  /**
   * Calculate minimum value
   * @param {Object[]} set - Data set (list of values)
   * @returns {number} Minimum value
   */
  min(set) {
    if (set === undefined) return 0
    return set.length === 0 ? 0 : Math.min(...set)
  },

  /**
   * Calculate maximum value
   * @param {Object[]} set - Data set (list of values)
   * @returns {number} Maximum value
   */
  max(set) {
    if (set === undefined) return 0
    return set.length === 0 ? 0 : Math.max(...set)
  },

  /**
   * Calculate average
   * @param {Object[]} set - Data set (list of values)
   * @returns {number} Average
   */
  avg(set) {
    if (set === undefined || set.length === 0) return 0

    let c = 0

    let avg = set.reduce(
      (total, num) => {
        c++
        return total + num
      }, 0
    )

    return avg / c
  },

  /**
   * Calculate data total
   * @param {Object[]} set - Data set (list of values)
   * @returns {number} Total
   */
  sum(list) {
    return list.length === 0 ? 0 : list.reduce(
      (total, num) => total + num, 0
    )
  },

  /**
   * Calculate standard deviation
   * @param {Object[]} set - Data set (list of values)
   * @returns {number} Standard deviation
   */
  sd(set) {
    let avg = Tracker.data.avg(set)
    let squaredDiff = []
    let sum = 0

    for (let i = 0, l = set.length; i < l; i++) {
      squaredDiff.push(Math.pow(set[i] - avg, 2))
    }

    for (let i = 0, l = squaredDiff.length; i < l; i++) {
      sum += squaredDiff[i]
    }

    return Math.sqrt(sum / set.length)
  },

  /**
   * Calculate trend
   * @param {number} a
   * @param {number} b
   * @returns {number} Trend
   */
  trend(a, b) {
    return (a - b) / b * 100
  },

  /**
   * Calculate streak
   * @param {Object[]=} ent - Sorted entries
   * @returns {number} Streak
   */
  streak(ent = Tracker.cache.sortEntries) {
    if (ent.length === 0) return 0

    let streak = 0

    for (let i = 0, l = ent.length; i < l; i++) {
      streak = ent[i].length === 0 ? 0 : streak + 1
    }

    return streak
  }
}
