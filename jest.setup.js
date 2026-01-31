// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Set NODE_ENV to test to enable React's development mode
process.env.NODE_ENV = 'test'

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill for Request and Response (used by Next.js server components)
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = input
      this.method = init?.method || 'GET'
      this.headers = init?.headers || {}
    }
  }
}

if (typeof global.Response === 'undefined') {
  // Simple Headers implementation
  class Headers {
    constructor(init = {}) {
      this._headers = new Map()
      Object.entries(init).forEach(([key, value]) => {
        this._headers.set(key.toLowerCase(), String(value))
      })
    }

    get(name) {
      return this._headers.get(name.toLowerCase()) || null
    }

    set(name, value) {
      this._headers.set(name.toLowerCase(), String(value))
    }

    has(name) {
      return this._headers.has(name.toLowerCase())
    }
  }

  global.Headers = Headers

  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Headers(init.headers || {})
      this.ok = this.status >= 200 && this.status < 300
      this._jsonData = null
    }

    static json(data, init = {}) {
      const headers = {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      }
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers,
      })
      response._jsonData = data
      return response
    }

    async json() {
      if (this._jsonData !== null) {
        return this._jsonData
      }
      return JSON.parse(this.body || '{}')
    }

    async text() {
      return String(this.body || '')
    }
  }
}

// Configure the global test environment for React's concurrent mode
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock Next.js app directory components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Suppress all console warnings and errors during tests
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = jest.fn() // Suppress all errors
  console.warn = jest.fn() // Suppress all warnings
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

// Mock localStorage globally for tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage globally for tests
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock Request and Response for Next.js server components
global.Request = class Request {
  constructor(input, init) {
    this.url = input
    this.method = init?.method || 'GET'
    this.headers = {
      get: jest.fn(),
      ...init?.headers,
    }
  }
}

global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || ''
    this.headers = new Map(Object.entries(init?.headers || {}))
  }

  // Add json method to Response
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  // Static json method for NextResponse
  static json(data, init = {}) {
    const response = new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...init.headers,
      },
    })
    response._jsonData = data
    return response
  }
}

// Mock Headers API
global.Headers = class Headers extends Map {
  constructor(init) {
    super(Object.entries(init || {}))
  }

  get(name) {
    return super.get(name.toLowerCase())
  }

  set(name, value) {
    return super.set(name.toLowerCase(), value)
  }

  has(name) {
    return super.has(name.toLowerCase())
  }
}
