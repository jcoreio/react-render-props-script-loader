// @flow

import * as React from 'react'
import loadScript, { getState } from './loadScript'
import PropTypes from 'prop-types'

export type State = {|
  loading: boolean,
  loaded: boolean,
  error: ?Error,
  promise: ?Promise<any>,
|}

export type Props = {
  src: string,
  onLoad?: ?() => any,
  onError?: ?(error: Error) => any,
  children?: ?(state: State) => ?React.Node,
  ...
}

export type InnerProps = {
  ...$Exact<Props>,
  scriptsRegistry?: ?ScriptsRegistry,
  ...
}

export class ScriptsRegistry {
  scripts: Array<{ src: string, ... }> = []
  results: { [src: string]: { error: ?Error } } = {}
  promises: { [src: string]: Promise<any> } = {}

  scriptTags(options?: {| nonce?: string |}): React.Node {
    return this.scripts.map((props) => (
      <script
        {...props}
        key={props.src}
        nonce={options ? options.nonce : undefined}
      />
    ))
  }
}

export const ScriptsRegistryContext: React.Context<?ScriptsRegistry> =
  React.createContext(null)

class ScriptLoader extends React.PureComponent<InnerProps, State> {
  mounted: boolean = false
  promise: Promise<void> = loadScript(this.props)
  state: State = getState(this.props)

  static propTypes = {
    src: PropTypes.string.isRequired,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    children: PropTypes.func,
  }

  componentDidMount() {
    this.mounted = true
    this.listenTo(this.promise)
  }

  componentWillUnmount() {
    this.mounted = false
  }

  componentDidUpdate() {
    const promise = loadScript(this.props)
    if (this.promise !== promise) {
      this.setState(getState(this.props))
      this.promise = promise
      this.listenTo(promise)
    }
  }

  listenTo(promise: Promise<any>) {
    const { props } = this
    const { onLoad, onError } = props
    promise.then(
      () => {
        if (!this.mounted || this.promise !== promise) return
        if (onLoad) onLoad()
        this.setState(getState(props))
      },
      (error: Error) => {
        if (!this.mounted || this.promise !== promise) return
        if (onError) onError(error)
        this.setState(getState(props))
      }
    )
  }

  render(): React.Node {
    const { children } = this.props
    if (children) {
      const result = children({ ...this.state })
      return result == null ? null : result
    }
    return null
  }
}

const ConnectedScriptsLoader: React.ComponentType<Props> = (props: Props) => (
  <ScriptsRegistryContext.Consumer>
    {(scriptsRegistry) => (
      <ScriptLoader {...props} scriptsRegistry={scriptsRegistry} />
    )}
  </ScriptsRegistryContext.Consumer>
)
export default ConnectedScriptsLoader
