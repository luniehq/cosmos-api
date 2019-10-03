/* eslint-env browser */
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
import * as types from '../lib/types';
import { createSignMessage, createSignature } from './signature';
var DEFAULT_GAS_PRICE = [{ amount: (2.5e-8).toFixed(9), denom: "uatom" }];
export default function send(options, messages, signer, cosmosRESTURL, chainId, accountNumber, sequence) {
    if (options === void 0) { options = { gas: 0, gasPrices: DEFAULT_GAS_PRICE, memo: '' }; }
    return __awaiter(this, void 0, void 0, function () {
        var signedTx, body, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createSignedTransaction(options, messages, signer, cosmosRESTURL, chainId, accountNumber, sequence)
                    // broadcast transaction with signatures included
                ];
                case 1:
                    signedTx = _a.sent();
                    body = createBroadcastBody(signedTx, "sync");
                    return [4 /*yield*/, fetch(cosmosRESTURL + "/txs", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: body
                        })
                            .then(function (res) { return res.json(); })
                            .then(assertOk)];
                case 2:
                    res = _a.sent();
                    return [2 /*return*/, {
                            hash: res.txhash,
                            sequence: sequence,
                            included: function () { return queryTxInclusion(res.txhash, cosmosRESTURL); }
                        }];
            }
        });
    });
}
export function createSignedTransaction(options, messages, signer, cosmosRESTURL, chainId, accountNumber, sequence) {
    if (options === void 0) { options = { gas: 0, gasPrices: DEFAULT_GAS_PRICE, memo: '' }; }
    return __awaiter(this, void 0, void 0, function () {
        var stdTx, signMessage, signature, publicKey, err_1, signatureObject, signedTx;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    stdTx = createStdTx(options, messages);
                    signMessage = createSignMessage(stdTx, { sequence: sequence, accountNumber: accountNumber, chainId: chainId });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, signer(signMessage)];
                case 2:
                    (_a = _b.sent(), signature = _a.signature, publicKey = _a.publicKey);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    throw new Error('Signing failed: ' + err_1.message);
                case 4:
                    signatureObject = createSignature(signature, sequence, accountNumber, publicKey);
                    signedTx = createSignedTransactionObject(types.StdTx, types.StdSignature);
                    return [2 /*return*/, signedTx];
            }
        });
    });
}
// wait for inclusion of a tx in a block
// Default waiting time: 60 * 3s = 180s
export function queryTxInclusion(txHash, cosmosRESTURL, iterations, timeout) {
    if (iterations === void 0) { iterations = 60; }
    if (timeout === void 0) { timeout = 3000; }
    return __awaiter(this, void 0, void 0, function () {
        var includedTx, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(iterations-- > 0)) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, fetch(cosmosRESTURL + "/txs/" + txHash)
                            .then(function (response) {
                            if (response.status >= 200 && response.status < 300) {
                                return Promise.resolve(response.json());
                            }
                            else {
                                var error = new Error(response.statusText || String(response.status));
                                //error.response = response
                                return Promise.reject(error);
                            }
                        })];
                case 2:
                    includedTx = _a.sent();
                    return [3 /*break*/, 6];
                case 3:
                    err_2 = _a.sent();
                    // tx wasn't included in a block yet
                    return [4 /*yield*/, new Promise(function (resolve) {
                            return setTimeout(resolve, timeout);
                        })];
                case 4:
                    // tx wasn't included in a block yet
                    _a.sent();
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 0];
                case 6:
                    if (iterations <= 0) {
                        throw new Error("The transaction was still not included in a block. We can't say for certain it will be included in the future.");
                    }
                    assertOk(includedTx);
                    return [2 /*return*/, includedTx];
            }
        });
    });
}
// attaches the request meta data to the message
export function createStdTx(options, messages) {
    var fees = options.gasPrices.map(function (_a) {
        var amount = _a.amount, denom = _a.denom;
        return ({ amount: String(Math.round(Number(amount) * options.gas)), denom: denom });
    }, types.Coin);
    fees = fees.filter(function (_a) {
        var amount = _a.amount;
        return Number(amount) > 0;
    });
    return {
        msg: Array.isArray(messages) ? messages : [messages],
        fee: {
            amount: fees.length > 0 ? fees : null,
            gas: options.gas
        },
        signatures: null,
        memo: options.memo
    };
}
// the broadcast body consists of the signed tx and a return type
// returnType can be block (inclusion in block), async (right away), sync (after checkTx has passed)
function createBroadcastBody(signedTx, returnType) {
    if (returnType === void 0) { returnType = "sync"; }
    return JSON.stringify({
        tx: signedTx,
        mode: returnType
    });
}
// adds the signature object to the tx
function createSignedTransactionObject(tx, signature) {
    return Object.assign({}, tx, {
        signatures: [signature]
    });
}
// assert that a transaction was sent successful
function assertOk(res) {
    if (Array.isArray(res)) {
        if (res.length === 0)
            throw new Error("Error sending transaction");
        res.forEach(assertOk);
    }
    if (res.error) {
        throw new Error(res.error);
    }
    // Sometimes we get back failed transactions, which shows only by them having a `code` property
    if (res.code) {
        var message = JSON.parse(res.raw_log).message;
        throw new Error(message);
    }
    if (!res.txhash) {
        var message = res.message;
        throw new Error(message);
    }
    return res;
}
//# sourceMappingURL=send.js.map