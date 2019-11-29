"use strict";
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
exports.__esModule = true;
var ledger_cosmos_js_1 = require("ledger-cosmos-js");
var secp256k1_1 = require("secp256k1");
var semver = require('semver');
var crypto = require("crypto");
var Ripemd160 = require("ripemd160");
var bech32 = require("bech32");
var INTERACTION_TIMEOUT = 120; // seconds to wait for user action on Ledger, currently is always limited to 60
var REQUIRED_COSMOS_APP_VERSION = '1.5.0';
/*
HD wallet derivation path (BIP44)
DerivationPath{44, 118, account, 0, index}
*/
var HDPATH = [44, 118, 0, 0, 0];
var BECH32PREFIX = "cosmos";
var Ledger = /** @class */ (function () {
    function Ledger(_a, hdPath, hrp) {
        var _b = (_a === void 0 ? { testModeAllowed: false } : _a).testModeAllowed, testModeAllowed = _b === void 0 ? false : _b;
        if (hdPath === void 0) { hdPath = HDPATH; }
        if (hrp === void 0) { hrp = BECH32PREFIX; }
        this.testModeAllowed = testModeAllowed;
        this.hdPath = hdPath;
        this.hrp = hrp;
    }
    // quickly test connection and compatibility with the Ledger device throwing away the connection
    Ledger.prototype.testDevice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var secondsTimeout;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        secondsTimeout = 3 // a lower value always timeouts
                        ;
                        return [4 /*yield*/, this.connect(secondsTimeout)];
                    case 1:
                        _a.sent();
                        this.cosmosApp = null;
                        return [2 /*return*/, this];
                }
            });
        });
    };
    // check if the Ledger device is ready to receive signing requests
    Ledger.prototype.isReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            var version, msg, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCosmosAppVersion()];
                    case 1:
                        version = _a.sent();
                        if (!semver.gte(version, REQUIRED_COSMOS_APP_VERSION)) {
                            msg = "Outdated version: Please update Ledger Cosmos App to the latest version.";
                            throw new Error(msg);
                        }
                        return [4 /*yield*/, this.cosmosApp.getVersion()];
                    case 2:
                        response = _a.sent();
                        this.checkLedgerErrors(response);
                        // throws if not open
                        return [4 /*yield*/, this.isCosmosAppOpen()];
                    case 3:
                        // throws if not open
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // connects to the device and checks for compatibility
    // the timeout is the time the user has to react to requests on the Ledger device
    // set a low timeout to only check the connection without preparing the connection for user input
    Ledger.prototype.connect = function (timeout) {
        if (timeout === void 0) { timeout = INTERACTION_TIMEOUT; }
        return __awaiter(this, void 0, void 0, function () {
            var transport, TransportWebHID, TransportU2F, cosmosLedgerApp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // assume well connection if connected once
                        if (this.cosmosApp)
                            return [2 /*return*/, this];
                        if (!navigator.hid) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@ledgerhq/hw-transport-webhid'); })];
                    case 1:
                        TransportWebHID = _a.sent();
                        return [4 /*yield*/, TransportWebHID.create(timeout * 1000)];
                    case 2:
                        transport = _a.sent();
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, Promise.resolve().then(function () { return require('@ledgerhq/hw-transport-u2f'); })];
                    case 4:
                        TransportU2F = _a.sent();
                        return [4 /*yield*/, TransportU2F.create(timeout * 1000)];
                    case 5:
                        transport = _a.sent();
                        _a.label = 6;
                    case 6:
                        cosmosLedgerApp = new ledger_cosmos_js_1["default"](transport);
                        this.cosmosApp = cosmosLedgerApp;
                        // checks if the Ledger is connected and the app is open
                        return [4 /*yield*/, this.isReady()];
                    case 7:
                        // checks if the Ledger is connected and the app is open
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    // returns the cosmos app version as a string like "1.1.0"
    Ledger.prototype.getCosmosAppVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, major, minor, patch, test_mode, version;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.cosmosApp.getVersion()];
                    case 2:
                        response = _a.sent();
                        this.checkLedgerErrors(response);
                        major = response.major, minor = response.minor, patch = response.patch, test_mode = response.test_mode;
                        exports.checkAppMode(this.testModeAllowed, test_mode);
                        version = versionString({ major: major, minor: minor, patch: patch });
                        return [2 /*return*/, version];
                }
            });
        });
    };
    // checks if the cosmos app is open
    // to be used for a nicer UX
    Ledger.prototype.isCosmosAppOpen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, appName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cosmosApp.deviceInfo()];
                    case 1:
                        response = _a.sent();
                        this.checkLedgerErrors(response);
                        return [4 /*yield*/, this.getOpenApp()];
                    case 2:
                        appName = _a.sent();
                        if (appName.toLowerCase() !== "cosmos") {
                            throw new Error("Close " + appName + " and open the Cosmos app");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Ledger.prototype.getOpenApp = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, appName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.cosmosApp.appInfo()];
                    case 2:
                        response = _a.sent();
                        this.checkLedgerErrors(response);
                        appName = response.appName;
                        return [2 /*return*/, appName];
                }
            });
        });
    };
    // returns the public key from the Ledger device as a Buffer
    Ledger.prototype.getPubKey = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.cosmosApp.publicKey(this.hdPath)];
                    case 2:
                        response = _a.sent();
                        this.checkLedgerErrors(response);
                        return [2 /*return*/, response.compressed_pk];
                }
            });
        });
    };
    // returns the cosmos address from the Ledger as a string
    Ledger.prototype.getCosmosAddress = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pubKey, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getPubKey()];
                    case 2:
                        pubKey = _a.sent();
                        return [4 /*yield*/, getBech32FromPK(this.hrp, pubKey)];
                    case 3:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    // triggers a confirmation request of the cosmos address on the Ledger device
    Ledger.prototype.confirmLedgerAddress = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cosmosAppVersion, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getCosmosAppVersion()];
                    case 2:
                        cosmosAppVersion = _a.sent();
                        if (semver.lt(cosmosAppVersion, REQUIRED_COSMOS_APP_VERSION)) {
                            // we can't check the address on an old cosmos app
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.cosmosApp.getAddressAndPubKey(this.hdPath, this.hrp)];
                    case 3:
                        response = _a.sent();
                        this.checkLedgerErrors(response, {
                            rejectionMessage: 'Displayed address was rejected'
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    // create a signature for any message
    // in Cosmos this should be a serialized StdSignMsg
    // this is ideally generated by the @lunie/cosmos-js library
    Ledger.prototype.sign = function (signMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var response, parsedSignature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.cosmosApp.sign(this.hdPath, signMessage)];
                    case 2:
                        response = _a.sent();
                        this.checkLedgerErrors(response);
                        parsedSignature = secp256k1_1.signatureImport(response.signature);
                        return [2 /*return*/, parsedSignature];
                }
            });
        });
    };
    // parse Ledger errors in a more user friendly format
    /* istanbul ignore next: maps a bunch of errors */
    Ledger.prototype.checkLedgerErrors = function (_a, _b) {
        var error_message = _a.error_message, device_locked = _a.device_locked;
        var _c = _b === void 0 ? {} : _b, _d = _c.timeoutMessag, timeoutMessag = _d === void 0 ? 'Connection timed out. Please try again.' : _d, _e = _c.rejectionMessage, rejectionMessage = _e === void 0 ? 'User rejected the transaction' : _e;
        if (device_locked) {
            throw new Error("Ledger's screensaver mode is on");
        }
        switch (error_message) {
            case "U2F: Timeout":
                throw new Error(timeoutMessag);
            case "Cosmos app does not seem to be open":
                throw new Error("Cosmos app is not open");
            case "Command not allowed":
                throw new Error("Transaction rejected");
            case "Transaction rejected":
                throw new Error(rejectionMessage);
            case "Unknown Status Code: 26628":
                throw new Error("Ledger's screensaver mode is on");
            case "Instruction not supported":
                throw new Error("Your Cosmos Ledger App is not up to date. " +
                    ("Please update to version " + REQUIRED_COSMOS_APP_VERSION + "."));
            case "No errors":
                // do nothing
                break;
            case "TransportError: Failed to sign with Ledger device: U2F DEVICE_INELIGIBLE":
                new Error("Couldn't connect to Ledger. Is you Ledger connected and the Cosmos App open?");
            default:
                throw new Error("Ledger Native Error: " + error_message);
        }
    };
    return Ledger;
}());
exports["default"] = Ledger;
// stiched version string from Ledger app version object
function versionString(_a) {
    var major = _a.major, minor = _a.minor, patch = _a.patch;
    return major + "." + minor + "." + patch;
}
// wrapper to throw if app is in testmode but it is not allowed to be in testmode
exports.checkAppMode = function (testModeAllowed, testMode) {
    if (testMode && !testModeAllowed) {
        throw new Error("DANGER: The Cosmos Ledger app is in test mode and shouldn't be used on mainnet!");
    }
};
// doesn't properly work in ledger-cosmos-js
function getBech32FromPK(hrp, pk) {
    if (pk.length !== 33) {
        throw new Error('expected compressed public key [31 bytes]');
    }
    var hashSha256 = crypto
        .createHash('sha256')
        .update(pk)
        .digest();
    var hashRip = new Ripemd160().update(hashSha256).digest();
    return bech32.encode(hrp, bech32.toWords(hashRip));
}
