// @flow

import * as React from 'react'

export type State = {
  loading: boolean
  loaded: boolean
  error: Error | null | undefined
  promise: Promise<any> | null | undefined
}

export type Props = {
  src: string
  onLoad?: (() => any) | null
  onError?: ((error: Error) => any) | null
  children?: ((state: State) => React.ReactNode | null | undefined) | null
  act?: ((action: () => void) => void) | null
}

export function useScript(props: Props): State

export declare class ScriptsRegistry {
  scripts: Array<{ src: string }>
  results: { [src: string]: { error: Error | null | undefined } }
  promises: { [src: string]: Promise<any> }

  scriptTags(options?: { nonce?: string }): React.ReactNode
}

export const ScriptsRegistryContext: React.Context<
  ScriptsRegistry | null | undefined
>

export default function ScriptLoader(props: Props): React.ReactElement | null
