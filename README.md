# react-render-props-script-loader

[![CircleCI](https://circleci.com/gh/jcoreio/react-render-props-script-loader.svg?style=svg)](https://circleci.com/gh/jcoreio/react-render-props-script-loader)
[![Coverage Status](https://codecov.io/gh/jcoreio/react-render-props-script-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/react-render-props-script-loader)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/react-library-skeleton.svg)](https://badge.fury.io/js/react-library-skeleton)

an easier to use dynamic script loader with a [render prop](https://reactjs.org/docs/render-props.html)

This is useful if you want to wait to load the Google Maps API until the user
navigates to a view that uses it. When you mount a `<ScriptLoader>` component,
it will create the script tag you've requested.

`<ScriptLoader>` doesn't load a given script URL more than once, even if there
is a pre-existing `<script>` tag for that URL that it didn't create. If `src`
prop changes, it will load that new URL.

# Version notes

- supports React 15 or 16
- if building for legacy browsers with a bundler like Webpack that supports the
  `module` field of `package.json`, you will probably need to add a rule to
  transpile this package.

# Installation

```sh
npm install --save react-render-props-script-loader
```

# Example

```js
import * as React from 'react'
import ScriptLoader from 'react-render-props-script-loader'

import MapView from './MapView'

export const MapViewContainer = (props) => (
  <ScriptLoader
    type="text/javascript"
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"
    onLoad={() => console.log('loaded google maps!')}
    onError={(error) =>
      console.error('failed to load google maps:', error.stack)
    }
  >
    {({ loading, error }) => {
      if (loading) return <h3>Loading Google Maps API...</h3>
      if (error) return <h3>Failed to load Google Maps API: {error.message}</h3>
      return <MapView {...props} />
    }}
  </ScriptLoader>
)
```

# API

## `ScriptLoader`

```js
import ScriptLoader from 'react-render-props-script-loader'
```

### `src` (**required** `string`)

The script URL.

### `onLoad` (`?() => any`)

A callback that `ScriptLoader` will call once the script has been loaded

### `onError` (`?(error: Error) => any`)

A callback that `ScriptLoader` will call if there was an error loading the
script

### `children` (`?(state: State) => ?React.Node`)

The render function. It will be called with an object having the following
props, and may return your desired content to display:

```js
{
  loading: boolean,
  loaded: boolean,
  error: ?Error,
  promise: ?Promise<any>,
}
```

## Server-Side Rendering

```js
import {
  ScriptsRegistry,
  ScriptsRegistryContext,
} from 'react-render-props-script-loader'
```

On the server, create an instance of `ScriptsRegistry` and put it on the app's
context:

```js
const registry = new ScriptsRegistry()

const body = ReactDOM.renderToString(
  <ScriptsRegistryContext.Provider value={registry}>
    <App />
  </ScriptsRegistryContext.Provider>
)
```

Then render `registry.scriptTags()` in your head element:

```js
const html = (
  <html className="default">
    <head>
      ...
      {registry.scriptTags()}
    </head>
    ...
  </html>
)
```

## Content Security Policy

Make sure your header includes this meta tag:

```jsx
<meta property="csp-nonce" content={nonce} />
```

And in SSR, pass the `nonce` to `registry.scriptTags({ nonce })`.
