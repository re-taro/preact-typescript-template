import { h, render } from 'preact'
import { App } from './app'
import './main.css'

const root = document.querySelector('#root')
if (root) {
  render(<App />, root)
}
