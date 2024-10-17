import { XCallEvm } from "@galacticcouncil/xcm-sdk"
import { Result as AbiDecoderResult } from "ethers/lib/utils"
import { utils } from "ethers"
import { TransactionRequest } from "@ethersproject/providers"

/**
 * Splits a hex string by consecutive zeroes.
 */
export function splitHexByZeroes(hex: string) {
  if (typeof hex !== "string") return []

  return hex.replace("0x", "").split(/(0{3,})/g)
}

/**
 * Converts decoded EVM data to JSON format.
 */
export function decodedResultToJson(result: AbiDecoderResult) {
  if (!Array.isArray(result)) return {}
  return Object.entries(result).reduce((acc: any, [key, value]) => {
    if (isNaN(parseInt(key))) {
      acc[key] =
        Array.isArray(value) && value.every((v) => typeof v !== "string")
          ? decodedResultToJson(value)
          : value?._isBigNumber
            ? value.toString()
            : value
    }
    return acc
  }, {})
}

/**
 * Slices a hex string by a specified range.
 */
export function hexDataSlice(data: string, start: number, end?: number) {
  return `0x${data.substring(start, end)}`
}

/**
 * Decodes evm transaction data to JSON format and returns the method name.
 */
export function decodeEvmCall(call: {
  abi?: string
  data: `0x${string}` | TransactionRequest
}) {
  if (!call?.abi) return
  try {
    const data =
      typeof call.data === "string"
        ? call.data
        : call.data.data?.toString() || ""
    const iface = new utils.Interface(call.abi)
    const decodedArgs = iface.decodeFunctionData(data.slice(0, 10), data)
    const method = iface.getFunction(data.slice(0, 10)).name

    return { data: decodedResultToJson(decodedArgs), method }
  } catch (error) {
    console.log("Error decoding XCallEvm data", error)
  }
}
