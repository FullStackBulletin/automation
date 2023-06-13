import values from 'object-values'
import { get } from 'object-path'
import debug from 'debug'

const d = debug('uniqueBy')

export const uniqueBy = keyPath => (arr) => {
  d('Input', { keyPath, arr })

  const result = values(
    arr.reduce((dict, current) => {
      const key = get(current, keyPath)
      const newDict = dict
      if (!Object.prototype.hasOwnProperty.call(dict, key)) {
        newDict[key] = current
      }

      return newDict
    }, {})
  )

  d('Output', result)

  return result
}

export default uniqueBy
