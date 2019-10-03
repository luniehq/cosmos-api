'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
/* eslint-env browser */
var RETRIES = 4;
export default function Getters(cosmosRESTURL) {
    // request and retry
    function get(path, _a, tries) {
        var _b = _a === void 0 ? { page: 1, limit: 30, all: false } : _a, page = _b.page, limit = _b.limit, all = _b.all;
        if (tries === void 0) { tries = RETRIES; }
        return __awaiter(this, void 0, void 0, function () {
            var url, isTxsPagination, response, _c, _d, err_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!tries) return [3 /*break*/, 7];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 5, , 6]);
                        url = cosmosRESTURL + path;
                        isTxsPagination = path.startsWith('/txs?');
                        if (isTxsPagination)
                            url = url + ("&page=" + page + "&limit=" + limit);
                        return [4 /*yield*/, fetch(url).then(function (res) { return res.json(); })
                            // handle txs pagination
                        ];
                    case 2:
                        response = _e.sent();
                        if (!isTxsPagination) return [3 /*break*/, 4];
                        if (!all || Number(response.page_number) >= Number(response.page_total))
                            return [2 /*return*/, response.txs];
                        _d = (_c = response.txs).concat;
                        return [4 /*yield*/, get(path, { page: page + 1, limit: limit, all: all })];
                    case 3: return [2 /*return*/, _d.apply(_c, [_e.sent()])];
                    case 4:
                        // handle height wrappers
                        // most responses are wrapped in a construct containing height and the actual result
                        if (response.height !== undefined && response.result !== undefined) {
                            return [2 /*return*/, response.result];
                        }
                        return [2 /*return*/, response.result];
                    case 5:
                        err_1 = _e.sent();
                        if (--tries === 0) {
                            throw err_1;
                        }
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 0];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    return {
        url: cosmosRESTURL,
        // meta
        connected: function () {
            return this.nodeVersion().then(function () { return true; }, function () { return false; });
        },
        nodeVersion: function () { return fetch(cosmosRESTURL + "/node_version").then(function (res) { return res.text(); }); },
        // coins
        account: function (address) {
            var emptyAccount = {
                coins: [],
                sequence: "0",
                account_number: "0"
            };
            return get("/auth/accounts/" + address)
                .then(function (res) {
                if (!res)
                    return emptyAccount;
                var account = res.value || emptyAccount;
                // HACK, hope for: https://github.com/cosmos/cosmos-sdk/issues/3885
                if (res.type === "auth/DelayedVestingAccount") {
                    if (!account.BaseVestingAccount) {
                        console.error("SDK format of vesting accounts responses has changed");
                        return emptyAccount;
                    }
                    account = Object.assign({}, account.BaseVestingAccount.BaseAccount, account.BaseVestingAccount);
                    delete account.BaseAccount;
                    delete account.BaseVestingAccount;
                }
                return account;
            })
                .catch(function (err) {
                // if account not found, return null instead of throwing
                if (err.response &&
                    (err.response.data.includes("account bytes are empty") ||
                        err.response.data.includes("failed to prove merkle proof"))) {
                    return emptyAccount;
                }
                throw err;
            });
        },
        txs: function (addr, paginationOptions) {
            return get("/txs?message.sender=" + addr, paginationOptions);
        },
        bankTxs: function (addr, paginationOptions) {
            return Promise.all([
                get("/txs?message.sender=" + addr, paginationOptions),
                get("/txs?message.recipient=" + addr, paginationOptions)
            ]).then(function (_a) {
                var _b = __read(_a, 2), senderTxs = _b[0], recipientTxs = _b[1];
                return [].concat(senderTxs, recipientTxs);
            });
        },
        txsByHeight: function (height, paginationOptions) {
            return get("/txs?tx.height=" + height, paginationOptions);
        },
        tx: function (hash) { return get("/txs/" + hash); },
        /* ============ STAKE ============ */
        stakingTxs: function (address, valAddress, paginationOptions) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, Promise.all([
                            get("/txs?message.action=create_validator&message.destination-validator=" + valAddress, paginationOptions),
                            get("/txs?message.action=edit_validator&message.destination-validator=" + valAddress, paginationOptions),
                            get("/txs?message.action=delegate&message.delegator=" + address),
                            get("/txs?message.action=begin_redelegate&message.delegator=" + address, paginationOptions),
                            get("/txs?message.action=begin_unbonding&message.delegator=" + address, paginationOptions),
                            get("/txs?message.action=unjail&message.source-validator=" + valAddress, paginationOptions)
                        ]).then(function (_a) {
                            var _b = __read(_a, 6), createValidatorTxs = _b[0], editValidatorTxs = _b[1], delegationTxs = _b[2], redelegationTxs = _b[3], undelegationTxs = _b[4], unjailTxs = _b[5];
                            return [].concat(createValidatorTxs, editValidatorTxs, delegationTxs, redelegationTxs, undelegationTxs, unjailTxs);
                        })];
                });
            });
        },
        // Get all delegations information from a delegator
        delegations: function (addr) {
            return get("/staking/delegators/" + addr + "/delegations");
        },
        undelegations: function (addr) {
            return get("/staking/delegators/" + addr + "/unbonding_delegations", true);
        },
        redelegations: function (addr) {
            return get("/staking/redelegations?delegator=" + addr);
        },
        // Query all validators that a delegator is bonded to
        delegatorValidators: function (delegatorAddr) {
            return get("/staking/delegators/" + delegatorAddr + "/validators");
        },
        // Get a list containing all the validator candidates
        validators: function () { return Promise.all([
            get("/staking/validators?status=unbonding"),
            get("/staking/validators?status=bonded"),
            get("/staking/validators?status=unbonded")
        ]).then(function (validatorGroups) {
            return [].concat.apply([], __spread(validatorGroups));
        }); },
        // Get information from a validator
        validator: function (addr) {
            return get("/staking/validators/" + addr);
        },
        // Get the list of the validators in the latest validator set
        validatorSet: function () { return get("/validatorsets/latest"); },
        // Query a delegation between a delegator and a validator
        delegation: function (delegatorAddr, validatorAddr) {
            return get("/staking/delegators/" + delegatorAddr + "/delegations/" + validatorAddr, true);
        },
        unbondingDelegation: function (delegatorAddr, validatorAddr) {
            return get("/staking/delegators/" + delegatorAddr + "/unbonding_delegations/" + validatorAddr, true);
        },
        pool: function () { return get("/staking/pool"); },
        stakingParameters: function () { return get("/staking/parameters"); },
        /* ============ Slashing ============ */
        validatorSigningInfo: function (pubKey) {
            return get("/slashing/validators/" + pubKey + "/signing_info");
        },
        validatorSigningInfos: function () {
            return get("/slashing/signing_infos");
        },
        /* ============ Governance ============ */
        proposals: function () { return get("/gov/proposals"); },
        proposal: function (proposalId) {
            return get("/gov/proposals/" + proposalId);
        },
        proposalVotes: function (proposalId) {
            return get("/gov/proposals/" + proposalId + "/votes");
        },
        proposalVote: function (proposalId, address) {
            return get("/gov/proposals/" + proposalId + "/votes/" + address);
        },
        proposalDeposits: function (proposalId) {
            return get("/gov/proposals/" + proposalId + "/deposits");
        },
        proposalDeposit: function (proposalId, address) {
            return get("/gov/proposals/" + proposalId + "/deposits/" + address, true);
        },
        proposalTally: function (proposalId) {
            return get("/gov/proposals/" + proposalId + "/tally");
        },
        govDepositParameters: function () { return get("/gov/parameters/deposit"); },
        govTallyingParameters: function () { return get("/gov/parameters/tallying"); },
        govVotingParameters: function () { return get("/gov/parameters/voting"); },
        governanceTxs: function (address) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, Promise.all([
                            get("/txs?message.action=submit_proposal&message.proposer=" + address),
                            get("/txs?message.action=deposit&message.depositor=" + address),
                            get("/txs?message.action=vote&message.voter=" + address)
                        ]).then(function (_a) {
                            var _b = __read(_a, 3), submitProposalTxs = _b[0], depositTxs = _b[1], voteTxs = _b[2];
                            return [].concat(submitProposalTxs, depositTxs, voteTxs);
                        })];
                });
            });
        },
        /* ============ Explorer ============ */
        block: function (blockHeight) {
            return get("/blocks/" + blockHeight);
        },
        /* ============ Distribution ============ */
        distributionTxs: function (address, valAddress) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, Promise.all([
                            get("/txs?message.action=set_withdraw_address&message.delegator=" + address),
                            get("/txs?message.action=withdraw_delegator_reward&message.delegator=" + address),
                            get("/txs?message.action=withdraw_validator_rewards_all&message.source-validator=" + valAddress)
                        ]).then(function (_a) {
                            var _b = __read(_a, 3), updateWithdrawAddressTxs = _b[0], withdrawDelegationRewardsTxs = _b[1], withdrawValidatorCommissionTxs = _b[2];
                            return [].concat(updateWithdrawAddressTxs, withdrawDelegationRewardsTxs, withdrawValidatorCommissionTxs);
                        })];
                });
            });
        },
        delegatorRewards: function (delegatorAddr) {
            return get("/distribution/delegators/" + delegatorAddr + "/rewards");
        },
        delegatorRewardsFromValidator: function (delegatorAddr, validatorAddr) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, get("/distribution/delegators/" + delegatorAddr + "/rewards/" + validatorAddr)];
                        case 1: return [2 /*return*/, (_a.sent()) || []];
                    }
                });
            });
        },
        validatorDistributionInformation: function (validatorAddr) {
            return get("/distribution/validators/" + validatorAddr);
        },
        validatorRewards: function (validatorAddr) {
            return get("/distribution/validators/" + validatorAddr + "/rewards");
        },
        distributionParameters: function () {
            return get("/distribution/parameters");
        },
        distributionOutstandingRewards: function () {
            return get("/distribution/outstanding_rewards");
        },
        annualProvisionedTokens: function () {
            return get("/minting/annual-provisions");
        },
        inflation: function () {
            return get("/minting/inflation");
        },
        mintingParameters: function () {
            return get("/minting/parameters");
        }
    };
}
//# sourceMappingURL=getters.js.map