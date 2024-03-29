import { createHash } from 'crypto'
import { existsSync, writeFile, readFile } from 'fs'
import { join } from 'path'

export const persistedMemoize = (cacheDir, scope) =>
  originalFn =>
    (...args) => new Promise((resolve, reject) => {
      const hash = createHash('md5').update(JSON.stringify(args)).digest('hex')

      const cachedFile = join(cacheDir, `${scope}_${hash}`)

      if (existsSync(cachedFile)) {
        return readFile(cachedFile, 'utf8', (err, data) => {
          if (err) {
            return reject(err)
          }

          resolve(JSON.parse(data))
        })
      }

      return resolve(
        originalFn(...args)
          .then(
            originalData => new Promise(resolve =>
              writeFile(cachedFile, JSON.stringify(originalData, null, 2), 'utf8', () => resolve(originalData))
            )
          )
      )
    })

export default persistedMemoize
