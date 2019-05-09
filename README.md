# Cosmos JS - Wrapper for Cosmos REST API

## Install

```
yarn add @lunie/cosmos-js
```

## Use

Simple example of how to send tokens.

```
import Cosmos from "@lunie/cosmos-js"

const STARGATE_URL = "https://stargate.cosmos.network"
const ADDRESS = "cosmos1abcd1234"
const cosmos = Cosmos(STARGATE_URL, ADDRESS)

// create the transaction object
const msg = cosmos
  .MsgSend({toAddress: 'cosmos1abcd09876', amounts: [{ denom: 'stake', amount: 10 }})

// estimate the needed gas amount
const gasEstimate = await msg.simulate()

// create a signer
const ledgerSigner = ... // async (signMessage: string) => { signature: Buffer, publicKey: Buffer }

// send the transaction
const { included }= await msg.send({ gas: gasEstimate }, ledgerSigner)

// await tx to be included in a block
await included()
```

## API

If you want to query data only, you don't need to specify an address.

```
import { API } from "@lunie/cosmos-js"

const STARGATE_URL = "https://stargate.cosmos.network"

const api = API(STARGATE_URL)

const validators = await api.validators()
```