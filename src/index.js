// @flow

import * as React from 'react'
import loadScript, {getState} from './loadScript'
import PropTypes from 'prop-types'

export type State = {
  loading: boolean,
  loaded: boolean,
  error: ?Error,
  promise: ?Promise<any>,
}

export type Props = {
  src: string,
  onLoad?: ?() => any,
  onError?: ?(error: Error) => any,
  children?: ?(state: State) => ?React.Node,
}

export default class ScriptLoader extends React.PureComponent<Props, State> {
  state = getState(this.props)
  promise: ?Promise<void>

  static propTypes = {
    src: PropTypes.string.isRequired,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    children: PropTypes.func,
  }

  load() {
    const {props} = this
    const {
      onLoad, onError,
      children, // eslint-disable-line no-unused-vars
      ...loadProps
    } = props
    const promise = loadScript(loadProps)
    if (this.promise !== promise) {
      this.promise = promise
      this.setState(getState(props))
      promise.then(
        () => {
          if (this.promise !== promise) return
          if (onLoad) onLoad()
          this.setState(getState(props))
        },
        (error: Error) => {
          if (this.promise !== promise) return
          if (onError) onError(error)
          this.setState(getState(props))
        }
      )
    }
  }

  componentDidMount() {
    this.load()
  }

  componentDidUpdate() {
    this.load()
  }

  componentWillUnmount() {
    this.promise = null
  }

  render(): ?React.Node {
    const {children} = this.props
    if (children) return children({...this.state})
  }
}
