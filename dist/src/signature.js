import * as types from '../lib/types';
/*
The SDK expects a certain message format to serialize and then sign.

type StdSignMsg struct {
  ChainID       string      `json:"chain_id"`
  AccountNumber uint64      `json:"account_number"`
  Sequence      uint64      `json:"sequence"`
  Fee           auth.StdFee `json:"fee"`
  Msgs          []sdk.Msg   `json:"msgs"`
  Memo          string      `json:"memo"`
}
*/
export function createSignMessage(jsonTx, _a) {
    var sequence = _a.sequence, account_number = _a.account_number, chain_id = _a.chain_id;
    // sign bytes need amount to be an array
    var fee = {
        amount: jsonTx.fee.amount || [],
        gas: jsonTx.fee.gas
    };
    return JSON.stringify(removeEmptyProperties({
        fee: fee,
        memo: jsonTx.memo,
        msgs: jsonTx.msg,
        sequence: sequence,
        account_number: account_number,
        chain_id: chain_id
    }, types.StdTx));
}
export function createSignature(signature, sequence, accountNumber, publicKey) {
    return {
        signature: (signature.toString('base64')),
        account_number: accountNumber,
        sequence: sequence,
        pub_key: {
            type: "tendermint/PubKeySecp256k1",
            value: publicKey.toString('base64')
        }
    };
}
types.StdTx;
{
    if (Array.isArray(jsonTx)) {
        return jsonTx.map(removeEmptyProperties);
    }
    // string or number
    if (typeof jsonTx !== "object") {
        return jsonTx;
    }
    var sorted_1 = {};
    Object.keys(jsonTx)
        .sort()
        .forEach(function (key) {
        if (jsonTx[key] === undefined || jsonTx[key] === null)
            return;
        sorted_1[key] = removeEmptyProperties(jsonTx[key]);
    });
    return sorted_1;
}
//# sourceMappingURL=signature.js.map