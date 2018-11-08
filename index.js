const debug = require('debug')
const enabled = []

module.exports = class Logger {
  static get NONE () {
    return 0
  }

  static get ERROR () {
    return 1
  }

  static get WARN () {
    return 2
  }

  static get INFO () {
    return 3
  }

  static get LOG () {
    return 4
  }

  static get DEBUG () {
    return 5
  }

  static get DEFAULT_LEVEL () {
    return 2
  }

  constructor (bindTo, level) {
    if (!bindTo) {
      bindTo = 'Logger'
    }

    if (typeof bindTo !== 'string' && bindTo.constructor && bindTo.constructor.name) {
      bindTo = bindTo.constructor.name
    }

    if (!enabled.includes(bindTo)) {
      enabled.push(bindTo)
      debug.enable(enabled.join(','))
    }
    this.logger = debug(bindTo)
    this.setLevel(level == null ? Logger.DEFAULT_LEVEL : level)
  }

  setLevel (level) {
    // Set the log level to a sane value
    if (typeof level === 'number') {
      level = Math.min(Math.max(0, Math.round(level)), Logger.DEBUG)
    }

    switch (true) {
      case (['none', 'NONE', Logger.NONE].indexOf(level) !== -1):
        this.level = Logger.NONE
        return

      case (['error', 'ERROR', Logger.ERROR].indexOf(level) !== -1):
        this.level = Logger.ERROR
        return

      case (['warn', 'warning', 'WARN', 'WARNING', Logger.WARN].indexOf(level) !== -1):
        this.level = Logger.WARN
        return

      case (['info', 'INFO', Logger.INFO].indexOf(level) !== -1):
        this.level = Logger.INFO
        return

      case (['log', 'LOG', Logger.LOG].indexOf(level) !== -1):
        this.level = Logger.LOG
        return

      case (['debug', 'DEBUG', Logger.DEBUG].indexOf(level) !== -1):
        this.level = Logger.DEBUG
        return

      default:
        throw new Error(`Invalid log level "${level}"`)
    }
  }

  log (...args) {
    if (this.level < Logger.LOG) {
      return null
    }

    this.logger.apply(this, args)
  }

  debug (...args) {
    if (this.level < Logger.DEBUG) {
      return null
    }

    this.logger.apply(this, args)
  }

  info (...args) {
    if (this.level < Logger.INFO) {
      return null
    }

    this.logger.apply(this, args)
  }

  warn (...args) {
    if (this.level < Logger.WARN) {
      return null
    }

    this.logger.apply(this, args)
  }

  error (...args) {
    if (this.level < Logger.ERROR) {
      return null
    }

    this.logger.apply(this, args)
  }
}
