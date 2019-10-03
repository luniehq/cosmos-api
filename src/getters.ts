'use strict'
import * as types from '../lib/types'

/* eslint-env browser */

const RETRIES = 4

export default function Getters (cosmosRESTURL: string) {
  // request and retry
  async function get (path: string, options: types.PaginationOptions = { page: 1, limit: 30, all: false }, tries = RETRIES): Promise<types.Result> {
    let response
    while (tries) {
      try {
        let url = cosmosRESTURL + path
        const isTxsPagination = path.startsWith('/txs?')
        if (isTxsPagination) url = url + `&page=${options.page}&limit=${options.limit}`

        response = await fetch(url).then(res => res.json())

        // handle txs pagination
        if (isTxsPagination) {
          if (!options.all || Number(response.page_number) >= Number(response.page_total)) return response.txs
          options.page = options.page + 1

          return response.txs.concat(await get(path, options))
        }

        // handle height wrappers
        // most responses are wrapped in a construct containing height and the actual result
        if (response.height !== undefined && response.result !== undefined) {
          return response.result
        }

        return response.result
      } catch (err) {
        if (--tries === 0) {
          throw err
        }
      }
    }
    return response.result
  }

  return {
    url: cosmosRESTURL,

    // meta
    connected: function () {
      return this.nodeVersion().then(() => true, () => false)
    },

    nodeVersion: () => fetch(cosmosRESTURL + `/node_version`).then(res => res.text()),

    // coins
    account: function (address: string) {
      const emptyAccount = {
        coins: [],
        sequence: `0`,
        account_number: `0`
      }
      return get(`/auth/accounts/${address}`)
        .then(res => {
          if (!res) return emptyAccount
          let account = res.value || emptyAccount
          // HACK, hope for: https://github.com/cosmos/cosmos-sdk/issues/3885
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
    txs: function (addr: string, pageOpts: types.PaginationOptions) {
      return get(`/txs?message.sender=${addr}`, pageOpts)
    },
    bankTxs: function (addr: string, pageOpts: types.PaginationOptions) {
      return Promise.all([
        get(`/txs?message.sender=${addr}`, pageOpts),
        get(`/txs?message.recipient=${addr}`, pageOpts)
      ]).then(([senderTxs, recipientTxs]: Array<any>) => [].concat(senderTxs, recipientTxs))
    },
    txsByHeight: function (height: number, pageOpts: types.PaginationOptions) {
      return get(`/txs?tx.height=${height}`, pageOpts)
    },
    tx: function (hash: string) {
      return get(`/txs/${hash}`)
    },

    /* ============ STAKE ============ */
    stakingTxs: async function (address:string, valAddress: string, paginationOptions: types.PaginationOptions) {
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
      ]: Array<any>) =>
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
    delegations: function (addr: string) {
      return get(`/staking/delegators/${addr}/delegations`)
    },
    undelegations: function (addr: string) {
      return get(

        `/staking/delegators/${addr}/unbonding_delegations`,
      )
    },
    redelegations: function (addr: string) {
      return get(`/staking/redelegations?delegator=${addr}`)
    },
    // Query all validators that a delegator is bonded to
    delegatorValidators: function (delegatorAddr: string) {
      return get(`/staking/delegators/${delegatorAddr}/validators`)
    },
    // Get a list containing all the validator candidates
    validators: () => Promise.all([
      get(`/staking/validators?status=unbonding`),
      get(`/staking/validators?status=bonded`),
      get(`/staking/validators?status=unbonded`)
    ]).then((validatorGroups: Array<any>) =>
      [].concat(...validatorGroups)
    ),
    // Get information from a validator
    validator: function (addr: string) {
      return get(`/staking/validators/${addr}`)
    },

    // Get the list of the validators in the latest validator set
    validatorSet: () => get(`/validatorsets/latest`),

    // Query a delegation between a delegator and a validator
    delegation: function (delegatorAddr: string, validatorAddr: string) {
      return get(`/staking/delegators/${delegatorAddr}/delegations/${validatorAddr}`)
    },
    unbondingDelegation: function (delegatorAddr: string, validatorAddr:string) {
      return get( `/staking/delegators/${delegatorAddr}/unbonding_delegations/${validatorAddr}`)
    },
    pool: () => get(`/staking/pool`),
    stakingParameters: () => get(`/staking/parameters`),

    /* ============ Slashing ============ */

    validatorSigningInfo: function (pubKey: types.PubKey) {
      return get(`/slashing/validators/${pubKey}/signing_info`)
    },
    validatorSigningInfos: function () {
      return get(`/slashing/signing_infos`)
    },

    /* ============ Governance ============ */

    proposals: () => get(`/gov/proposals`),
    proposal: function (proposalId: number) {
      return get(`/gov/proposals/${proposalId}`)
    },
    proposalVotes: function (proposalId: number) {
      return get(`/gov/proposals/${proposalId}/votes`)
    },
    proposalVote: function (proposalId: number, address: string) {
      return get(`/gov/proposals/${proposalId}/votes/${address}`)
    },
    proposalDeposits: function (proposalId: number) {
      return get(`/gov/proposals/${proposalId}/deposits`)
    },
    proposalDeposit: function (proposalId: number, address: string) {
      return get(`/gov/proposals/${proposalId}/deposits/${address}`)
    },
    proposalTally: function (proposalId: number) {
      return get(`/gov/proposals/${proposalId}/tally`)
    },
    govDepositParameters: () => get(`/gov/parameters/deposit`),
    govTallyingParameters: () => get(`/gov/parameters/tallying`),
    govVotingParameters: () => get(`/gov/parameters/voting`),
    governanceTxs: async function (address: string) {
      return Promise.all([
        get(`/txs?message.action=submit_proposal&message.proposer=${address}`),
        get(`/txs?message.action=deposit&message.depositor=${address}`),
        get(`/txs?message.action=vote&message.voter=${address}`)
      ]).then(([submitProposalTxs, depositTxs, voteTxs]: Array<any>) =>
        [].concat(submitProposalTxs, depositTxs, voteTxs)
      )
    },
    /* ============ Explorer ============ */
    block: function (blockHeight: number) {
      return get(`/blocks/${blockHeight}`)
    },
    /* ============ Distribution ============ */
    distributionTxs: async function (address: string, valAddress: string): Promise<any> {
      return Promise.all([
        get(`/txs?message.action=set_withdraw_address&message.delegator=${address}`),
        get(`/txs?message.action=withdraw_delegator_reward&message.delegator=${address}`),
        get(`/txs?message.action=withdraw_validator_rewards_all&message.source-validator=${valAddress}`)
      ]).then(([ updateWithdrawAddressTxs, withdrawDelegationRewardsTxs,withdrawValidatorCommissionTxs]: Array<any>) =>
        [].concat(
          updateWithdrawAddressTxs,
          withdrawDelegationRewardsTxs,
          withdrawValidatorCommissionTxs
        )
      )
    },
    delegatorRewards: function (delegatorAddr: string) {
      return get(`/distribution/delegators/${delegatorAddr}/rewards`)
    },
    delegatorRewardsFromValidator: async function (delegatorAddr: string, validatorAddr: string): Promise<types.Result> {
      return (await get(
        `/distribution/delegators/${delegatorAddr}/rewards/${validatorAddr}`
      )) || []
    },
    validatorDistributionInformation: function (validatorAddr: string): Promise<types.Result> {
      return get(`/distribution/validators/${validatorAddr}`)
    },
    validatorRewards: function (validatorAddr: string): Promise<types.Result> {
      return get(`/distribution/validators/${validatorAddr}/rewards`)
    },
    distributionParameters: function (): Promise<types.Result> {
      return get(`/distribution/parameters`)
    },
    distributionOutstandingRewards: function (): Promise<types.Result> {
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
