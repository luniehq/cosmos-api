'use strict'

/* eslint-env browser */

const RETRIES = 4

export default function Getters (cosmosRESTURL) {
  // request and retry
  async function get (path, { page, limit, all } = { page: 1, limit: 30, all: false }, tries = RETRIES) {
    while (tries) {
      try {
        let url = cosmosRESTURL + path
        const isTxsPagination = path.startsWith('/txs?')
        if (isTxsPagination) url = url + `&page=${page}&limit=${limit}`

        const response = await fetch(url).then(res => res.json())

        // handle txs pagination
        if (isTxsPagination) {
          if (!all || Number(response.page_number) >= Number(response.page_total)) return response.txs

          return response.txs.concat(await get(path, { page: page + 1, limit, all }))
        }

        // handle height wrappers
        // most responses are wrapped in a construct containing height and the actual result
        if (!response || response.height === undefined || !response.result) {
          return response
        }
        return response.result
      } catch (err) {
        if (--tries === 0) {
          throw err
        }
      }
    }
  }

  return {
    url: cosmosRESTURL,

    // meta
    connected: function () {
      return this.nodeVersion().then(() => true, () => false)
    },

    nodeVersion: () => fetch(cosmosRESTURL + `/node_version`).then(res => res.text()),

    // coins
    account: function (address) {
      const emptyAccount = {
        coins: [],
        sequence: `0`,
        account_number: `0`
      }
      return get(`/auth/accounts/${address}`)
        .then(res => {
          // HACK, hope for: https://github.com/cosmos/cosmos-sdk/issues/3885
          let account = res.value || emptyAccount
          if (res.type === `auth/DelayedVestingAccount`) {
            if (!account.BaseVestingAccount) {
              console.error(
                `SDK format of vesting accounts responses has changed`
              )
              return emptyAccount
            }
            account = Object.assign(
              {},
              account.BaseVestingAccount.BaseAccount,
              account.BaseVestingAccount
            )
            delete account.BaseAccount
            delete account.BaseVestingAccount
          }
          return account
        })
        .catch(err => {
          // if account not found, return null instead of throwing
          if (
            err.response &&
            (err.response.data.includes(`account bytes are empty`) ||
              err.response.data.includes(`failed to prove merkle proof`))
          ) {
            return emptyAccount
          }
          throw err
        })
    },
    txs: function (addr, paginationOptions) {
      return get(`/txs?message.sender=${addr}`, paginationOptions)
    },
    bankTxs: function (addr, paginationOptions) {
      return Promise.all([
        get(`/txs?message.sender=${addr}`, paginationOptions),
        get(`/txs?message.recipient=${addr}`, paginationOptions)
      ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))
    },
    txsByHeight: function (height, paginationOptions) {
      return get(`/txs?tx.height=${height}`, paginationOptions)
    },
    tx: hash => get(`/txs/${hash}`),

    /* ============ STAKE ============ */
    stakingTxs: async function (address, valAddress, paginationOptions) {
      return Promise.all([
        get(
          `/txs?message.action=create_validator&message.destination-validator=${valAddress}`, paginationOptions),
        get(
          `/txs?message.action=edit_validator&message.destination-validator=${valAddress}`, paginationOptions),
        get(`/txs?message.action=delegate&message.delegator=${address}`),
        get(`/txs?message.action=begin_redelegate&message.delegator=${address}`, paginationOptions),
        get(`/txs?message.action=begin_unbonding&message.delegator=${address}`, paginationOptions),
        get(`/txs?message.action=unjail&message.source-validator=${valAddress}`, paginationOptions)
      ]).then(([
        createValidatorTxs,
        editValidatorTxs,
        delegationTxs,
        redelegationTxs,
        undelegationTxs,
        unjailTxs
      ]) =>
        [].concat(
          createValidatorTxs,
          editValidatorTxs,
          delegationTxs,
          redelegationTxs,
          undelegationTxs,
          unjailTxs
        )
      )
    },
    // Get all delegations information from a delegator
    delegations: function (addr) {
      return get(`/staking/delegators/${addr}/delegations`)
    },
    undelegations: function (addr) {
      return get(

        `/staking/delegators/${addr}/unbonding_delegations`,
        true
      )
    },
    redelegations: function (addr) {
      return get(`/staking/redelegations?delegator=${addr}`)
    },
    // Query all validators that a delegator is bonded to
    delegatorValidators: function (delegatorAddr) {
      return get(`/staking/delegators/${delegatorAddr}/validators`)
    },
    // Get a list containing all the validator candidates
    validators: () => Promise.all([
      get(`/staking/validators?status=unbonding`),
      get(`/staking/validators?status=bonded`),
      get(`/staking/validators?status=unbonded`)
    ]).then((validatorGroups) =>
      [].concat(...validatorGroups)
    ),
    // Get information from a validator
    validator: function (addr) {
      return get(`/staking/validators/${addr}`)
    },

    // Get the list of the validators in the latest validator set
    validatorSet: () => get(`/validatorsets/latest`),

    // Query a delegation between a delegator and a validator
    delegation: function (delegatorAddr, validatorAddr) {
      return get(

        `/staking/delegators/${delegatorAddr}/delegations/${validatorAddr}`,
        true
      )
    },
    unbondingDelegation: function (delegatorAddr, validatorAddr) {
      return get(

        `/staking/delegators/${delegatorAddr}/unbonding_delegations/${validatorAddr}`,
        true
      )
    },
    pool: () => get(`/staking/pool`),
    stakingParameters: () => get(`/staking/parameters`),

    /* ============ Slashing ============ */

    validatorSigningInfo: function (pubKey) {
      return get(`/slashing/validators/${pubKey}/signing_info`)
    },
    validatorSigningInfos: function () {
      return get(`/slashing/signing_infos`)
    },

    /* ============ Governance ============ */

    proposals: () => get(`/gov/proposals`),
    proposal: function (proposalId) {
      return get(`/gov/proposals/${proposalId}`)
    },
    proposalVotes: function (proposalId) {
      return get(`/gov/proposals/${proposalId}/votes`)
    },
    proposalVote: function (proposalId, address) {
      return get(`/gov/proposals/${proposalId}/votes/${address}`)
    },
    proposalDeposits: function (proposalId) {
      return get(`/gov/proposals/${proposalId}/deposits`)
    },
    proposalDeposit: function (proposalId, address) {
      return get(

        `/gov/proposals/${proposalId}/deposits/${address}`,
        true
      )
    },
    proposalTally: function (proposalId) {
      return get(`/gov/proposals/${proposalId}/tally`)
    },
    govDepositParameters: () => get(`/gov/parameters/deposit`),
    govTallyingParameters: () => get(`/gov/parameters/tallying`),
    govVotingParameters: () => get(`/gov/parameters/voting`),
    governanceTxs: async function (address) {
      return Promise.all([
        get(`/txs?message.action=submit_proposal&message.proposer=${address}`),
        get(`/txs?message.action=deposit&message.depositor=${address}`),
        get(`/txs?message.action=vote&message.voter=${address}`)
      ]).then(([submitProposalTxs, depositTxs, voteTxs]) =>
        [].concat(submitProposalTxs, depositTxs, voteTxs)
      )
    },
    /* ============ Explorer ============ */
    block: function (blockHeight) {
      return get(`/blocks/${blockHeight}`)
    },
    /* ============ Distribution ============ */
    distributionTxs: async function (address, valAddress) {
      return Promise.all([
        get(`/txs?message.action=set_withdraw_address&message.delegator=${address}`),
        get(`/txs?message.action=withdraw_delegator_reward&message.delegator=${address}`),
        get(`/txs?message.action=withdraw_validator_rewards_all&message.source-validator=${valAddress}`)
      ]).then(([
        updateWithdrawAddressTxs,
        withdrawDelegationRewardsTxs,
        withdrawValidatorCommissionTxs
      ]) =>
        [].concat(
          updateWithdrawAddressTxs,
          withdrawDelegationRewardsTxs,
          withdrawValidatorCommissionTxs
        )
      )
    },
    delegatorRewards: function (delegatorAddr) {
      return get(`/distribution/delegators/${delegatorAddr}/rewards`)
    },
    delegatorRewardsFromValidator: async function (delegatorAddr, validatorAddr) {
      return (await get(
        `/distribution/delegators/${delegatorAddr}/rewards/${validatorAddr}`
      )) || []
    },
    validatorDistributionInformation: function (validatorAddr) {
      return get(`/distribution/validators/${validatorAddr}`)
    },
    validatorRewards: function (validatorAddr) {
      return get(`/distribution/validators/${validatorAddr}/rewards`)
    },
    distributionParameters: function () {
      return get(`/distribution/parameters`)
    },
    distributionOutstandingRewards: function () {
      return get(`/distribution/outstanding_rewards`)
    },

    annualProvisionedTokens: function () {
      return get(`/minting/annual-provisions`)
    },
    inflation: function () {
      return get(`/minting/inflation`)
    },
    mintingParameters: function () {
      return get(`/minting/parameters`)
    }
  }
}
