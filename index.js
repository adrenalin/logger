const debug = require('debug')
const enabled = []
const allow = []
const deny = []

function setLists (stored) {
  if (!stored) {
    return
  }

  String(stored)
    .split(',')
    .forEach((fragment) => {
      if (fragment.match(/^-/)) {
        deny.push(fragment.replace(/^-/, ''))
        return
      }

      allow.push(fragment)
    })
}

if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
  const stored = window.localStorage.getItem('@vapaaradikaali/logger')
  console.log('Logger configuration from window.localStorage with key "@vapaaradikaali/logger":', stored)
  setLists(stored)
}

if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
  setLists(process.env.LOGGER)
}

let maxLevel = 5
let prependTimestamp = false

const maxLevels = []

/**
 * Logger
 *
 * @class Logger
 * @example
 *
 *     const logger = new Logger('loggerId)
 *     logger.error('Error level message')
 *     logger.log('Log level message')
 */
module.exports = class Logger {
  /**
   * Constant for logger level NONE
   *
   * @const { number } Logger.NONE
   */
  static get NONE () {
    return 0
  }

  /**
   * Constant for logger level ERROR
   *
   * @const { number } Logger.ERROR
   */
  static get ERROR () {
    return 1
  }

  /**
   * Constant for logger level WARN
   *
   * @const { number } Logger.WARN
   */
  static get WARN () {
    return 2
  }

  /**
   * Constant for logger level WARNING which is an alias for WARN
   *
   * @const { number } Logger.WARNING
   */
  static get WARNING () {
    return Logger.WARN
  }

  /**
   * Constant for logger level INFO
   *
   * @const { number } Logger.INFO
   */
  static get INFO () {
    return 3
  }

  /**
   * Constant for logger level LOG
   *
   * @const { number } Logger.LOG
   */
  static get LOG () {
    return 4
  }

  /**
   * Constant for logger level DEBUG
   *
   * @const { number } Logger.DEBUG
   */
  static get DEBUG () {
    return 5
  }

  /**
   * Constant for logger level NONE
   *
   * @const { number } Logger.DEFAULT_LEVEL
   */
  static get DEFAULT_LEVEL () {
    return 2
  }

  /**
   * Maximum level for logger
   *
   * @const { number } Logger.MAX_LEVEL
   */
  static get MAX_LEVEL () {
    return maxLevel
  }

  /**
   * Set maximum allowed logger level
   *
   * @method Logger.setMaxLevel
   * @param { number } value          Maximum allowed level
   * @param { string|RegExp } pattern Pattern to match
   */
  static setMaxLevel (value, pattern) {
    maxLevel = value
  }

  /**
   * Prepend timestamp to all logger entries
   *
   * @method Logger.prependTimestamp
   * @param { boolean } [prepend=true]  Prepend switch
   */
  static prependTimestamp (prepend = true) {
    prependTimestamp = prepend
  }

  /**
   * Prepend timestamp to all logger entries
   *
   * @method Logger#prependTimestamp
   * @param { boolean } [prepend=true]  Prepend switch
   */
  prependTimestamp (prepend = true) {
    this.prependTimestamp = prepend
    return this
  }

  /**
   * Get logger name regexp
   *
   * @method Logger.getFragmentMatcher
   * @param { string } fragment       Match fragment
   * @returns { RegExp }              Match as a regular expression
   */
  static getFragmentMatcher (fragment) {
    if (fragment.match(/^\/.+\/$/)) {
      return new RegExp(fragment.replace(/^\/|\/$/g, ''))
    }

    return new RegExp(fragment.replace(/[/.\[\]\(\)]/, '\\$1'))
  }

  /**
   * Allow all log messages
   *
   * @method Logger.allowAll
   */
  static allowAll () {
    allow.splice(0, allow.length)
    deny.splice(0, deny.length)
  }

  /**
   * Allow displaying log messages
   *
   * @method Logger.allow
   * @param {string|array} types      Allow type or types
   */
  static allow (...types) {
    types.forEach((type) => {
      if (!Array.isArray(type)) {
        type = [type]
      }

      allow.push(...type)
    })
  }

  /**
   * Deny displaying log messages
   *
   * @method Logger.deny
   * @param {string|array} types      Deny type or types
   */
  static deny (...types) {
    types.forEach((type) => {
      if (!Array.isArray(type)) {
        type = [type]
      }

      deny.push(...type)
    })
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

    this.loggerName = bindTo
    this.logger = debug(bindTo)
    this.setLevel(level == null ? Logger.DEFAULT_LEVEL : level)
  }

  /**
   * Can display log information
   *
   * @param { number } requestedLevel Requested logging level
   * @param { number } maxLevel       Maximum allowed level
   */
  canDisplay (requestedLevel, maxLevel) {
    if (requestedLevel < maxLevel) {
      return false
    }

    if (allow.includes('*')) {
      return true
    }

    if (deny.includes('*')) {
      return false
    }

    if (allow.length) {
      for (const fragment of allow) {
        const matcher = Logger.getFragmentMatcher(fragment)

        if (matcher.test(this.loggerName)) {
          return true
        }
      }

      return false
    }

    if (deny.length) {
      for (const fragment of deny) {
        const matcher = Logger.getFragmentMatcher(fragment)

        if (!matcher.test(this.loggerName)) {
          return true
        }
      }

      return false
    }

    return true
  }

  /**
   * Write out to logger
   *
   * @method Logger#writeOut
   * @param { number } level          Log level
   * @param { object } context        Context to bind
   * @param { array } output          Output data
   */
  writeOut (level, context, output) {
    const args = [context, output]

    if (!Array.isArray(output)) {
      throw new Error('Logger.writeOut output argument has to be an array')
    }

    if (!output.length) {
      return
    }

    const prepend = this.prependTimestamp != null ? this.prependTimestamp : prependTimestamp

    if (prepend) {
      const d = new Date()
      output.unshift(`[${d.toISOString()}]`)
    }

    this.logger.apply(...args)
  }

  /**
   * Set log level
   *
   * @method Logger#setLevel
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
   * Debug level output
   *
   * @method Logger#debug
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  debug (...args) {
    if (!this.canDisplay(this.level, Logger.DEBUG)) {
      return this
    }

    this.writeOut(Logger.DEBUG, this, args)
    return this
  }

  /**
   * Log level output
   *
   * @method Logger#log
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  log (...args) {
    if (!this.canDisplay(this.level, Logger.LOG)) {
      return this
    }

    this.writeOut(Logger.LOG, this, args)
    return this
  }

  /**
   * Info level output
   *
   * @method Logger#info
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  info (...args) {
    if (!this.canDisplay(this.level, Logger.INFO)) {
      return this
    }

    this.writeOut(Logger.INFO, this, args)
    return this
  }

  /**
   * Warn level output
   *
   * @method Logger#warn
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  warn (...args) {
    if (!this.canDisplay(this.level, Logger.WARN)) {
      return this
    }

    this.writeOut(Logger.WARN, this, args)
    return this
  }

  /**
   * Alias for warn level output
   *
   * @alias Logger#warn
   */
  get warning () {
    return this.warn
  }

  /**
   * Error level output
   *
   * @method Logger#error
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  error (...args) {
    if (!this.canDisplay(this.level, Logger.ERROR)) {
      return this
    }

    this.writeOut(Logger.ERROR, this, args)
    return this
  }

  /**
   * Delta time from the previous call
   *
   * @method Logger#dt
   * @param { mixed } ...args         0...n arguments
   * @return { object }               This instance for chaining
   */
  dt (...args) {
    const prev = this.ts || Date.now()
    const now = this.ts = Date.now()
    const ts = (now - prev).toFixed(0)

    if (!this.canDisplay(this.level, Logger.LOG)) {
      return this
    }

    this.writeOut(Logger.DEBUG, this, [`[${ts} ms]`, ...args])
  }
}
