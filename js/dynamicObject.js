import {getFullnodeUrl, SuiClient} from '@mysten/sui.js/client';
import {DICTIONARY_OBJECT_ID, DICTIONARY_PACKAGE_ID, PRIVATE_KEY_OWNER} from "./contracts.js";
import {fromB64} from "@mysten/bcs";
import {TransactionBlock} from "@mysten/sui.js/transactions";
import {bcs} from "@mysten/sui.js/bcs";
import {Ed25519Keypair} from '@mysten/sui.js/keypairs/ed25519';


const suiClient = new SuiClient({url: getFullnodeUrl('localnet')});


async function main() {
  await makeAddDictionaryValue(
    DICTIONARY_PACKAGE_ID,
    DICTIONARY_OBJECT_ID,
    "key2",
    "My value here! Its nice!"
  )

  const dictionary = await getDictionary(DICTIONARY_OBJECT_ID)
  console.log(JSON.stringify(dictionary))
}

async function getDictionary(objectId) {
  const formattedDictionary = {}
  const objectData = await suiClient.getDynamicFields({
    parentId: objectId,
  })
  for (const internalObjectReference of objectData.data) {
    const dictionaryKeyValuePair = await suiClient.getObject({
      id: internalObjectReference.objectId,
      options: {showContent: true}
    })
    formattedDictionary[internalObjectReference.name.value] = (dictionaryKeyValuePair.data.content.fields.value)
  }
  return formattedDictionary
}

async function makeAddDictionaryValue(packageId, dictionaryId, key, value) {
  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageId}::dictionary::addToDictionary`,
    // object IDs must be wrapped in moveCall arguments
    arguments: [
      txb.object(dictionaryId),
      txb.pure(bcs.String.serialize(key)),
      txb.pure(bcs.String.serialize(value)),
    ],
  });

  const privateKeyBase64 = (Buffer.from(PRIVATE_KEY_OWNER, 'hex')).toString('base64')
  const keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64))

  const moveCallTxn = await suiClient.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: txb,
    requestType: 'WaitForLocalExecution',
    options: {
      showEffects: true,
    },
  });
  console.log(`Prompt adding result: `, moveCallTxn);
  return moveCallTxn
}

main().then(() => {
  console.log("Done")
})