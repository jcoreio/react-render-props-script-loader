// @flow

import * as React from 'react'

export type State = {
  loading: boolean
  loaded: boolean
  error: ?Error
  promise: ?Promise<any>
}

export type Props = {
  src: string
  onLoad?: ?(() => any)
  onError?: ?((error: Error) => any)
  children?: ?((state: State) => ?React.Node)
  act?: ?((action: () => void) => void)
}

export function useScript(props: Props): State

export declare class ScriptsRegistry {
  scripts: Array<{ src: string }> = []
  results: { [src: string]: { error: Error | null | undefined } } = {}
  promises: { [src: string]: Promise<any> } = {}

  scriptTags(options?: { nonce?: string }): React.Node
}

export const ScriptsRegistryContext: React.Context<?ScriptsRegistry>

export default function ScriptLoader(props: Props): React.Node | null
