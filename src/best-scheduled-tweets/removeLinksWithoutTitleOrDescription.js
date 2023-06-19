import debug from 'debug'

const d = debug('removeLinksWithoutTitleOrDescription')

export const removeLinksWithoutTitleOrDescription = (links) => {
  d('Input', links)

  const result = links.filter(link => link && link.title && link.description)

  d('Output', result)

  return result
}

export default removeLinksWithoutTitleOrDescription
