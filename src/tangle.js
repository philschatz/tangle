class Variable {

  constructor(el, name, fn, initFn) {
    this.el = el
    this.name = name
    this.fn = fn
    this.inputs = []
    this.dependencies = new Set()
    const rnd = Math.random()
    if (initFn) {
      this.value = initFn(rnd)
    } else if (!this.fn) {
      this.value = JSON.parse(this.el.value || this.el.textContent)
    }
    this.updateDom()

    // attach change listeners
    this.onChange = this.onChange.bind(this)
    if (!this.fn) {
      this.el.addEventListener('change', this.onChange)
    }
  }

  onChange() {
    const value = JSON.parse(this.el.value)
    this.eval(value)
  }

  canEval() {
    return !this.inputs.filter(i => typeof i.value === 'undefined')[0]
  }

  eval(newValue) {
    if (!this.fn && typeof newValue === 'undefined') {
      return
    }
    if (typeof newValue === 'undefined') {
      newValue = this.fn(...this.inputs.map(input => input.value))
    }
    if (typeof newValue === 'undefined') {
      throw new Error(`ERROR: computed value is undefined`)
    }
    if (typeof newValue === 'number' && Number.isNaN(newValue)) {
      throw new Error(`ERROR: Computed NaN. Was data-inputs="..." properly specified?`)
    }
    if (newValue !== this.value) {
      this.value = newValue
      for (const dep of this.dependencies) {
        if (dep.canEval()) {
          dep.eval()
        }
      }
      this.updateDom()
    }
  }

  updateDom() {
    switch (this.el.tagName.toLowerCase()) {
      case 'input':
      case 'select':
        this.el.value = this.value
        break
      default:
        this.el.innerHTML = `${this.value}`
    }
  }
}


class Tangle {

  constructor(root = document.documentElement) {
    this.varAutogen = 0
    this.root = root
    this.variables = new Map()
  }
  init() {
    const interestingElements = this.root.querySelectorAll('[data-var],[data-fn],[data-init]')
    interestingElements.forEach(el => {
      let name = el.getAttribute('data-var')
      const fnStr = el.getAttribute('data-fn')
      const initStr = el.getAttribute('data-init')
      const fn = fnStr ? this.buildFn(fnStr) : null
      const initFn = initStr ? this.buildFn(initStr) : null
      const inputsStr = el.getAttribute('data-inputs') || ''
      const inputs = inputsStr ? inputsStr.split(',') : []

      if ((fn ? fn.length : 0) !== inputs.length) {
        throw new Error(`ERROR: data-fn arguments do not match data-inputs length`)
      }

      if (!name) {
        name = `_autogen_${this.varAutogen++}`
        el.setAttribute('data-var', name)
      }
      const variable = new Variable(el, name, fn, initFn)
      if (this.variables.has(name)) {
        throw new Error(`ERROR: Duplicate variable name "${name}"`)
      }
      this.variables.set(name, variable)
    })

    // Link up the dependencies
    interestingElements.forEach(el => {
      const name = el.getAttribute('data-var')
      const inputsStr = el.getAttribute('data-inputs') || ''
      if (!name) {
        throw new Error(`BUG: Everything _should_ have been given a var name by now`)
      }
      const variable = this.getVar(name)
      if (inputsStr) {
        variable.inputs = inputsStr.split(',').map(input => {
          const inputVar = this.getVar(input)
          inputVar.dependencies.add(variable)
          return inputVar
        })
      }
    })

    // Evaluate all the variables until nothing changed
    const evaluatedVars = new Set()
    let somethingChanged = false
    do {
      somethingChanged = false
      for (const variable of this.variables.values()) {
        if (!evaluatedVars.has(variable)) {
          if (variable.canEval()) {
            variable.eval()
            somethingChanged = true
            evaluatedVars.add(variable)
          }
  
        }
      }
    } while(somethingChanged)

    if (evaluatedVars.size !== this.variables.size) {
      for (const v of this.variables.values()) {
        if (!evaluatedVars.has(v)) {
          console.log(v)
        }
      }
      debugger
      throw new Error(`ERROR: Unable to evaluate some variables`)
    }
  }
  eval() {
    for (const variable of this.variables.values()) {
      variable.eval()
      variable.updateDom()
    }
  }
  buildFn(fnStr) {
    return new Function(`return ${fnStr}`)()
  }
  getVar(name) {
    const variable = this.variables.get(name)
    if (!variable) {
      throw new Error(`ERROR: Invalid variable name: "${name}"`)
    }
    return variable
  }
}
