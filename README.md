# Cosmos Ledger

Cosmos Ledger is a library for interacting with the Cosmos Ledger Nano App. It provides a developer-friendly interface and user friendly error messages for an improved Ledger Nano development experience.

This library is based on [ledger-cosmos-js](https://github.com/ZondaX/ledger-cosmos-js) by [Juan Leni](https://github.com/jleni) who also implemented the [official Cosmos Ledger Nano App](https://github.com/cosmos/ledger-cosmos). 

*Thank you Juan!* 🙌

## Installation

```bash
yarn add @lunie/cosmos-ledger
```

## Usage

### Signing with the Ledger Nano

```js
import Ledger from "@lunie/cosmos-ledger"

// generate messages with "@lunie/cosmos-api"
const signMessage = {} || ``
const ledger = await Ledger().connect()
const signature = await ledger.sign(signMessage)
```

### Using with cosmos-api

```js
import Ledger from "@lunie/cosmos-ledger"
import Cosmos from "@lunie/cosmos-api"

const privateKey = Buffer.from(...)
const publicKey = Buffer.from(...)

// init cosmos API object
const cosmos = Cosmos(API_URL, ADDRESS)

// create a message
const msg = cosmos
  .MsgSend({
    toAddress: 'cosmos1abcd09876', 
    amounts: [{ denom: 'stake', amount: 10 }]
  })

// create a signer
const ledgerSigner = async (signMessage) => {
  const ledger = await Ledger().connect()
  const publicKey = await ledger.getPubKey()
  const signature = await ledger.sign(signMessage)

  return {
    signature,
    publicKey
  }
}

// send the transaction
const { included } = await msg.send({ gas: 200000 }, ledgerSigner)

// wait for the transaction to be included in a block
await included()
```
