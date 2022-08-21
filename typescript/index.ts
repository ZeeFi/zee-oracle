import { AptosAccount, BCS, HexString, TxnBuilderTypes, Types } from "aptos";
import * as fs from "fs";
import * as yaml from "yaml";
import { u8, strToU8, payloadArg, u8ArrayArg } from "./builtinFuncs";

import { AptosClient, FaucetClient } from "aptos";
import { U8 } from "./builtinTypes";
import {
  EntryFunction,
  RawTransaction,
} from "aptos/dist/transaction_builder/aptos_types";

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

export const payload = async () => {
  const name_: U8[] = strToU8("Eth Oracle");

  const serializer = new BCS.Serializer();
  serializer.serializeFixedBytes(Buffer.from("test"));

  const { client, account } = readConfig();
  const scriptFunctionPayload =
    new TxnBuilderTypes.TransactionPayloadEntryFunction(
      EntryFunction.natural(
        // Fully qualified module name, `AccountAddress::ModuleName`
        "0xce938e214d7b44a98a9acf23ecc1b507e453c143d1026a935834271df6f5f07e::tokens",
        // Module function
        "initialize",
        // The coin type to transfer
        [],
        // Arguments for function `transfer`: receiver account address and amount to transfer
        //[BCS.bcsSerializeU8(1), BCS.bcsSerializeBytes(Buffer.from("test"))]
        [BCS.bcsSerializeU8(1), BCS.bcsSerializeStr("Eth Oracle")]
      )
    );

  // Create a raw transaction out of the transaction payload
  const rawTxn = await client.generateRawTransaction(
    account.address(),
    scriptFunctionPayload,
    { maxGasAmount: 1000n, gastUnitPrice: 2n }
  );

  // Sign the raw transaction with Alice's private key
  const bcsTxn = AptosClient.generateBCSTransaction(account, rawTxn);
  // Submit the transaction
  const transactionRes = await client.submitSignedBCSTransaction(bcsTxn);

  // Wait for the transaction to finish
  await client.waitForTransaction(transactionRes.hash);
  const txDetails = (await client.getTransactionByHash(
    transactionRes.hash
  )) as Types.UserTransaction;
  console.log(txDetails);
};

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
  //tokens_intialize("0", "Eth Oracle");
  await payload();
};

if (require.main === module) {
  main().then((resp) => console.log(resp));
}
