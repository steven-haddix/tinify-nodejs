"use strict"

const tinify = require("../tinify")

const readFile = require("./compat").readFile

class Source {
  constructor(url, commands) {
    this._url = url
    this._commands = commands || {}
  }

  static fromFile(path) {
    const location = readFile(path).then(string => {
      const response = tinify.client.request("post", "/shrink", string)
      return response.then(res => res.headers.location)
    })

    return new tinify.Source(location)
  }

  static fromBuffer(string) {
    const response = tinify.client.request("post", "/shrink", string)
    const location = response.then(res => res.headers.location)
    return new tinify.Source(location)
  }

  static fromUrl(url) {
    const response = tinify.client.request("post", "/shrink", {source: {url: url}})
    const location = response.then(res => res.headers.location)
    return new tinify.Source(location)
  }

  preserve() {
    const options = Array.prototype.concat.apply([], arguments)
    return new tinify.Source(this._url, Object.assign({preserve: options}, this._commands))
  }

  resize(options) {
    return new tinify.Source(this._url, Object.assign({resize: options}, this._commands))
  }

  store(options) {
    const commands = Object.assign({store: options}, this._commands)
    const response = this._url.then(url => {
      return tinify.client.request("post", url, commands)
    })

    return new tinify.ResultMeta(
      response.then(res => res.headers)
    )
  }

  result() {
    const commands = this._commands
    const response = this._url.then(url => {
      return tinify.client.request("get", url, commands)
    })

    return new tinify.Result(
      response.then(res => res.headers),
      response.then(res => res.body)
    )
  }

  toFile(path, callback) {
    return this.result().toFile(path, callback)
  }

  toBuffer(callback) {
    return this.result().toBuffer(callback)
  }

}

module.exports = Source
