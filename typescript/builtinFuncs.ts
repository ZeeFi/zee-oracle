import { HexString } from "aptos";
import bigInt, { isInstance } from "big-integer";
import { U8, U64, U128, UnsignedInt, takeBigInt } from "./builtinTypes";

export type TypeParamDeclType = {
  name: string;
  isPhantom: boolean;
};

export function abortCode(code: any) {
  if (code instanceof U64) {
    // consier making it nicer by parsing the first and second byte??
    return new Error(`${code.value.toString()}`);
  }
  return code;
}

export function assert(cond: boolean, error: any) {
  if (!cond) {
    throw error;
  }
}

export function u8(
  from: UnsignedInt<any> | bigInt.BigInteger | string | number
) {
  return new U8(takeBigInt(from));
}

export function u64(
  from: UnsignedInt<any> | bigInt.BigInteger | string | number
) {
  return new U64(takeBigInt(from));
}

export function u128(
  from: UnsignedInt<any> | bigInt.BigInteger | string | number
) {
  return new U128(takeBigInt(from));
}

export function strToU8(str: string): U8[] {
  const result: U8[] = [];
  for (let i = 0; i < str.length; i++) {
    result.push(u8(str.charCodeAt(i)));
  }
  return result;
}

export function u8str(array: U8[]): string {
  const u8array = new Uint8Array(array.map((u) => u.toJsNumber()));
  return new TextDecoder().decode(u8array);
}

export function payloadArg(val: any) {
  if (val instanceof UnsignedInt) {
    if (val instanceof U8) {
      return val.toJsNumber();
    } else if (val instanceof U64 || val instanceof U128) {
      return val.value.toString();
    } else {
      throw new Error("Only expect U8, U64, or U128 for integer types");
    }
  } else if (val instanceof HexString) {
    return val.toShortString();
  } else if (typeof val === "boolean") {
    return val;
  } else {
    throw new Error(`Unexpected value type: ${typeof val}`);
  }
}

export function u8ArrayArg(val: U8[]): string {
  const uint8array = new Uint8Array(Array.from(val.map((u) => u.toJsNumber())));
  return HexString.fromUint8Array(uint8array).hex();
}
