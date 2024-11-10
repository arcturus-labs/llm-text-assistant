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

})
