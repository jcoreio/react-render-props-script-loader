# react-render-props-script-loader

[![Build Status](https://travis-ci.org/jcoreio/react-render-props-script-loader.svg?branch=master)](https://travis-ci.org/jcoreio/react-render-props-script-loader)
[![Coverage Status](https://codecov.io/gh/jcoreio/react-render-props-script-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/react-render-props-script-loader)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

an easier to use dynamic script loader with a [render prop](https://reactjs.org/docs/render-props.html)

This is useful if you want to wait to load the Google Maps API until the user
navigates to a view that uses it.  When you mount a `<ScriptLoader>` component,
it will create the script tag you've requested.

`<ScriptLoader>` doesn't load a given script URL more than once, even if there
is a pre-existing `<script>` tag for that URL that it didn't create.  If `src`
prop changes, it will load that new URL.

## Version notes

* supports React 15 or 16
* if building for legacy browsers with a bundler like Webpack that supports the
`module` field of `package.json`, you will probably need to add a rule to
transpile this package.

## Installation

```sh
npm install --save react-render-props-script-loader
```

## Example

```js
import * as React from 'react'
import ScriptLoader from 'react-render-props-script-loader'

import MapView from './MapView'

export const MapViewContainer = props => (
  <ScriptLoader
    type="text/javascript"
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"
    onLoad={() => console.log('loaded google maps!')}
    onError={error => console.error('failed to load google maps:', error.stack)}
  >
    {({loading, error}) => {
      if (loading) return <h3>Loading Google Maps API...</h3>
      if (error) return <h3>Failed to load Google Maps API: {error.message}</h3>
      return <MapView {...props} />
    }}
  </ScriptLoader>
)
```

## API

The package exports a single component with the following props:

### `src` (**required** `string`)

The script URL.

### `onLoad` (`?() => any`)

A callback that `ScriptLoader` will call once the script has been loaded

### `onError` (`?(error: Error) => any`)

A callback that `ScriptLoader` will call if there was an error loading the
script

### `children` (`?(state: State) => ?React.Node`)

The render function.  It will be called with an object having the following
props, and may return your desired content to display:

* `loading` (`boolean`) - `true` iff the script is loading
* `loaded` (`boolean`) - `true` iff the script successfully loaded
* `error` (`?Error`) - the `Error` that occurred if the script failed to load
