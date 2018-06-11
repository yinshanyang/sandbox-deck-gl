import * as React from 'react'
import { storiesOf } from '@storybook/react'

const d3 = require('d3')
const { DeckGL, COORDINATE_SYSTEM, OrbitView, TextLayer } = require('deck.gl')
const { default: Controller } = require('./Controller')

type Position = [number, number]
type Datum = {
  text: string,
  position: Position,
  size: number
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

const scales = {
  x: d3.scaleLinear().domain([0, 1]).range([-1000, 1000]),
  y: d3.scaleLinear().domain([0, 1]).range([-1000, 1000]),
  s: d3.scaleLinear().domain([0, 1]).range([8, 16]),
}

const n = ~~(Math.random() * 1000 * 1000) + 1000
const generateData = (_: any, index: any) => ({
  text: index.toString(),
  position: [Math.random(), Math.random()],
  size: Math.random()
})
const data = Array(n).fill(0).map(generateData)


const view = new OrbitView()

const layer = new TextLayer({
  id: 'layer',
  data,
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  getText: ({ text }: Datum) => text,
  getPosition: ({ position }: Datum) => [ scales.x(position[0]), scales.y(position[1]) ],
  sizeScale: 6,
  getSize: ({ size }: Datum) => scales.s(size),
  getColor: () => [0, 0, 0, 50]
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
