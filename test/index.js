// @flow

/* eslint-env browser */

import {describe, it} from 'mocha'
import * as React from 'react'
import {mount} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import ScriptLoader from '../src'
import loadScript from '../src/loadScript'

describe('ScriptLoader', () => {
  afterEach(() => {
    document.querySelectorAll('script').forEach(script => script.remove())
  })
  it('load works', async function (): Promise<void> {
    this.timeout(10000)
    const render = sinon.spy(() => 'hello')
    let onLoad, onError
    const promise = new Promise((resolve: any, reject: any) => {
      onLoad = resolve
      onError = reject
    })
    const comp = mount(
      <ScriptLoader src="foo" id="scriptId" onLoad={onLoad} onError={onError}>
        {render}
      </ScriptLoader>
    )
    expect(comp.text()).to.equal('hello')
    expect(render.lastCall.lastArg).to.containSubset({
      loading: true,
      loaded: false,
      error: undefined,
    })
    const script = document.getElementById('scriptId')
    if (!script) throw new Error('failed to get script');
    (script: any).onload()
    await promise
    expect(render.lastCall.lastArg).to.containSubset({
      loading: false,
      loaded: true,
      error: null,
    })
  })
  it('error works', async function (): Promise<void> {
    this.timeout(10000)
    const render = sinon.spy(() => 'hello')
    let onLoad, onError
    const promise = new Promise((resolve: any, reject: any) => {
      onLoad = resolve
      onError = reject
    })
    const comp = mount(
      <ScriptLoader src="bar" id="scriptId" onLoad={onLoad} onError={onError}>
        {render}
      </ScriptLoader>
    )
    expect(comp.text()).to.equal('hello')
    expect(render.lastCall.lastArg).to.containSubset({
      loading: true,
      loaded: false,
      error: undefined,
    })
    const script = document.getElementById('scriptId')
    if (!script) throw new Error('failed to get script');
    (script: any).onerror()
    await promise.catch(() => {})
    const arg1 = render.lastCall.lastArg
    expect(arg1.loading).to.be.false
    expect(arg1.loaded).to.be.false
    expect(arg1.error).to.be.an.instanceOf(Error)
  })
  it(`doesn't create a duplicate script`, async function (): Promise<void> {
    this.timeout(10000)
    const preexisting = document.createElement('script')
    preexisting.src = 'baz';
    (document.body: any).appendChild(preexisting)

    const render = sinon.spy(() => 'hello')
    let onLoad, onError
    const promise = new Promise((resolve: any, reject: any) => {
      onLoad = resolve
      onError = reject
    })
    const comp = mount(
      <ScriptLoader src="baz" id="scriptId" onLoad={onLoad} onError={onError}>
        {render}
      </ScriptLoader>
    )
    expect(comp.text()).to.equal('hello')
    expect(render.lastCall.lastArg).to.containSubset({
      loading: true,
      loaded: false,
      error: undefined,
    })
    const script = document.getElementById('scriptId')
    if (script) throw new Error('duplicate script found')
    await promise.catch(() => {})
    const arg1 = render.lastCall.lastArg
    expect(arg1.loading).to.be.false
    expect(arg1.loaded).to.be.true
    expect(arg1.error).to.be.null
  })
  it(`doesn't call onLoad after src changes`, async function (): Promise<void> {
    this.timeout(10000)

    const render = sinon.spy(() => 'hello')
    const oldOnLoad = sinon.spy()
    let onLoad, onError
    const promise = new Promise((resolve: any, reject: any) => {
      onLoad = resolve
      onError = reject
    })
    const comp = mount(
      <ScriptLoader src="qux" id="scriptId1" onLoad={oldOnLoad}>
        {render}
      </ScriptLoader>
    )
    comp.setProps((
      <ScriptLoader src="qlomb" id="scriptId2" onLoad={onLoad} onError={onError}>
        {render}
      </ScriptLoader>
    ).props).update()
    expect(render.lastCall.lastArg).to.containSubset({
      loading: true,
      loaded: false,
      error: undefined,
    })
    const script1 = document.getElementById('scriptId1')
    if (!script1) throw new Error('missing script 1');
    (script1: any).onload()
    const script2 = document.getElementById('scriptId2')
    if (!script2) throw new Error('missing script 2');
    (script2: any).onload()
    await promise.catch(() => {})
    expect(oldOnLoad.called).to.be.false
    expect(render.lastCall.lastArg).to.containSubset({
      loading: false,
      loaded: true,
      error: null,
    })
  })
  it(`doesn't call onError after src changes`, async function (): Promise<void> {
    this.timeout(10000)

    const render = sinon.spy(() => 'hello')
    const oldOnError = sinon.spy()
    let onLoad, onError
    const promise = new Promise((resolve: any, reject: any) => {
      onLoad = resolve
      onError = reject
    })
    const comp = mount(
      <ScriptLoader src="quxage" id="scriptId1" onError={oldOnError}>
        {render}
      </ScriptLoader>
    )
    comp.setProps((
      <ScriptLoader src="qlombage" id="scriptId2" onLoad={onLoad} onError={onError}>
        {render}
      </ScriptLoader>
    ).props).update()
    expect(render.lastCall.lastArg).to.containSubset({
      loading: true,
      loaded: false,
      error: undefined,
    })
    const script1 = document.getElementById('scriptId1')
    if (!script1) throw new Error('missing script 1');
    (script1: any).onerror()
    const script2 = document.getElementById('scriptId2')
    if (!script2) throw new Error('missing script 2');
    (script2: any).onload()
    await promise.catch(() => {})
    expect(oldOnError.called).to.be.false
    expect(render.lastCall.lastArg).to.containSubset({
      loading: false,
      loaded: true,
      error: null,
    })
  })
  it(`doesn't call onLoad after unmount`, async function (): Promise<void> {
    this.timeout(10000)

    const render = sinon.spy(() => 'hello')
    const oldOnLoad = sinon.spy()
    const comp = mount(
      <ScriptLoader src="blah" id="scriptId" onLoad={oldOnLoad}>
        {render}
      </ScriptLoader>
    )
    comp.unmount()
    const script = document.getElementById('scriptId')
    if (!script) throw new Error('missing script');
    (script: any).onload()
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(oldOnLoad.called).to.be.false
  })
  it(`doesn't call onError after unmount`, async function (): Promise<void> {
    this.timeout(10000)

    const render = sinon.spy(() => 'hello')
    const oldOnError = sinon.spy()
    const comp = mount(
      <ScriptLoader src="blag" id="scriptId" onError={oldOnError}>
        {render}
      </ScriptLoader>
    )
    comp.unmount()
    const script = document.getElementById('scriptId')
    if (!script) throw new Error('missing script');
    (script: any).onerror(new Error())
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(oldOnError.called).to.be.false
  })
})
describe(`loadScript`, function () {
  it(`errors if document is not defined`, async function (): Promise<void> {
    const prevDocument = document
    document = undefined // eslint-disable-line no-global-assign
    try {
      let error: ?Error
      await loadScript({src: 'documentundefined'}).catch(err => error = err)
      expect(error).to.exist
    } finally {
      document = prevDocument // eslint-disable-line no-global-assign
    }
  })
})
