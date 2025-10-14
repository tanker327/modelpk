import { atom } from '@zedux/react'

// Example atom to demonstrate Zedux state management
export const exampleAtom = atom('example', (name: string = 'World') => {
  return `Hello, ${name}!`
})
