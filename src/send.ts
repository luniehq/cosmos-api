/* eslint-env browser */

import * as types from '../lib/types'
import { createSignMessage, createSignature } from './signature'

const DEFAULT_GAS_PRICE = [{ amount: (2.5e-8).toFixed(9), denom: `uatom` }]

export default async function send( options: types.GasAmount = { gas: 0, gasPrices: DEFAULT_GAS_PRICE, memo: '' },
    messages: Array<types.Msg>,
    signer: (message: string) => { signature: Buffer, publicKey: Buffer },
    cosmosRESTURL: string, 
    chainId: string, 
    accountNumber: number, 
    sequence: number) {

  const signedTx = await createSignedTransaction(options, messages, signer, cosmosRESTURL, chainId, accountNumber, sequence)

  // broadcast transaction with signatures included
  const body = createBroadcastBody(signedTx, `sync`)
  const res = await fetch(`${cosmosRESTURL}/txs`, {
    method: `POST`,
    headers: {
      'Content-Type': 'application/json'
    },
    body })
    .then(res => res.json())
    .then(assertOk)

  return {
    hash: res.txhash,
    sequence,
    included: () => queryTxInclusion(res.txhash, cosmosRESTURL)
  }
}

export async function createSignedTransaction (options: types.GasAmount = { gas: 0, gasPrices: DEFAULT_GAS_PRICE, memo : '' }, 
    messages: Array<types.Msg>,
    signer: (message: string) => { signature: Buffer, publicKey: Buffer },
    cosmosRESTURL: string, 
    chainId: string, 
    accountNumber: number, 
    sequence: number) {

  // sign transaction
  const stdTx = createStdTx(options, messages)
  const signMessage = createSignMessage(stdTx, { sequence, accountNumber, chainId })
  let signature, publicKey
  try {
    ({ signature, publicKey } = await signer(signMessage))
  } catch (err) {
    throw new Error('Signing failed: ' + err.message)
  }

  const signatureObject = createSignature(signature, sequence, accountNumber, publicKey)
  const signedTx = createSignedTransactionObject(types.StdTx, types.StdSignature)

  return signedTx
}

// wait for inclusion of a tx in a block
// Default waiting time: 60 * 3s = 180s
export async function queryTxInclusion (txHash: string, cosmosRESTURL: string, iterations = 60, timeout = 3000) {
  let includedTx
  while (iterations-- > 0) {
    try {
      includedTx = await fetch(`${cosmosRESTURL}/txs/${txHash}`)
        .then(function (response: Response) {
          if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response.json())
          } else {
            var error = new Error(response.statusText || String(response.status))
            //error.response = response
            return Promise.reject(error)
          }
        })
      break
    } catch (err) {
      // tx wasn't included in a block yet
      await new Promise(resolve =>
        setTimeout(resolve, timeout)
      )
    }
  }
  if (iterations <= 0) {
    throw new Error(`The transaction was still not included in a block. We can't say for certain it will be included in the future.`)
  }

  assertOk(includedTx)

  return includedTx
}

// attaches the request meta data to the message
export function createStdTx (options: types.GasAmount,  messages: Array<types.Msg>) {
  let fees = options.gasPrices.map(({ amount, denom }: types.Coin) => ({ amount: String(Math.round(Number(amount) * options.gas)), denom }): types.Coin)
  fees = fees.filter(({ amount }) => Number(amount) > 0)

  return {
    msg: Array.isArray(messages) ? messages : [messages],
    fee: {
      amount: fees.length > 0 ? fees : null,
      gas: options.gas
    },
    signatures: null,
    memo: options.memo
  }
}

// the broadcast body consists of the signed tx and a return type
// returnType can be block (inclusion in block), async (right away), sync (after checkTx has passed)
function createBroadcastBody (signedTx: types.StdTx, returnType = `sync`): string {
  return JSON.stringify({
    tx: signedTx,
    mode: returnType
  })
}

// adds the signature object to the tx
function createSignedTransactionObject (tx: types.StdTx, signature: string) {
  return Object.assign({}, tx, {
    signatures: [signature]
  })
}

// assert that a transaction was sent successful
function assertOk (res: types.GetterResponse) {
  if (Array.isArray(res)) {
    if (res.length === 0) throw new Error(`Error sending transaction`)

    res.forEach(assertOk)
  }

  if (res.error) {
    throw new Error(res.error)
  }

  // Sometimes we get back failed transactions, which shows only by them having a `code` property
  if (res.code) {
    const message = JSON.parse(res.raw_log).message
    throw new Error(message)
  }

  if (!res.txhash) {
    const message = res.message
    throw new Error(message)
  }

  return res
}
