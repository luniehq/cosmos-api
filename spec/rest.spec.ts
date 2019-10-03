import {
  removeEmptyPropertie
} from "../src/getters

describe(`Signing`, () => {
  it(`createSignature`, () => {
    expect(
        createSignature(signature, sequence, account_number, publicKey)
      ).toMatchObject({
)
