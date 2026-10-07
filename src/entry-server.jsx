import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import desenho from './dados/desenho.json'
import { desenhoHTML } from './desenho-html.js'

export function render() {
  globalThis.__GB_DESENHO__ = desenhoHTML(desenho)
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
