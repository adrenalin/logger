const debug = require('debug')
const enabled = []

let maxLevel = 5

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
   * Maximum level for logger
   *
   * @return { number }               Global maximum level for the logger
   */
  static get MAX_LEVEL () {
    return maxLevel
  }

  /**
   * Set maximum allowed logger level
   *
   * @param { number } value          Maximum allowed level
   */
  static setMaxLevel (value) {
    maxLevel = value
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
      level = Math.min(Math.max(Logger.NONE, Math.round(level)), maxLevel)
    }

    switch (true) {
      case (['none', 'NONE', Logger.NONE].includes(level)):
        this.level = Logger.NONE
        return this

      case (['error', 'ERROR', Logger.ERROR].includes(level)):
        this.level = Logger.ERROR
        return this

      case (['warn', 'warning', 'WARN', 'WARNING', Logger.WARN].includes(level)):
        this.level = Logger.WARN
        return this

      case (['info', 'INFO', Logger.INFO].includes(level)):
        this.level = Logger.INFO
        return this

      case (['log', 'LOG', Logger.LOG].includes(level)):
        this.level = Logger.LOG
        return this

      case (['debug', 'DEBUG', Logger.DEBUG].includes(level)):
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
