import debug from 'debug'

const d = debug('takeN')

export const takeN = n => (arr) => {
  d('Input', arr)

  const result = arr.slice(0, n)

  d('Output', result)

  return result
}

export default takeN
