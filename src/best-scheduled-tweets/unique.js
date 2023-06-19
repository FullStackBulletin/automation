import debug from 'debug'

const d = debug('unique')

export const unique = (arr) => {
  d('Input', arr)

  const result = Array.from(new Set(arr))

  d('Output', result)

  return result
}

export default unique
