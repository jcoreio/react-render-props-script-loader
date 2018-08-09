// @flow

/* eslint-env browser */

type Props = {
  src: string,
}

const loadScript = ({src, ...props}: Props): Promise<void> => new Promise(
  (resolve: () => void, reject: (error?: Error) => void) => {
    if (typeof document === 'undefined') {
      reject(new Error('server-side rendering is not supported'))
      return
    }
    if (typeof document.querySelector === 'function') {
      if (document.querySelector(`script[src="${encodeURIComponent(src)}"]`)) {
        resolve()
        return
      }
    }
    const script = document.createElement('script')
    script.src = src
    Object.keys(props).forEach(key => script.setAttribute(key, props[key]))
    script.onload = resolve
    script.onerror = reject
    if (document.body) document.body.appendChild(script)
  }
)

const results: {[src: string]: {error: ?Error}} = {}
const promises: {[src: string]: Promise<any>} = {}

export default (props: Props): Promise<any> =>
  promises[props.src] || (promises[props.src] = loadScript(props).then(
    () => results[props.src] = {error: null},
    (error: any = new Error(`failed to load ${props.src}`)) => {
      results[props.src] = {error}
      throw error
    }
  ))

export function getState({src}: Props): {loading: boolean, loaded: boolean, error: ?Error} {
  const result = results[src]
  return {
    loading: result == null,
    loaded: result ? !result.error : false,
    error: result && result.error,
  }
}
