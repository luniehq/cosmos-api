import Ledger from '../src/cosmos-ledger'

jest.mock('secp256k1', () => ({
  signatureImport: () => Buffer.from('1234')
}))

jest.mock('@ledgerhq/hw-transport-u2f', () => ({
  default: {
    create: async () => ({})
  }
}))

const config = {
  testModeAllowed: false
}

describe(`Ledger`, () => {
  let ledger: Ledger
  beforeEach(() => {
    ledger = new Ledger(config)
  })

  it('testDevice', async () => {
    const self = {
      connect: jest.fn()
    }
    await ledger.testDevice.call(self)
    expect(self.connect).toHaveBeenCalledWith(3)
  })

  describe('connect', () => {
    it('connects', async () => {
      jest.resetModules()
      jest.doMock('ledger-cosmos-js', () => ({
        default: class MockApp {
          publicKey() {
            return {
              error_message: 'No errors'
            }
          }
          getVersion() {
            return {
              major: '1',
              minor: '5',
              patch: '0',
              test_mode: false,
              error_message: 'No errors'
            }
          }
          appInfo() {
            return {
              appName: 'Cosmos',
              error_message: 'No errors'
            }
          }
        }
      }))
      const Ledger = require('../src/cosmos-ledger').default
      ledger = new Ledger(config)
      await ledger.connect()
    })

    it('uses existing connection', async () => {
      const self = {
        isSendingData: jest.fn(),
        isReady: jest.fn(),
        cosmosApp: {}
      }
      await ledger.connect.call(self)
      expect(self.cosmosApp).toBeDefined()
      expect(self.isSendingData).not.toHaveBeenCalled()
      expect(self.isReady).not.toHaveBeenCalled()
    })

    it("fails if can't get data from device", async () => {
      jest.resetModules()
      jest.doMock('ledger-cosmos-js', () => ({
        default: class MockApp {
          publicKey() {
            return {
              error_message: 'BIG ERROR'
            }
          }
        }
      }))
      const Ledger = require('../src/cosmos-ledger')
      ledger = new Ledger.default(config)

      await expect(ledger.connect()).rejects.toThrow('BIG ERROR')
    })

    it('fails if Cosmos App is outdated', async () => {
      jest.resetModules()
      jest.doMock('ledger-cosmos-js', () => ({
        default: class MockApp {
          publicKey() {
            return {
              error_message: 'No errors'
            }
          }
          getVersion() {
            return {
              major: '1',
              minor: '0',
              patch: '0',
              test_mode: false,
              error_message: 'No errors'
            }
          }
        }
      }))
      const Ledger = require('../src/cosmos-ledger')
      ledger = new Ledger.default(config)

      await expect(ledger.connect()).rejects.toThrow(
        'Outdated version: Please update Ledger Cosmos App to the latest version.'
      )
    })

    it('fails if Ledger device is locked', async () => {
      jest.resetModules()
      jest.doMock('ledger-cosmos-js', () => ({
        App: class MockApp {
          publicKey() {
            return {
              error_message: 'No errors',
              device_locked: true
            }
          }
        }
      }))
      const Ledger = require('../src/cosmos-ledger')
      ledger = new Ledger.default(config)

      await expect(ledger.connect()).rejects.toThrow('')
    })
  })

  describe('getCosmosAppVersion', () => {
    it('new version', async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          getVersion: () => ({
            major: '1',
            minor: '5',
            patch: '0',
            test_mode: false
          })
        },
        checkLedgerErrors: jest.fn()
      }
      const res = await ledger.getCosmosAppVersion.call(self)
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
      expect(res).toBe('1.5.0')
    })

    it('old version', async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          getVersion: () => ({
            major: '1',
            minor: '1',
            patch: '0',
            test_mode: false,
            error_message: 'No errors'
          })
        },
        checkLedgerErrors: jest.fn()
      }
      expect(await ledger.getCosmosAppVersion.call(self)).toBe('1.1.0')
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
    })

    it('test mode', async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          getVersion: () => ({
            major: '1',
            minor: '5',
            patch: '0',
            test_mode: true,
            error_message: 'No errors'
          })
        },
        checkLedgerErrors: jest.fn()
      }
      await expect(ledger.getCosmosAppVersion.call(self)).rejects.toThrow()
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
    })
  })

  describe('isCosmosAppOpen', () => {
    it('success', async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          appInfo: () => ({
            appName: 'Cosmos',
            error_message: 'No errors'
          })
        },
        checkLedgerErrors: jest.fn()
      }
      await ledger.isCosmosAppOpen.call(self)
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
    })

    it('failure', async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          appInfo: () => ({
            appName: 'Ethereum',
            error_message: 'No errors'
          })
        },
        checkLedgerErrors: jest.fn()
      }
      await expect(ledger.isCosmosAppOpen.call(self)).rejects.toThrow()
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
    })
  })

  it('getCosmosAddress', async () => {
    const self = {
      connect: jest.fn(),
      getPubKey: jest.fn(() => Buffer.from('1234'))
    }
    const res = await ledger.getCosmosAddress.call(self)
    expect(self.connect).toHaveBeenCalled()
    expect(res).toBe('cosmos1l4aqmqyen0kawmy6pq5q27qhl3synfg8uqcsa5')
  })

  it('getPubKey', async () => {
    const self = {
      connect: jest.fn(),
      checkLedgerErrors: jest.fn(),
      cosmosApp: {
        publicKey: () => ({
          compressed_pk: Buffer.from('1234'),
          error_message: 'No errors'
        })
      }
    }
    const res = await ledger.getPubKey.call(self)
    expect(self.connect).toHaveBeenCalled()
    expect(self.checkLedgerErrors).toHaveBeenCalled()
    expect(res instanceof Buffer).toBe(true)
  })

  describe('confirmLedgerAddress', () => {
    it('new version', async () => {
      const self = {
        checkLedgerErrors: jest.fn(),
        connect: jest.fn(),
        getCosmosAppVersion: () => '1.5.0',
        cosmosApp: {
          getAddressAndPubKey: jest.fn(() => ({
            error_message: 'No errors'
          }))
        }
      }
      await ledger.confirmLedgerAddress.call(self)
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
      expect(self.cosmosApp.getAddressAndPubKey).toHaveBeenCalled()
    })

    it('old version', async () => {
      const self = {
        checkLedgerErrors: jest.fn(),
        connect: jest.fn(),
        getCosmosAppVersion: () => '1.1.0',
        cosmosApp: {
          getAddressAndPubKey: jest.fn(() => ({
            error_message: 'No errors'
          }))
        }
      }
      await ledger.confirmLedgerAddress.call(self)
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).not.toHaveBeenCalled()
      expect(self.cosmosApp.getAddressAndPubKey).not.toHaveBeenCalled()
    })
  })

  it('sign', async () => {
    const self = {
      checkLedgerErrors: jest.fn(),
      connect: jest.fn(),
      getCosmosAppVersion: () => '1.1.0',
      cosmosApp: {
        sign: jest.fn(() => ({
          signature: Buffer.from('1234'), // needs to be a DER signature, but the upstream library is mockeed here
          error_message: 'No errors'
        }))
      },
      hdPath: [44, 118, 0, 0, 0]
    }
    const res = await ledger.sign.call(self, 'message')
    expect(self.connect).toHaveBeenCalled()
    expect(self.checkLedgerErrors).toHaveBeenCalled()
    expect(self.cosmosApp.sign).toHaveBeenCalledWith(expect.any(Array), 'message')
    expect(res instanceof Buffer).toBe(true)
  })
})
