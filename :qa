export interface RPCTxQueryWithProofResponseJSON {
	id: string,
	jsonrpc: string,
	result: TxQueryWithProofResponse
}

export interface TxQueryWithProofResponse {
	hash: string,
	height: string
	index: number,
	tx_result: TxResult
	tx: any // amino encoded tx data
	proof: ProofData
}

export interface TxResult {
	log: string,
	gasWanted: string,
	gasUsed: string,
	events: Array<EventDatas>
}

export interface EventDatas {
type: string,
attributes: Array<Event>
}

export interface Event {
	key: any
	value: any // this data is encoded, I'm not sure with what. We need amino!
}

export interface ProofData {
	RootHash: string,
	Data: any // amino encoded Tx Data?
	Proof: Proof
}

export interface Proof {
	total: string,
	index: string,
	leaf_hash: any // better way to represent hash data?
	aunts: Array<Proof>
}


