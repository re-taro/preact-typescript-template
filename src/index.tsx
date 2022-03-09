import { h, render } from 'preact'
import { App } from './app'
// eslint-disable-next-line import/no-unresolved
import 'virtual:windi.css'

const root = document.querySelector('#root')
if (root) {
  render(<App />, root)
}
