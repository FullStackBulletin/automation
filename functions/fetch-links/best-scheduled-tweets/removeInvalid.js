import debug from 'debug'

const d = debug('removeInvalid')

export const removeInvalid = (arr) => {
  d('Input', arr)

  const result = arr.filter((elem) => {
    if (typeof elem === 'undefined') {
      return false
    }

    const url = typeof elem.id === 'undefined' ? elem : elem.id

    return /^https?:\/\//i.test(url)
  })

  d('Output', result)

  return result
}

export default removeInvalid
