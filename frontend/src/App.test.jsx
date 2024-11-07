import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('Echo Demo')).toBeInTheDocument()
  })

  it('renders input field and button', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Type something...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Echo' })).toBeInTheDocument()
  })

  it('handles input change', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('Type something...')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(input.value).toBe('test')
  })

  it('handles form submission', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve('TEST'),
      })
    )

    render(<App />)
    const input = screen.getByPlaceholderText('Type something...')
    const button = screen.getByRole('button', { name: 'Echo' })

    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('TEST')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/echo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify('test'),
    })
  })

  it('handles fetch error', async () => {
    global.fetch = vi.fn(() => Promise.reject('API Error'))

    render(<App />)
    const input = screen.getByPlaceholderText('Type something...')
    const button = screen.getByRole('button', { name: 'Echo' })

    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })
  })
})
