const debug = require('debug')
const enabled = []

module.exports = class Logger {
  /**
   * Constant for logger level NONE
   *
   * @return { number }               Log level for NONE
   */
  static get NONE () {
    return 0
  }

  /**
   * Constant for logger level ERROR
   *
   * @return { number }               Log level for ERROR
   */
  static get ERROR () {
    return 1
  }

  /**
   * Constant for logger level WARN
   *
   * @return { number }               Log level for WARN
   */
  static get WARN () {
    return 2
  }

  /**
   * Constant for logger level WARNING which is an alias for WARN
   *
   * @return { number }               Log level for WARN
   */
  static get WARNING () {
    return Logger.WARN
  }

  /**
   * Constant for logger level INFO
   *
   * @return { number }               Log level for INFO
   */
  static get INFO () {
    return 3
  }

  /**
   * Constant for logger level LOG
   *
   * @return { number }               Log level for LOG
   */
  static get LOG () {
    return 4
  }

  /**
   * Constant for logger level DEBUG
   *
   * @return { number }               Log level for DEBUG
   */
  static get DEBUG () {
    return 5
  }

  /**
   * Constant for logger level NONE
   *
   * @return { number }               Log level for NONE
   */
  static get DEFAULT_LEVEL () {
    return 2
  }

  /**
   * Logger constructor
   *
   * @param { mixed } bindTo          String or class instance to be used for the name
   * @param { number } [level]        Log level
   */
  constructor (bindTo, level = null) {
    if (!bindTo) {
      bindTo = 'Logger'
    }

    if (typeof bindTo !== 'string' && bindTo.constructor && bindTo.constructor.name) {
      bindTo = bindTo.constructor.name
    }

    bindTo = bindTo.replace(/ /, '_')
    if (!enabled.includes(bindTo)) {
      enabled.push(bindTo)
      debug.enable(enabled.join(','))
    }
    this.logger = debug(bindTo)
    this.setLevel(level == null ? Logger.DEFAULT_LEVEL : level)
  }

  /**
   * Set log level
   *
   * @param { mixed } level           Number or string for the log level
   * @return { object }               This instance for chaining
   */
  setLevel (level) {
    // Set the log level to a sane value
    if (typeof level === 'number') {
      level = Math.min(Math.max(Logger.NONE, Math.round(level)), Logger.DEBUG)
    }

    switch (true) {
      case (['none', 'NONE', Logger.NONE].indexOf(level) !== -1):
        this.level = Logger.NONE
        return this

      case (['error', 'ERROR', Logger.ERROR].indexOf(level) !== -1):
        this.level = Logger.ERROR
        return this

      case (['warn', 'warning', 'WARN', 'WARNING', Logger.WARN].indexOf(level) !== -1):
        this.level = Logger.WARN
        return this

      case (['info', 'INFO', Logger.INFO].indexOf(level) !== -1):
        this.level = Logger.INFO
        return this

      case (['log', 'LOG', Logger.LOG].indexOf(level) !== -1):
        this.level = Logger.LOG
        return this

      case (['debug', 'DEBUG', Logger.DEBUG].indexOf(level) !== -1):
        this.level = Logger.DEBUG
        return this

      default:
        throw new Error(`Invalid log level "${level}"`)
    }
  }

  /**
   * Log level output
   *
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  log (...args) {
    if (this.level < Logger.LOG) {
      return null
    }

    this.logger.apply(this, args)
    return this
  }

  /**
   * Debug level output
   *
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  debug (...args) {
    if (this.level < Logger.DEBUG) {
      return null
    }

    this.logger.apply(this, args)
  }

  /**
   * Info level output
   *
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  info (...args) {
    if (this.level < Logger.INFO) {
      return null
    }

    this.logger.apply(this, args)
  }

  /**
   * Warn level output
   *
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  warn (...args) {
    if (this.level < Logger.WARN) {
      return null
    }

    this.logger.apply(this, args)
  }

  /**
   * Alias for warn level output
   *
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  warning (...args) {
    return this.warn(...args)
  }

  /**
   * Error level output
   *
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  error (...args) {
    if (this.level < Logger.ERROR) {
      return null
    }

    this.logger.apply(this, args)
  }
}
