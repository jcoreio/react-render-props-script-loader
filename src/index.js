// @flow

import * as React from 'react'
import loadScript, { getState } from './loadScript'

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
  act?: ?(action: () => void) => void,
  ...
}

export type InnerProps = {
  ...$Exact<Props>,
  scriptsRegistry?: ?ScriptsRegistry,
  ...
}

export function useScript(props: Props): State {
  const isMounted = React.useRef(true)
  React.useEffect(
    () => () => {
      isMounted.current = false
    },
    []
  )

  const scriptsRegistry = React.useContext(ScriptsRegistryContext)

  const [, rerender] = React.useReducer((count = 0) => count + 1)
  const propsRef = React.useRef(props)
  propsRef.current = props

  const act = React.useCallback((fn: () => void) => {
    if (!isMounted.current) return
    const { act } = propsRef.current
    if (act) act(fn)
    else fn()
  }, [])

  const promise = React.useMemo(
    () => loadScript({ ...props, scriptsRegistry }),
    [props.src, scriptsRegistry]
  )

  React.useEffect(() => {
    if (!isMounted.current) return
    promise.then(
      () =>
        act(() => {
          propsRef.current.onLoad?.()
          rerender()
        }),
      (error: Error) =>
        act(() => {
          propsRef.current.onError?.(error)
          rerender()
        })
    )
  }, [promise])

  return getState({ ...props, scriptsRegistry })
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

export default function ScriptLoader(props: Props): React.Node | null {
  const state = useScript(props)
  const { children } = props
  if (children) {
    const result = children({ ...state })
    return result == null ? null : result
  }
  return null
}
