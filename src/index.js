// @flow

import * as React from 'react'
import loadScript, { getState } from './loadScript'
import PropTypes from 'prop-types'

export type State = {
  loading: boolean,
  loaded: boolean,
  error: ?Error,
  promise: ?Promise<any>,
}

export type Props = {
  src: string,
  type?: ?string,
  onLoad?: ?() => any,
  onError?: ?(error: Error) => any,
  children?: ?(state: State) => ?React.Node,
}

export const ScriptsRegistryContext: React.Context<?ScriptsRegistry> = React.createContext(
  null
)

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
    const { props } = this
    const {
      onLoad,
      onError,
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

  render(): React.Node {
    const { children, type, src } = this.props
    return (
      <ScriptsRegistryContext.Consumer>
        {(context: ?ScriptsRegistry) => {
          if (context) {
            context.scripts.push({ type, src })
            if (!children) return <React.Fragment />
            const result = children({
              loading: true,
              loaded: false,
              error: null,
              promise: new Promise(() => {}),
            })
            return result == null ? null : result
          }
          if (children) {
            const result = children({ ...this.state })
            return result == null ? null : result
          }
          return null
        }}
      </ScriptsRegistryContext.Consumer>
    )
  }
}

export class ScriptsRegistry {
  scripts: Array<{
    type?: ?string,
    src: string,
  }> = []

  scriptTags(): React.Node {
    return (
      <React.Fragment>
        {this.scripts.map(({ type, src }, index) => (
          <script key={index} type={type} src={src} />
        ))}
      </React.Fragment>
    )
  }
}
