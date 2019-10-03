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
import _Getters from './getters';
import send from './send';
import simulate from './simulate';
import * as MessageConstructors from './messages';
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
var Cosmos = /** @class */ (function () {
    function Cosmos(cosmosRESTURL, chainId) {
        var _this = this;
        if (chainId === void 0) { chainId = undefined; }
        this.url = cosmosRESTURL;
        this.get = {};
        this.accounts = {}; // storing sequence numbers to not send two transactions with the same sequence number
        this.chainId = chainId;
        var getters = _Getters(cosmosRESTURL);
        Object.keys(getters).forEach(function (getter) {
            _this.get[getter] = getters[getter];
        });
        // add message constructors to the Sender to provide a simple API
        Object.entries(MessageConstructors)
            .forEach(function (_a) {
            var _b = __read(_a, 2), name = _b[0], messageConstructor = _b[1];
            _this[name] = function (senderAddress, args) {
                var _this = this;
                var message = messageConstructor(senderAddress, args);
                return {
                    message: message,
                    simulate: function (_a) {
                        var _b = _a.memo, memo = _b === void 0 ? undefined : _b;
                        return _this.simulate(senderAddress, { message: message, memo: memo });
                    },
                    send: function (_a, signer) {
                        var gas = _a.gas, gasPrices = _a.gasPrices, _b = _a.memo, memo = _b === void 0 ? undefined : _b;
                        return _this.send(senderAddress, { gas: gas, gasPrices: gasPrices, memo: memo }, message, signer);
                    }
                };
            };
        });
        this.MultiMessage = function (senderAddress) {
            var _this = this;
            var messageObjects = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                messageObjects[_i - 1] = arguments[_i];
            }
            var allMessageObjects = [].concat.apply([], __spread(messageObjects));
            var messages = allMessageObjects.map(function (_a) {
                var message = _a.message;
                return message;
            });
            return {
                messages: messages,
                simulate: function (_a) {
                    var _b = _a.memo, memo = _b === void 0 ? undefined : _b;
                    return _this.simulate(senderAddress, { message: messages[0], memo: memo });
                },
                send: function (_a, signer) {
                    var gas = _a.gas, gasPrices = _a.gasPrices, _b = _a.memo, memo = _b === void 0 ? undefined : _b;
                    return _this.send(senderAddress, { gas: gas, gasPrices: gasPrices, memo: memo }, messages, signer);
                }
            };
        };
    }
    Cosmos.prototype.setChainId = function (chainId) {
        if (chainId === void 0) { chainId = this.chainId; }
        return __awaiter(this, void 0, void 0, function () {
            var latestChainId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!chainId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.get.block('latest')];
                    case 1:
                        latestChainId = (_a.sent()).block_meta.header.chain_id;
                        chainId = latestChainId;
                        _a.label = 2;
                    case 2:
                        this.chainId = chainId;
                        return [2 /*return*/, chainId];
                }
            });
        });
    };
    Cosmos.prototype.getAccount = function (senderAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sequence, accountNumber;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.get.account(senderAddress)];
                    case 1:
                        _a = _b.sent(), sequence = _a.sequence, accountNumber = _a.account_number;
                        this.accounts[senderAddress] = {
                            // prevent downgrading a sequence number as we assume we send a transaction that hasn't affected the remote sequence number yet
                            sequence: this.accounts[senderAddress] && sequence < this.accounts[senderAddress].sequence
                                ? this.accounts[senderAddress].sequence
                                : sequence,
                            accountNumber: accountNumber
                        };
                        return [2 /*return*/, this.accounts[senderAddress]];
                }
            });
        });
    };
    /*
    * message: object
    * signer: async (signMessage: string) => { signature: Buffer, publicKey: Buffer }
    */
    Cosmos.prototype.send = function (senderAddress, _a, messages, signer) {
        var gas = _a.gas, gasPrices = _a.gasPrices, memo = _a.memo;
        return __awaiter(this, void 0, void 0, function () {
            var chainId, _b, sequence, accountNumber, _c, hash, included;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.setChainId()];
                    case 1:
                        chainId = _d.sent();
                        return [4 /*yield*/, this.getAccount(senderAddress)];
                    case 2:
                        _b = _d.sent(), sequence = _b.sequence, accountNumber = _b.accountNumber;
                        return [4 /*yield*/, send({ gas: gas, gasPrices: gasPrices, memo: memo }, messages, signer, this.url, chainId, accountNumber, sequence)];
                    case 3:
                        _c = _d.sent(), hash = _c.hash, included = _c.included;
                        this.accounts[senderAddress].sequence = (parseInt(this.accounts[senderAddress].sequence) + 1).toString();
                        return [2 /*return*/, {
                                hash: hash,
                                sequence: sequence,
                                included: included
                            }];
                }
            });
        });
    };
    Cosmos.prototype.simulate = function (senderAddress, _a) {
        var message = _a.message, _b = _a.memo, memo = _b === void 0 ? undefined : _b;
        return __awaiter(this, void 0, void 0, function () {
            var chainId, _c, sequence, accountNumber;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.setChainId()];
                    case 1:
                        chainId = _d.sent();
                        return [4 /*yield*/, this.getAccount(senderAddress)];
                    case 2:
                        _c = _d.sent(), sequence = _c.sequence, accountNumber = _c.accountNumber;
                        return [2 /*return*/, simulate(this.url, senderAddress, chainId, message, memo, sequence, accountNumber)];
                }
            });
        });
    };
    return Cosmos;
}());
export default Cosmos;
export { createSignedTransaction } from './send';
export { createSignMessage } from './signature';
//# sourceMappingURL=index.js.map