// Bank
export function MsgSend(senderAddress, _a) {
    var toAddress = _a.toAddress, amounts = _a.amounts // [{ denom, amount}]
    ;
    return {
        type: "cosmos-sdk/MsgSend",
        value: {
            from_address: senderAddress,
            to_address: toAddress,
            amount: amounts.map(Coin)
        }
    };
}
// Staking
export function MsgDelegate(senderAddress, _a) {
    var validatorAddress = _a.validatorAddress, amount = _a.amount, denom = _a.denom;
    return {
        type: "cosmos-sdk/MsgDelegate",
        value: {
            delegator_address: senderAddress,
            validator_address: validatorAddress,
            amount: Coin({ amount: amount, denom: denom })
        }
    };
}
export function MsgUndelegate(senderAddress, _a) {
    var validatorAddress = _a.validatorAddress, amount = _a.amount, denom = _a.denom;
    return {
        type: "cosmos-sdk/MsgUndelegate",
        value: {
            validator_address: validatorAddress,
            delegator_address: senderAddress,
            amount: Coin({ amount: amount, denom: denom })
        }
    };
}
export function MsgRedelegate(senderAddress, _a) {
    var validatorSourceAddress = _a.validatorSourceAddress, validatorDestinationAddress = _a.validatorDestinationAddress, amount = _a.amount, denom = _a.denom;
    return {
        type: "cosmos-sdk/MsgBeginRedelegate",
        value: {
            delegator_address: senderAddress,
            validator_src_address: validatorSourceAddress,
            validator_dst_address: validatorDestinationAddress,
            amount: Coin({ amount: amount, denom: denom })
        }
    };
}
// Governance
export function MsgSubmitProposal(senderAddress, _a) {
    var proposalType = _a.proposalType, title = _a.title, description = _a.description, initialDeposits = _a.initialDeposits // [{ denom, amount }]
    ;
    return {
        type: "cosmos-sdk/MsgSubmitProposal",
        value: {
            content: {
                type: 'cosmos-sdk/TextProposal',
                value: {
                    title: title,
                    description: description
                }
            },
            proposer: senderAddress,
            initial_deposit: initialDeposits.map(Coin)
        }
    };
}
export function MsgVote(senderAddress, _a) {
    var proposalId = _a.proposalId, option = _a.option;
    return {
        type: "cosmos-sdk/MsgVote",
        value: {
            voter: senderAddress,
            proposal_id: proposalId,
            option: option
        }
    };
}
export function MsgDeposit(senderAddress, _a) {
    var proposalId = _a.proposalId, amounts = _a.amounts // [{ denom, amount }]
    ;
    return {
        type: "cosmos-sdk/MsgDeposit",
        value: {
            depositor: senderAddress,
            proposal_id: proposalId,
            amount: amounts.map(Coin)
        }
    };
}
export function MsgWithdrawDelegationReward(senderAddress, _a) {
    var validatorAddress = _a.validatorAddress;
    return {
        type: "cosmos-sdk/MsgWithdrawDelegationReward",
        value: {
            delegator_address: senderAddress,
            validator_address: validatorAddress
        }
    };
}
function Coin(_a) {
    var amount = _a.amount, denom = _a.denom;
    return ({
        amount: String(amount),
        denom: denom
    });
}
export default {
    'MsgSend': MsgSend,
    'MsgDelegate': MsgDelegate,
    'MsgUndelegate': MsgUndelegate,
    'MsgRedelegate': MsgRedelegate,
    'MsgSubmitProposal': MsgSubmitProposal,
    'MsgVote': MsgVote,
    'MsgDeposit': MsgDeposit,
    'MsgWithdrawDelegationReward': MsgWithdrawDelegationReward
};
//# sourceMappingURL=messages.js.map