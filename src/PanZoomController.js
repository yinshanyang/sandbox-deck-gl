import { clamp } from 'math.gl'
import { Controller, experimental } from 'deck.gl'

const { OrbitViewport } = experimental

const defaultState = {
  fov: 50,
  near: 1,
  far: 100,
  translationX: 0,
  translationY: 0,
  zoom: 1
}

const defaultConstraints = {
  minZoom: 0,
  maxZoom: Infinity
}

/* Helpers */
function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue
}

class OrbitState {
  constructor({
    /* Viewport arguments */
    width, // Width of viewport
    height, // Height of viewport
    distance, // From eye to target
    // Bounding box of the model, in the shape of {minX, maxX, minY, maxY, minZ, maxZ}
    bounds,

    /* View matrix arguments */
    lookAt, // Which point is camera looking at, default origin

    /* Projection matrix arguments */
    fov, // Field of view covered by camera
    near, // Distance of near clipping plane
    far, // Distance of far clipping plane

    /* After projection */
    translationX, // in pixels
    translationY, // in pixels
    zoom,

    /* Viewport constraints */
    minZoom,
    maxZoom,

    /** Interaction states, required to calculate change during transform */
    // Model state when the pan operation first started
    startPanViewport,
    startPanPos,
    isPanning,
    // Model state when the rotate operation first started
    startRotateViewport,
    isRotating,
    // Model state when the zoom operation first started
    startZoomViewport,
    startZoomPos
  }) {
    // assert(Number.isFinite(width), '`width` must be supplied')
    // assert(Number.isFinite(height), '`height` must be supplied')
    // assert(Number.isFinite(distance), '`distance` must be supplied')

    this._viewportProps = this._applyConstraints({
      width,
      height,
      distance,
      bounds,

      lookAt: lookAt,

      fov: ensureFinite(fov, defaultState.fov),
      near: ensureFinite(near, defaultState.near),
      far: ensureFinite(far, defaultState.far),
      translationX: ensureFinite(translationX, defaultState.translationX),
      translationY: ensureFinite(translationY, defaultState.translationY),
      zoom: ensureFinite(zoom, defaultState.zoom),

      minZoom: ensureFinite(minZoom, defaultConstraints.minZoom),
      maxZoom: ensureFinite(maxZoom, defaultConstraints.maxZoom)
    })

    this._interactiveState = {
      startPanViewport,
      startPanPos,
      isPanning,
      startZoomViewport,
      startZoomPos
    }
  }

  /* Public API */

  getViewportProps() {
    return this._viewportProps
  }

  getInteractiveState() {
    return this._interactiveState
  }

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({ pos }) {
    const viewport = new OrbitViewport(this._viewportProps)

    return this._getUpdatedOrbitState({
      startPanPos: pos,
      startPanViewport: viewport
    })
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({pos, startPos}) {
    const startPanPos = this._interactiveState.startPanPos || startPos

    const viewport =
      this._interactiveState.startPanViewport || new OrbitViewport(this._viewportProps)

    const deltaX = pos[0] - startPanPos[0]
    const deltaY = pos[1] - startPanPos[1]

    const center = viewport.project(viewport.lookAt)
    const newLookAt = viewport.unproject([center[0] - deltaX, center[1] - deltaY, center[2]])

    return this._getUpdatedOrbitState({
      lookAt: newLookAt,
      isPanning: true
    })
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this._getUpdatedOrbitState({
      startPanViewport: null,
      startPanPos: null,
      isPanning: null
    })
  }

  /**
   * Start rotating
   */
  rotateStart() { return this._getUpdatedOrbitState() }

  /**
   * Rotate
   */
  rotate() { return this._getUpdatedOrbitState() }

  /**
   * End rotating
   */
  rotateEnd() { return this._getUpdatedOrbitState() }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart({pos}) {
    const viewport = new OrbitViewport(this._viewportProps)
    return this._getUpdatedOrbitState({
      startZoomViewport: viewport,
      startZoomPos: pos
    })
  }

  /**
   * Zoom
   * @param {[Number, Number]} pos - position on screen where the current center is
   * @param {[Number, Number]} startPos - the center position at
   *   the start of the operation. Must be supplied of `zoomStart()` was not called
   * @param {Number} scale - a number between [0, 1] specifying the accumulated
   *   relative scale.
   */
  zoom({pos, startPos, scale}) {
    const {zoom, minZoom, maxZoom, width, height} = this._viewportProps
    const startZoomPos = this._interactiveState.startZoomPos || startPos || pos
    const viewport =
      this._interactiveState.startZoomViewport || new OrbitViewport(this._viewportProps)

    const newZoom = clamp(zoom * scale, minZoom, maxZoom)
    const deltaX = pos[0] - startZoomPos[0]
    const deltaY = pos[1] - startZoomPos[1]

    // Zoom around the center position
    const cx = startZoomPos[0] - width / 2
    const cy = height / 2 - startZoomPos[1]
    const center = viewport.project(viewport.lookAt)
    const newCenterX = center[0] - cx + cx * newZoom / zoom + deltaX
    const newCenterY = center[1] + cy - cy * newZoom / zoom - deltaY

    const newLookAt = viewport.unproject([newCenterX, newCenterY, center[2]])

    return this._getUpdatedOrbitState({
      lookAt: newLookAt,
      zoom: newZoom
    })
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedOrbitState({
      startZoomPos: null
    })
  }

  /* Private methods */

  _getUpdatedOrbitState(newProps) {
    // Update _viewportProps
    return new OrbitState(Object.assign({}, this._viewportProps, this._interactiveState, newProps))
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    // Ensure zoom is within specified range
    const {maxZoom, minZoom, zoom} = props
    props.zoom = zoom > maxZoom ? maxZoom : zoom
    props.zoom = zoom < minZoom ? minZoom : zoom

    return props
  }
}

export default class OrbitController extends Controller {
  constructor(props) {
    super(OrbitState, props)
    this.invertPan = true
  }
}
