export default async function simulate(
  cosmosRESTURL,
  senderAddress,
  chainId,
  msg,
  memo
) {
  const type = msg.type
  const path = {
    "cosmos-sdk/MsgSend": `/bank/accounts/${senderAddress}/transfers`,
    "cosmos-sdk/MsgDelegate": `/staking/delegators/${senderAddress}/delegations`,
    "cosmos-sdk/MsgUndelegate": `/staking/delegators/${senderAddress}/unbonding_delegations`,
    "cosmos-sdk/MsgBeginRedelegate": `/staking/delegators/${senderAddress}/redelegations`,
    "cosmos-sdk/MsgSubmitProposal": `/gov/proposals`,
    "cosmos-sdk/MsgVote": `/gov/proposals/${msg.value.proposal_id}/votes`,
    "cosmos-sdk/MsgDeposit": `/gov/proposals/${msg.value.proposal_id}/deposits`,
    "cosmos-sdk/MsgWithdrawDelegationReward": `/distribution/delegators/${this.senderAddress}/rewards`
  }[type]
  const url = `${cosmosRESTURL}${path}`

  // get the sequence number
  const { sequence, account_number: accountNumber } = await this.api.getAccount(this.senderAddress)
  const tx = createRESTPOSTObject(senderAddress, chainId, { sequence, accountNumber, memo }, msg)
  // set tx to only simulate
  tx.base_req.simulate = true

  const { gas_estimate } = await fetch(url, { method: `POST`, body: tx }).then(res => res.json())
  return Number(gas_estimate)
}

// attaches the request meta data to the message
function createRESTPOSTObject(senderAddress, chainId, { sequence, accountNumber, gas, gasPrice, memo }, msg) {
  const requestMetaData = {
    sequence,
    from: senderAddress,
    account_number: accountNumber,
    chain_id: chainId,
    gas,
    gas_prices: [gasPrice],
    simulate: false,
    memo
  }

  return { base_req: requestMetaData, ...msg }
}