export const pipePromises = (initialPromise, ...promiseFns) =>
  promiseFns.reduce((acc, promiseFn) =>
    Promise.resolve(acc).then(promiseFn),
  initialPromise
  )

export default pipePromises
