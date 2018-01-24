Tracker = window.Tracker || {}
Tracker.ui = {

  /**
   * Write content
   * @param {string} i - Element ID
   * @param {string} c - Content
   */
  write(i, c) {
    document.getElementById(i).innerHTML = c
  },

  /**
   * Empty element
   * @param {string} e - Element
   */
  empty(e) {
    Tracker.ui.write(e, '')
  },

  /**
   * Hide element
   * @param {string} e - Element
   */
  hide(e) {
    document.getElementById(e).style.display = 'none'
  }
}
