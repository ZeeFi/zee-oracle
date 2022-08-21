import { AptosAccount, HexString, Types } from "aptos";
import * as fs from "fs";
import * as yaml from "yaml";
import { u8, strToU8, payloadArg, u8ArrayArg } from "./builtinFuncs";

import { AptosClient, FaucetClient } from "aptos";
import { U8 } from "./builtinTypes";

export async function sendPayloadTx(
  client: AptosClient,
  account: AptosAccount,
  payload: Types.TransactionPayload,
  max_gas = 1000
) {
  const txnRequest = await client.generateTransaction(
    account.address(),
    payload,
    { max_gas_amount: `${max_gas}` }
  );
  const signedTxn = await client.signTransaction(account, txnRequest);
  const txnResult = await client.submitTransaction(signedTxn);
  await client.waitForTransaction(txnResult.hash);
  const txDetails = (await client.getTransactionByHash(
    txnResult.hash
  )) as Types.UserTransaction;
  console.log(txDetails);
}

const tokens_intialize = async (id: string, name: string) => {
  const { client, account } = readConfig();
  const id_ = u8(id);
  const name_ = strToU8(name);
  const payload = buildPayload_intialize(id_, name_);
  await sendPayloadTx(client, account, payload);
};

export function buildPayload_intialize(id: U8, name: U8[]) {
  const typeParamStrings = [] as string[];
  return buildPayload(
    "0x867b30a905a6e0802db6bdc8b61d7b0dcad755a408b73999c9cf44a6645a1ede::tokens::intialize",
    typeParamStrings,
    [payloadArg(id), u8ArrayArg(name)]
  );
}

export function buildPayload(
  funcname: string,
  typeArguments: string[],
  args: any[]
): Types.TransactionPayload {
  const parts = funcname.split("::");
  if (parts.length !== 3) {
    throw new Error(`Bad funcname: ${funcname}`);
  }
  const moduleId = {
    address: parts[0],
    name: parts[1],
  };
  const funcId = {
    module: moduleId,
    name: parts[2],
  };
  return {
    type: "script_function_payload",
    //@ts-ignore
    function: funcId,
    type_arguments: typeArguments,
    arguments: args,
  };
}

export const readConfig = () => {
  const ymlContent = fs.readFileSync("../.aptos/config.yaml", {
    encoding: "utf-8",
  });
  const result = yaml.parse(ymlContent);

  const profile = "default";

  const url = result.profiles[profile].rest_url;
  const privateKeyStr = result.profiles[profile].private_key;

  const privateKey = new HexString(privateKeyStr);

  if (!url) {
    throw new Error(`Expect rest_url to be present in ${profile} profile`);
  }
  if (!privateKeyStr) {
    throw new Error(`Expect private_key to be present in ${profile} profile`);
  }

  const client = new AptosClient(result.profiles[profile].rest_url);
  const account = new AptosAccount(privateKey.toUint8Array());
  console.log(`Using address ${account.address().hex()}`);
  return { client, account };
};

const main = async () => {
  tokens_intialize("0", "Eth Oracle");
};

if (require.main === module) {
  main().then((resp) => console.log(resp));
}
