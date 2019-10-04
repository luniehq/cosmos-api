# Cosmos Ledger App wrapper

This library helps interfacing with Cosmos Ledger App. It provides a developer friendly interface and user friendly error messages.

## THANK YOU

This library is based on `ledger-cosmos-js` by Juan Leni who implemente the Cosmos Ledger App. Thank you Juan!

## Install

```bash
yarn add @lunie/cosmos-ledger
```

## Usage

### Sign using the Ledger

```js
import Ledger from "@lunie/cosmos-ledger"

const signMessage = ... message to sign, generate messages with "@lunie/cosmos-js"

const ledger = new Ledger()

await ledger.connect()

const signature = await ledger.sign(signMessage)
```

### Using with cosmos-js

```js
import Ledger from "@lunie/cosmos-ledger"
import Cosmos from "@lunie/cosmos-js"

const privateKey = Buffer.from(...)
const publicKey = Buffer.from(...)

// init cosmos sender
const cosmos = Cosmos(STARGATE_URL, ADDRESS)

// create message
const msg = cosmos
  .MsgSend({toAddress: 'cosmos1abcd09876', amounts: [{ denom: 'stake', amount: 10 }})

// create a signer from this local js signer library
const ledgerSigner = async (signMessage) => {
  const ledger = new Ledger()
  await ledger.connect()
  const publicKey = await ledger.getPubKey()
  const signature = await ledger.sign(signMessage)

  return {
    signature,
    publicKey
  }
}

// send the transaction
const { included }= await msg.send({ gas: 200000 }, ledgerSigner)

// await tx to be included in a block
await included()
```

### Constructor options
```
Ledger(
  { testModeAllowed = false },
  hdPath = [44, 118, 0, 0, 0], // HDPATH
  hrp = 'cosmos', // BECH32PREFIX
);
```
