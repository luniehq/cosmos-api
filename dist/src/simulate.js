/* eslint-env browser */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var GAS_ADJUSTMENT = 2.3;
export default function simulate(cosmosRESTURL, senderAddress, chainId, msg, memo, sequence, accountNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var type, path, url, fixedMessage, tx, gasEstimate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    type = msg.type;
                    path = {
                        'cosmos-sdk/MsgSend': function () { return "/bank/accounts/" + senderAddress + "/transfers"; },
                        'cosmos-sdk/MsgDelegate': function () { return "/staking/delegators/" + senderAddress + "/delegations"; },
                        'cosmos-sdk/MsgUndelegate': function () { return "/staking/delegators/" + senderAddress + "/unbonding_delegations"; },
                        'cosmos-sdk/MsgBeginRedelegate': function () { return "/staking/delegators/" + senderAddress + "/redelegations"; },
                        'cosmos-sdk/MsgSubmitProposal': function () { return "/gov/proposals"; },
                        'cosmos-sdk/MsgVote': function () { return "/gov/proposals/" + msg.value.proposal_id + "/votes"; },
                        'cosmos-sdk/MsgDeposit': function () { return "/gov/proposals/" + msg.value.proposal_id + "/deposits"; },
                        'cosmos-sdk/MsgWithdrawDelegationReward': function () { return "/distribution/delegators/" + senderAddress + "/rewards"; }
                    }[type]();
                    url = "" + cosmosRESTURL + path;
                    // the simulate endpoint is out of sync right now: https://github.com/cosmos/cosmos-sdk/issues/4929
                    if (type === 'cosmos-sdk/MsgSubmitProposal') {
                        fixedMessage = {
                            type: 'cosmos-sdk/MsgSubmitProposal',
                            value: {
                                title: msg.value.content.value.title,
                                description: msg.value.content.value.description,
                                proposal_type: 'Text',
                                proposer: msg.value.proposer,
                                initial_deposit: msg.value.initial_deposit
                            }
                        };
                        msg = fixedMessage;
                    }
                    tx = createRESTPOSTObject(senderAddress, chainId, { sequence: sequence, accountNumber: accountNumber, memo: memo }, msg);
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(tx)
                        }).then(function (res) { return res.json(); })];
                case 1:
                    gasEstimate = (_a.sent()).gas_estimate;
                    return [2 /*return*/, Math.round(gasEstimate * GAS_ADJUSTMENT)];
            }
        });
    });
}
// attaches the request meta data to the message
function createRESTPOSTObject(senderAddress, chainId, _a, msg) {
    var sequence = _a.sequence, accountNumber = _a.accountNumber, memo = _a.memo;
    var requestMetaData = {
        sequence: sequence,
        from: senderAddress,
        account_number: accountNumber,
        chain_id: chainId,
        simulate: true,
        memo: memo
    };
    return __assign({ base_req: requestMetaData }, msg.value);
}
//# sourceMappingURL=simulate.js.map