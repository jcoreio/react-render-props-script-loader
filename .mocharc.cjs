/* eslint-env node, es2018 */
const base = require('@jcoreio/toolchain-mocha/.mocharc.cjs')
module.exports = {
  ...base,
  require: [...base.require, require.resolve('./test/configure.js')],
}
