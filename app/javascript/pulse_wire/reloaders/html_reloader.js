import { Idiomorph } from "idiomorph/dist/idiomorph.esm.js"

export class HtmlReloader {
  static async reload() {
    return new HtmlReloader().reload()
  }

  async reload() {
    try {
      const reloadedDocument = await this.#reloadDocument()

      this.#updateHead(reloadedDocument.head)
      this.#updateBody(reloadedDocument.body)
    } catch (error) {
      console.error("Error reloading HTML:", error)
    }
  }

  async #reloadDocument() {
    const response = await fetch(this.#reloadUrl)
    const fetchedHTML = await response.text()
    const parser = new DOMParser()
    return parser.parseFromString(fetchedHTML, "text/html")
  }

  get #reloadUrl() {
    const url = new URL(window.location.href)
    url.searchParams.set("pulse_wire", "true")
    return url.toString()
  }

  #updateHead(newHead) {
    Idiomorph.morph(document.head, newHead)
  }

  #updateBody(newBody) {
    Idiomorph.morph(document.body, newBody, {
      callbacks: {
        beforeNodeMorphed: function (oldNode, newNode) {
          const value = !(oldNode instanceof HTMLElement) || !oldNode.closest("turbo-cable-stream-source")
          return value
        }
      }
    })
  }
}