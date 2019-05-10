import { getErrorMessage } from "./sdk-errors.js"
import { createSignMessage, createSignature } from "./signature"

const DEFAULT_GAS_PRICE = [{ amount: (2.5e-8).toFixed(9), denom: `uatom` }]

export default async function send({ gas, gasPrices = DEFAULT_GAS_PRICE, memo = `` }, msg, signer, cosmosRESTURL, chainId, accountNumber, sequence) {
  // sign transaction
  const stdTx = createStdTx({ gas, gasPrices, memo }, msg)
  const signMessage = createSignMessage(stdTx, { sequence, accountNumber, chainId })
  const { signature, publicKey } = await signer(signMessage)

  // broadcast transaction with signatures included
  const signatureObject = createSignature(signature, sequence, accountNumber, publicKey)
  const signedTx = createSignedTransaction(stdTx, signatureObject)
  const body = createBroadcastBody(signedTx, `sync`)
  const res = await fetch(`${cosmosRESTURL}/txs`, { method: `POST`, body })
    .then(res => res.json())
    .then(assertOk)
    .catch(handleSDKError)

  return {
    hash: res.txhash,
    sequence,
    included: () => queryTxInclusion(res.txhash, cosmosRESTURL)
  }
}

// wait for inclusion of a tx in a block
// Default waiting time: 60 * 3s = 180s
export async function queryTxInclusion(txHash, cosmosRESTURL, iterations = 60, timeout = 3000) {
  while (iterations-- > 0) {
    try {
      await fetch(`${cosmosRESTURL}/txs/${txHash}`)
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
}
// attaches the request meta data to the message
function createStdTx({ gas, gasPrices, memo }, msg) {
  const fees = gasPrices.map(({ amount, denom }) => ({ amount: amount * gas, denom }))
    .filter(({ amount }) => amount > 0)
  return {
    msg: [msg],
    fee: {
      amount: fees.length > 0 ? fees : null,
      gas
    },
    signatures: null,
    memo
  }
}

// the broadcast body consists of the signed tx and a return type
// returnType can be block (inclusion in block), async (right away), sync (after checkTx has passed)
function createBroadcastBody(signedTx, returnType = `sync`) {
  return JSON.stringify({
    tx: signedTx,
    mode: returnType
  })
}

// adds the signature object to the tx
function createSignedTransaction(tx, signature) {
  return Object.assign({}, tx, {
    signatures: [signature]
  })
}

// beautify the errors returned from the SDK
function handleSDKError(err) {
  let message

  // TODO: get rid of this logic once the appended message is actually included inside the object message
  if (!err.message) {
    const idxColon = err.indexOf(`:`)
    const indexOpenBracket = err.indexOf(`{`)
    if (idxColon < indexOpenBracket) {
      // e.g => Msg 0 failed: {"codespace":4,"code":102,"abci_code":262246,"message":"existing unbonding delegation found"}
      message = JSON.parse(err.substr(idxColon + 1)).message
    } else {
      message = err
    }
  } else {
    message = err.message
  }
  throw new Error(message)
}

// assert that a transaction was sent successful
function assertOk(res) {
  if (Array.isArray(res)) {
    if (res.length === 0) throw new Error(`Error sending transaction`)

    res.forEach(assertOk)
  }

  // Sometimes we get back failed transactions, which shows only by them having a `code` property
  if (res.code) {
    // TODO get message from SDK: https://github.com/cosmos/cosmos-sdk/issues/4013
    throw new Error(getErrorMessage(Number(res.code)))
  }

  if (!res.txhash) {
    const message = res.message
    throw new Error(message)
  }

  return res
}