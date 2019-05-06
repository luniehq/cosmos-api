import _Getters from "./getters"
import send from "./send"
import simulate from "./simulate"
import MessageConstructors from "./messages"

/*
* Sender object to build and send transactions
* Example:
* const cosmos = Cosmos("https://stargate.lunie.io", "cosmos1abcd1234")
* const msg = cosmos
* .MsgSend({toAddress: 'cosmos1abcd09876', amounts: [{ denom: 'stake', amount: 10 }})
* const gasEstimate = await msg.simulate()
* const ledgerSigner = ... // async (signMessage: string) => { signature: Buffer, publicKey: Buffer }
* const { included }= await msg.send({ gas: gasEstimate }, ledgerSigner)
* await included()
*/

export default class Cosmos {
  constructor(cosmosRESTURL, senderAddress) {
    this.url = cosmosRESTURL
    this.get = {}
    this.senderAddress = senderAddress

    if (!senderAddress) {
      throw Error("If you want to use this tool just for getting data, please initialize it via `const api = Cosmos.API; const validators = api.validators();`");
    }


    const getter = _Getters(cosmosRESTURL)
    Object.values(getter).forEach(getterFn => {
      this.get[getterFn.name] = getterFn
    })

    // add message constructors to the Sender to provide a simple API
    Object.values(MessageConstructors)
      .filter(messageConstructor => messageConstructor.name !== `default`)
      .forEach(messageConstructor => {
        this[messageConstructor.name] = function (...args) {
          const message = messageConstructor(this.senderAddress, args)

          return {
            simulate: (memo = undefined) => this.simulate({ message, memo }),
            send: ({ gas, gasPrice, memo = undefined }, signer) => this.send({ gas, gasPrice, memo }, message, signer)
          }
        }
      })
  }

  async setChainId(chainId = this.chainId) {
    if (!chainId) {
      const { block_meta: { header: { chain_id } } } = await this.get.block("latest")
      this.chainId = chain_id
      return
    }
    this.chainId = chainId
  }

  async getAccount() {
    const { sequence, account_number } = await this.get.account(senderAddress)
    // prevent setting the sequence to a sequence number that maybe doesn't include a tx we already sent but wasn't included in a block yet
    if (sequence > this.sequence) {
      this.sequence = sequence
    }
    this.accountNumber = account_number
  }

  /*
  * message: object
  * signer: async (signMessage: string) => { signature: Buffer, publicKey: Buffer }
  */
  async send({ gas, gasPrice, memo }, message, signer) {
    await this.setChainId()
    await this.getAccount()

    const {
      hash,
      sequence,
      included
    } = await send({ gas, gasPrice, memo }, message, signer, this.senderAddress, this.url, this.chainId, this.accountNumber, this.sequence)
    this.sequence = this.sequence + 1

    return {
      hash,
      sequence,
      included
    }
  }

  async simulate({ msg, memo = undefined }) {
    await this.setChainId()

    return simulate(this.url, this.senderAddress, this.chainId, msg, memo)
  }
}

export const API = _Getters