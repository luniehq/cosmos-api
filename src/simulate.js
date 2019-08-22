/* eslint-env browser */

const GAS_ADJUSTMENT = 2.3

export default async function simulate (
  cosmosRESTURL,
  senderAddress,
  chainId,
  msg,
  memo,
  sequence,
  accountNumber
) {
  const type = msg.type
  const path = {
    'cosmos-sdk/MsgSend': () => `/bank/accounts/${senderAddress}/transfers`,
    'cosmos-sdk/MsgDelegate': () => `/staking/delegators/${senderAddress}/delegations`,
    'cosmos-sdk/MsgUndelegate': () => `/staking/delegators/${senderAddress}/unbonding_delegations`,
    'cosmos-sdk/MsgBeginRedelegate': () => `/staking/delegators/${senderAddress}/redelegations`,
    'cosmos-sdk/MsgSubmitProposal': () => `/gov/proposals`,
    'cosmos-sdk/MsgVote': () => `/gov/proposals/${msg.value.proposal_id}/votes`,
    'cosmos-sdk/MsgDeposit': () => `/gov/proposals/${msg.value.proposal_id}/deposits`,
    'cosmos-sdk/MsgWithdrawDelegationReward': () => `/distribution/delegators/${senderAddress}/rewards`
  }[type]()
  const url = `${cosmosRESTURL}${path}`

  // the simulate endpoint is out of sync right now: https://github.com/cosmos/cosmos-sdk/issues/4929
  if (type === 'cosmos-sdk/MsgSubmitProposal') {
    const fixedMessage = {
      type: 'cosmos-sdk/MsgSubmitProposal',
      value: {
        title: msg.value.content.value.title,
        description: msg.value.content.value.description,
        proposal_type: 'Text',
        proposer: msg.value.proposer,
        initial_deposit: msg.value.initial_deposit
      }
    }
    msg = fixedMessage
  }

  const tx = createRESTPOSTObject(senderAddress, chainId, { sequence, accountNumber, memo }, msg)

  const { gas_estimate: gasEstimate } = await fetch(url, { method: `POST`, body: JSON.stringify(tx) }).then(res => res.json())
  return Math.round(gasEstimate * GAS_ADJUSTMENT)
}

// attaches the request meta data to the message
function createRESTPOSTObject (senderAddress, chainId, { sequence, accountNumber, memo }, msg) {
  const requestMetaData = {
    sequence,
    from: senderAddress,
    account_number: accountNumber,
    chain_id: chainId,
    simulate: true,
    memo
  }

  return { base_req: requestMetaData, ...msg.value }
}
