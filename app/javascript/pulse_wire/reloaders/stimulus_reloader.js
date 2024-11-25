import { Application } from "@hotwired/stimulus"

export class StimulusReloader {
  #controllerAttribute = "data-controller"
  #importmapSelector = "script[type=importmap]"
  #application

  static async reload() {
    return new StimulusReloader().reload()
  }

  constructor() {
    this.#application = window.Stimulus || Application.start()
  }

  async reload() {
    this.#application.stop()

    await this.#reloadStimulusControllers()

    this.#application.start()
  }

  async #reloadStimulusControllers() {
    await Promise.all(
      this.#stimulusControllerPaths.map(async moduleName => this.#reloadStimulusController(moduleName))
    )
  }

  get #stimulusControllerPaths() {
    return Object.keys(this.#stimulusPathsByModule).filter(path => path.endsWith("_controller"))
  }

  get #stimulusPathsByModule() {
    this.pathsByModule = this.pathsByModule || this.#parseImportmapJson()
    return this.pathsByModule
  }

  async #reloadStimulusController(moduleName) {
    const controllerName = this.#extractControllerName(moduleName)
    const path = this.#pathForModuleName(moduleName) + "?bust_cache=" + Date.now()

    const module = await import(path)

    this.#registerController(controllerName, module)
  }

  #pathForModuleName(moduleName) {
    return this.#stimulusPathsByModule[moduleName];
  }

  #parseImportmapJson() {
    const importmapScript = document.querySelector(this.#importmapSelector)
    return JSON.parse(importmapScript.text).imports
  }

  #extractControllerName(path) {
    return path
      .replace(/^.*\//, "")
      .replace("_controller", "")
      .replace(/\//g, "--")
      .replace(/_/g, "-")
  }

  #registerController(name, module) {
    this.#application.unload(name)
    this.#application.register(name, module.default)
  }
}
