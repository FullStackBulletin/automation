import debug from 'debug'

const d = debug('keepMinimalData')

export const keepMinimalData = (urlsInfo) => {
  d('Input', urlsInfo)

  const result = urlsInfo.map(({
    title, url, description, image, score
  }) => ({
    title,
    url,
    description,
    image,
    score
  }))

  d('Output', result)

  return result
}

export default keepMinimalData
