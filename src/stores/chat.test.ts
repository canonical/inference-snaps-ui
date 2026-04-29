import { describe, expect, it } from 'vitest'
import { patchOpenAIBaseURLForCurrentHost } from './chat'

describe('patchOpenAIBaseURLForCurrentHost', () => {
  it('rewrites localhost base URLs to the current page hostname and preserves the port and path', () => {
    const result = patchOpenAIBaseURLForCurrentHost('http://localhost:8334/v1', {
      hostname: 'app.example.com',
      href: 'https://app.example.com/dashboard',
    })

    expect(result).toBe('http://app.example.com:8334/v1')
  })

  it('rewrites localhost base URLs to the current page hostname and preserves the port and path', () => {
    const result = patchOpenAIBaseURLForCurrentHost('http://localhost:8334/v1', {
      hostname: '10.10.140.47',
      href: 'https://10.10.140.47/some/page',
    })

    expect(result).toBe('http://10.10.140.47:8334/v1')
  })

  it('does not rewrite the base URL when the page hostname is localhost', () => {
    const result = patchOpenAIBaseURLForCurrentHost('http://localhost:8334/v1', {
      hostname: 'localhost',
      href: 'http://localhost:5173/',
    })

    expect(result).toBe('http://localhost:8334/v1')
  })

  it('does not rewrite the base URL when the page hostname is 127.0.0.1', () => {
    const result = patchOpenAIBaseURLForCurrentHost('http://localhost:8334/v1', {
      hostname: '127.0.0.1',
      href: 'http://127.0.0.1:5173/',
    })

    expect(result).toBe('http://localhost:8334/v1')
  })

  it('returns the original value when the input is not a valid URL', () => {
    const result = patchOpenAIBaseURLForCurrentHost('not-a-valid-url', {
      hostname: 'app.example.com',
      href: 'https://app.example.com/',
    })

    expect(result).toBe('not-a-valid-url')
  })
})
