import { pipePromises } from '../../utils/pipePromises'

test('It should pipe promises', async (endTest) => {
  const add = n => value => new Promise((resolve) => {
    setTimeout(resolve(value + n), 1)
  })

  expect(pipePromises(
    1,
    add(1),
    add(2),
    add(3),
    add(4)
  )).resolves.toEqual(11)

  endTest()
})

test('It should reject if one promise rejects', async (endTest) => {
  await expect(pipePromises(
    1,
    () => Promise.reject(new Error('some error'))
  )).rejects.toThrow('some error')

  endTest()
})
