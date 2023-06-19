export const flatten = arr => arr.reduce((acc, current) => {
  acc.push(...current)
  return acc
}, [])

export default flatten
