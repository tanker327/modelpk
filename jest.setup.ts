import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill TextEncoder/TextDecoder for react-router-dom
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Mock problematic ESM modules that Jest can't parse
jest.mock('@uiw/react-markdown-preview', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@microlink/react-json-view', () => ({
  __esModule: true,
  default: () => null,
}))
