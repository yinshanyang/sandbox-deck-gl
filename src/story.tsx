import * as React from 'react'
import { storiesOf } from '@storybook/react'

const d3 = require('d3')
const { DeckGL, COORDINATE_SYSTEM, OrbitView, TextLayer } = require('deck.gl')
const { default: Controller } = require('./Controller')

const data = require('./w2v-300d-100k.json')

type Datum = {
  x: number,
  y: number,
  count: number,
  text: string
}
type Domain = [number, number]
type Domains = {
  x: Domain,
  y: Domain,
  count: Domain
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

const domains = data
  .reduce((memo: Domains, d: Datum) => ({
    x: [
      Math.min(memo.x[0], d.x),
      Math.max(memo.x[1], d.x)
    ],
    y: [
      Math.min(memo.y[0], d.y),
      Math.max(memo.y[1], d.y)
    ],
    count: [
      Math.min(memo.count[0], d.count),
      Math.max(memo.count[1], d.count)
    ]
  }), {
    x: [Infinity, -Infinity],
    y: [Infinity, -Infinity],
    count: [Infinity, -Infinity]
  })

const scales = {
  x: d3.scaleLinear().domain(domains.x).range([-1000, 1000]),
  y: d3.scaleLinear().domain(domains.y).range([-1000, 1000]),
  count: d3.scaleLog().domain(domains.count).range([8, 32]),
}

console.log(domains)
console.log(data)
console.log(data.map((d: Datum) => ({
  x: scales.x(d.x),
  y: scales.y(d.y),
  count: scales.count(d.count)
})))

const view = new OrbitView()

const layer = new TextLayer({
  id: 'layer',
  data,
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  getText: ({ text }: Datum) => text,
  getPosition: ({ x, y }: Datum) => [ scales.x(x), scales.y(y) ],
  sizeScale: 6,
  getSize: ({ count }: Datum) => scales.count(count),
  // getSize: () => 12,
  getColor: () => [0, 0, 0, 128]
})

storiesOf('Component', module)
  .add('basic', () => (
    <DeckGL
      width='100%'
      height='100%'
      initialViewState={initialViewState}
      views={[view]}
      layers={[layer]}
      controller={Controller}
    />
  ))
