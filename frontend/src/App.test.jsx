import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

describe('App Component', () => {
  it('renders chat input and send button', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('handles input change', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'test message' } })
    expect(input.value).toBe('test message')
  })

  it('handles message submission', async () => {
    const mockResponse = {
      status: 'success',
      messages: [
        { role: 'user', content: 'test message' },
        { role: 'assistant', content: 'Test response' }
      ],
      artifacts: []
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse)
      })
    )

    render(<App />)
    const input = screen.getByPlaceholderText('Type your message...')
    const button = screen.getByText('Send')

    fireEvent.change(input, { target: { value: 'test message' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('test message')).toBeInTheDocument()
      expect(screen.getByText('Test response')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test message' }],
        artifacts: []
      })
    })
  })

  it('handles API error', async () => {
    global.fetch = vi.fn(() => Promise.reject('API Error'))

    render(<App />)
    const input = screen.getByPlaceholderText('Type your message...')
    const button = screen.getByText('Send')

    fireEvent.change(input, { target: { value: 'test message' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to send message')).toBeInTheDocument()
    })
  })
})
