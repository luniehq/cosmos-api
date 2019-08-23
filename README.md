# Cosmos API
Cosmos API is a library for interacting with applications built on the Cosmos SDK.

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

### Create a sign message to sign with on a Ledger or with any other signer

```
const { signWithPrivateKey } = require('@lunie/cosmos-keys');
const { createSignMessage } = require('@lunie/cosmos-api');

const stdTx = {
  msg: [
    {
      type: `cosmos-sdk/Send`,
      value: {
        inputs: [
          {
            address: `cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66`,
            coins: [{ denom: `STAKE`, amount: `1` }]
          }
        ],
        outputs: [
          {
            address: `cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt`,
            coins: [{ denom: `STAKE`, amount: `1` }]
          }
        ]
      }
    }
  ],
  fee: { amount: [{ denom: ``, amount: `0` }], gas: `21906` },
  signatures: null,
  memo: ``
}

const signMessage = createSignMessage(stdTx, { sequence, accountNumber, chainId });
const signature = signWithPrivateKey(signMessage, Buffer.from(wallet.privateKey, 'hex'));
```

### Create and sign a transaction from a message which then is ready to be broadcast

```
const { signWithPrivateKey } = require('@lunie/cosmos-keys');
const { createSignedTransaction } = require('@lunie/cosmos-api');

const sendMsg = {
  type: `cosmos-sdk/Send`,
  value: {
    inputs: [
      {
        address: `cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66`,
        coins: [{ denom: `STAKE`, amount: `1` }]
      }
    ],
    outputs: [
      {
        address: `cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt`,
        coins: [{ denom: `STAKE`, amount: `1` }]
      }
    ]
  }
}

const signer = signMessage = > signWithPrivateKey(signMessage, Buffer.from(wallet.privateKey, 'hex'))

const signMessage = createSignedTransaction({ gas: 1000, gasPrices = [{ amount: "10", denom: "uatom" }], memo = `Hi from Lunie` }, [sendMsg], signer, chainId: "test-chain", accountNumber: 0, sequence: 12);
```
