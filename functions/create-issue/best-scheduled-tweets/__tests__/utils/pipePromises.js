import { test, expect } from 'vitest'
import { pipePromises } from '../../utils/pipePromises.js'

test('It should pipe promises', async () => {
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
})

test('It should reject if one promise rejects', async () => {
  await expect(pipePromises(
    1,
    () => Promise.reject(new Error('some error'))
  )).rejects.toThrow('some error')
})
