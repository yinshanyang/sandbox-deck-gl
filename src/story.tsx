import * as React from 'react'
import { PureComponent } from 'react'
import { storiesOf } from '@storybook/react'
import 'ui-tachyons-light'

const d3 = require('d3')
const { DeckGL, COORDINATE_SYSTEM, OrbitView, TextLayer } = require('deck.gl')
const { default: Controller } = require('./Controller')

type Datum = {
  x: number,
  y: number,
  text: string
}
type Domain = [number, number]
type Domains = {
  x: Domain,
  y: Domain
}

const width = window.innerWidth
const height = window.innerHeight

const initialViewState = {
  lookAt: [0, 0, 0],
  distance: 3,
  rotationX: 0,
  rotationOrbit: 0,
  orbitAxis: 'Y',
  minDistance: 1,
  maxDistance: 10,
  width,
  height
}

const view = new OrbitView()

class Component extends PureComponent {
  state = {
    text: 'text',
    data: []
  }

  componentDidMount () {
    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  getScales = (data: Datum[]) => {
    const domains = data
      .reduce((memo: Domains, d: Datum) => ({
        x: [
          Math.min(memo.x[0], d.x),
          Math.max(memo.x[1], d.x)
        ],
        y: [
          Math.min(memo.y[0], d.y),
          Math.max(memo.y[1], d.y)
        ]
      }), {
        x: [Infinity, -Infinity],
        y: [Infinity, -Infinity]
      })

    const scales = {
      x: d3.scaleLinear().domain(domains.x).range([-1000, 1000]),
      y: d3.scaleLinear().domain(domains.y).range([-1000, 1000])
    }

    return scales
  }

  render () {
    const { data, text } = this.state
    const scales = this.getScales(data)

    const getText = text === 'text'
      ? ({ text }: Datum) => text
      : () => '.'

    const layer = new TextLayer({
      id: 'layer',
      data,
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      getText: getText,
      getPosition: ({ x, y }: Datum) => [ scales.x(x), scales.y(y) ],
      sizeScale: 6,
      // getSize: ({ count }: Datum) => scales.count(count),
      getSize: () => 12,
      getColor: () => [0, 0, 0, 64]
    })

    return (
      <div className='w-100 h-100 f7'>
        <DeckGL
          width='100%'
          height='100%'
          initialViewState={initialViewState}
          views={[view]}
          layers={[layer]}
          controller={Controller}
        />
        <button className='absolute top-1 left-1' onClick={this.handleToggle}>
          magic
        </button>
        <input type='file' className='absolute top-1 right-1' onChange={this.handleChange} />
      </div>
    )
  }

  parseCsv = (csv: string) => {
    const data = d3.csvParseRows(
      csv,
      ([ text, x, y ]: string[]) => ({
        text,
        x: +x,
        y: +y
      })
    )
    this.setState({ data })
  }

  handleChange = (evt: any) => {
    const file = evt.target.files[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => this.parseCsv(reader.result)
    reader.readAsText(file)
  }

  handleToggle = () => this.setState({ text: this.state.text === 'text' ? 'dots' : 'text', data: this.state.data.slice() })

  handleKeyDown = (evt: any) => evt.keyCode === 32 && this.handleToggle()
}

storiesOf('Component', module)
  .add('basic', () => (
    <Component />
  ))
