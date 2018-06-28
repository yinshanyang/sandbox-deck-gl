import * as React from 'react'
import { PureComponent } from 'react'
import { storiesOf } from '@storybook/react'
import 'ui-tachyons-light'

const d3 = require('d3')
const { DeckGL, COORDINATE_SYSTEM, OrbitView, TextLayer } = require('deck.gl')
const { default: PanZoomController } = require('./PanZoomController')
const { default: InvariantScatterplotLayer } = require('./InvariantScatterplotLayer/InvariantScatterplotLayer')

type Datum = {
  x: number,
  y: number,
  z: number,
  text: string
}
type Domain = [number, number]

const width = window.innerWidth
const height = window.innerHeight

const initialViewState = {
  distance: 0.75,
  width,
  height,
  zoom: 0.0005
}

const view = new OrbitView()

const DATA = Array(10 * 1000 * 1000).fill(0).map((_, index): Datum => ({
  text: index.toString(),
  x: Math.random(),
  y: Math.random(),
  z: Math.random()
}))

class Component extends PureComponent {
  state = {
    scale: 3,
    quantile: 0.995,
    text: {
      base: 'dot',
      count: 'dot'
    },
    data: {
      base: DATA,
      count: []
    }
  }

  componentDidMount () {
    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  getScales = () => {
    const { scale, quantile, data } = this.state
    const { base, count } = data

    const xDomain = base.reduce((memo: Domain, d: Datum) => [
      Math.min(memo[0], d.x),
      Math.max(memo[1], d.x)
    ], [Infinity, -Infinity])
    const yDomain = base.reduce((memo: Domain, d: Datum) => [
      Math.min(memo[0], d.y),
      Math.max(memo[1], d.y)
    ], [Infinity, -Infinity])
    // const zDomain = count.reduce((memo: Domain, d: Datum) => [
    //   Math.min(memo[0], d.z),
    //   Math.max(memo[1], d.z)
    // ], [Infinity, -Infinity])
    const zDomain = [
      count.map(({ z }: Datum) => z).reduce((memo, d) => Math.min(memo, d), Infinity),
      d3.quantile(count.map(({ z }: Datum) => z).sort((a, b) => a > b ? 1 : a < b ? -1 : 0), quantile)
    ]

    const scales = {
      x: d3.scaleLinear().domain(xDomain).range([-1000, 1000]),
      y: d3.scaleLinear().domain(yDomain).range([-1000, 1000]),
      z: d3.scalePow(0.5).domain(zDomain).range([1, 16 * scale]).clamp(true)
    }

    return scales
  }

  getBaseLayer = () => {
    const { text, data } = this.state
    const scales = this.getScales()

    const baseLayer = text.base === 'text'
      ? new TextLayer({
        id: 'baseLayer-text',
        data: data.base,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        fontFamily: 'Fira Code, Monaco, monospace',
        getText: ({ text }: Datum) => text,
        getPosition: ({ x, y }: Datum) => [ scales.x(x), scales.y(y) ],
        getSize: () => 16,
        getColor: () => [128, 128, 128, 64]
      })
      : new InvariantScatterplotLayer({
        id: 'baseLayer-dot',
        data: data.base,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: ({ x, y }: Datum) => [ scales.x(x), scales.y(y)],
        getRadius: 3,
        getColor: () => [88, 88, 88, 64]
      })

    return baseLayer
  }

  getCountLayer = () => {
    const { text, data } = this.state
    const scales = this.getScales()

    const countLayer = text.count === 'text'
      ? new TextLayer({
        id: 'countLayer-text',
        data: data.count,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        fontFamily: 'Fira Code, Monaco, monospace',
        getText: ({ text }: Datum) => text,
        getPosition: ({ x, y }: Datum) => [ scales.x(x), scales.y(y) ],
        getSize: ({ z }: Datum) => scales.z(z),
        getColor: [255, 0, 0, 255]
      })
      : new InvariantScatterplotLayer({
        id: 'countLayer-dots',
        data: data.count,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: ({ x, y }: Datum) => [ scales.x(x), scales.y(y), 0],
        getRadius: () => 6,
        getColor: () => [20, 20, 20, 255]
      })

    return countLayer
  }

  render () {
    const { scale, quantile } = this.state
    const layers = [
      this.getBaseLayer(),
      this.getCountLayer()
    ]

    return (
      <div className='w-100 h-100 f7 bg-foreground-100'>
        <DeckGL
          width='100%'
          height='100%'
          initialViewState={initialViewState}
          views={[view]}
          layers={layers}
          controller={PanZoomController}
        />
        <div className='absolute top-1 left-1 pa1 background-100 bg-foreground-80'>
          <div className='h1 pa1 flex flex-row items-center'>
            <label className='db w3 flex-none'>Scale:</label>
            <input className='db flex-auto' type='range' value={scale} min='1' max='16' step='0.1' onChange={this.handleViewChange('scale')} />
          </div>
          <div className='h1 pa1 flex flex-row items-center'>
            <label className='db w3 flex-none'>Quantile:</label>
            <input className='db flex-auto' type='range' value={quantile} min='0.95' max='1' step='0.001' onChange={this.handleViewChange('quantile')} />
          </div>
        </div>
        <div className='absolute top-1 right-1 pa1 background-100 bg-foreground-80'>
          <div className='h1 pa1 flex flex-row items-center'>
            <label className='db w3 flex-none'>Base:</label>
            <input type='file' className='db flex-auto' onChange={this.handleDataScale('base')} />
          </div>
          <div className='h1 pa1 flex flex-row items-center'>
            <label className='db w3 flex-none'>Topic:</label>
            <input type='file' className='db flex-auto' onChange={this.handleDataScale('count')} />
          </div>
        </div>
      </div>
    )
  }

  handleViewChange = (key: string) => (evt: any) => {
    this.setState({
      [key]: evt.target.value,
      data: {
        ...this.state.data,
        count: this.state.data.count.slice()
      }
    })
  }

  parseCsv = (csv: string) => {
    const data = d3.csvParseRows(
      csv,
      ([ text, x, y, z ]: string[]) => ({
        text,
        x: +x,
        y: +y,
        z: +z
      })
    )
    return data
  }

  handleDataScale = (key: string) => (evt: any) => {
    const file = evt.target.files[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const data = this.parseCsv(reader.result)
      this.setState({
        data: {
          ...this.state.data,
          [key]: data
        }
      })
    }
    reader.readAsText(file)
  }

  handleKeyDown = (evt: any) => {
    if (evt.keyCode === 32) {
      if (evt.shiftKey) {
        this.setState({
          text: {
            ... this.state.text,
            base: this.state.text.base === 'text' ? 'dot' : 'text'
          }
        })
      }
      else {
        this.setState({
          text: {
            ... this.state.text,
            count: this.state.text.count === 'text' ? 'dot' : 'text'
          }
        })
      }
      this.setState({
        data: {
          base: this.state.data.base.slice(),
          count: this.state.data.count.slice()
        }
      })
    }
  }
}

storiesOf('Component', module)
  .add('basic', () => (
    <Component />
  ))
