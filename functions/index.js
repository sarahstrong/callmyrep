// Copyright 2018, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
/* eslint-disable */

/** EXPORT ALL FUNCTIONS
 *
 *   - Loads all `.function.js` files
 *   - Supports multiple exports from a single `.function.js` file
 *   - It is optimized with `FUNCTION_NAME` env and omiting `node_modules` as well
 *   - Every function from any file must have unique name
 *   - Default export is not supported (`module.exports = ...`), instead use: `module.exports.functionName = ...`
 *
 *   Based on this thread:
 *     https://github.com/firebase/functions-samples/issues/170
 */
const glob = require('glob') // npm i -S glob
const files = glob.sync('./**/*.function.js', { cwd: __dirname, ignore: './node_modules/**' })

files.forEach(file => {
  const functionModule = require(file)
  const functionNames = Object.keys(functionModule)

  functionNames.forEach(functionName => {
    if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName) {
      exports[functionName] = functionModule[functionName]
    }
  })
})
