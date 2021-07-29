'use strict';
const puml = require('./plugin/puml')
const katex = require('katex')
const texmath = require('markdown-it-texmath').use(katex)

module.exports = {
  anchor: { permalink: false },
  // options for markdown-it-toc
  toc: { includeLevel: [1, 2] },  
  extendMarkdown: md => {
    md.set({ html: true })
    md.use(puml)
    md.use(texmath)
  }
}