// @flow
/* eslint-env browser */
import { type InnerProps } from './index'

let nonce: ?string
function getNonce(): string | null {
  if (nonce === undefined) {
    const node = document.querySelector(
      'meta[property="csp-nonce"], meta[name="csp-nonce"]'
    )
    nonce = node ? node.getAttribute('content') ?? null : null
  }
  return nonce ?? null
}

const loadScript = async ({
  scriptsRegistry,
  onLoad,
  onError,
  children,
  // eslint-disable-next-line no-unused-vars
  act,
  ...props
}: InnerProps): Promise<void> => {
  const { src } = props
  if (scriptsRegistry) {
    scriptsRegistry.results[src] = { error: undefined }
    scriptsRegistry.scripts.push(props)
    return
  }
  if (typeof document === 'undefined') {
    throw new Error(
      'you must pass a scriptsRegistry if calling on the server side'
    )
  }
  if (typeof (document: any).querySelector === 'function') {
    if (document.querySelector(`script[src="${src}"]`)) {
      results[src] = { error: undefined }
      return
    }
  }
  return new Promise((resolve: () => void, reject: (error?: Error) => void) => {
    const script = document.createElement('script')
    script.src = src
    ;(script: any).nonce = getNonce()
    Object.keys(props).forEach((key) => script.setAttribute(key, props[key]))
    script.onload = resolve
    script.onerror = reject
    if (document.body) document.body.appendChild(script)
  })
}

const results: { [src: string]: { error: ?Error } } = {}
const promises: { [src: string]: Promise<any> } = {}

export default (props: InnerProps): Promise<any> => {
  const { scriptsRegistry } = props
  const _promises = scriptsRegistry ? scriptsRegistry.promises : promises
  const _results = scriptsRegistry ? scriptsRegistry.results : results
  return (
    _promises[props.src] ||
    (_promises[props.src] = loadScript(props).then(
      () => (_results[props.src] = { error: null }),
      (error: any = new Error(`failed to load ${props.src}`)) => {
        _results[props.src] = { error }
        throw error
      }
    ))
  )
}

export function getState({ src, scriptsRegistry }: InnerProps): {|
  loading: boolean,
  loaded: boolean,
  error: ?Error,
  promise: ?Promise<any>,
|} {
  const result = scriptsRegistry ? scriptsRegistry.results[src] : results[src]
  const promise = scriptsRegistry
    ? scriptsRegistry.promises[src]
    : promises[src]
  return {
    loading: result == null,
    loaded: result ? !result.error : false,
    error: result && result.error,
    promise,
  }
}
