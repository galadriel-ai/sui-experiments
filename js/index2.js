import {getFullnodeUrl, SuiClient} from '@mysten/sui.js/client';
import {MIST_PER_SUI} from '@mysten/sui.js/utils';
import {Ed25519Keypair} from '@mysten/sui.js/keypairs/ed25519';
import {TransactionBlock} from "@mysten/sui.js/transactions";
import {bcs} from "@mysten/sui.js/bcs";
import {fromB64} from "@mysten/bcs";
import {PACKAGE_ID, PRIVATE_KEY, PRIVATE_KEY_OWNER, PROMPTS_OBJECT_ID} from "./contracts.js";


const suiClient = new SuiClient({url: getFullnodeUrl('localnet')});

// Convert MIST to Sui
const formatBalance = (balance) => {
  return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
};

async function main() {
  await makeAddPromptTransaction(1, "You are a cool agent 2!")

  const prompts = await getPrompts(PROMPTS_OBJECT_ID)
  console.log(`Prompts:`)
  console.log(prompts)

  await runAgent(
    "Please calculate pi",
    prompts[0].name,
    PRIVATE_KEY,
  )

}


async function getPrompts(objectId) {
  const ownedObject = await suiClient.getObject({
      id: objectId,
      options: {showContent: true},
    }
  )
  const formattedPrompts = []
  const promptListId = ownedObject.data.content.fields.prompts?.fields?.id?.id
  if (promptListId) {
    const prompts = await suiClient.getDynamicFields({
      parentId: promptListId,
    })
    for (const p of prompts.data) {
      const promptObject = await suiClient.getObject({
        id: p.objectId,
        options: {showContent: true}
      })
      formattedPrompts.push(promptObject.data.content.fields)
    }
  }
  return formattedPrompts
}

async function makeAddPromptTransaction(key, prompt) {
  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE_ID}::agent::addPrompt`,
    // object IDs must be wrapped in moveCall arguments
    arguments: [
      txb.object(PROMPTS_OBJECT_ID),
      txb.pure(bcs.U32.serialize(key)),
      txb.pure(bcs.String.serialize(prompt)),
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
    }
  });
  console.log(`Prompt adding result: `, moveCallTxn);
  return moveCallTxn
}

async function runAgent(query, promptId, privateKey) {
  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE_ID}::agent::runAgent`,
    // object IDs must be wrapped in moveCall arguments
    arguments: [
      txb.pure(bcs.U32.serialize(promptId)),
      txb.pure(bcs.String.serialize(query)),
    ],
  });

  const privateKeyBase64 = (Buffer.from(privateKey, 'hex')).toString('base64')
  const keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64))

  const moveCallTxn = await suiClient.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: txb,
    requestType: 'WaitForLocalExecution',
    options: {
      showEffects: true,
    }
  });
  console.log(`Agent run start result: `, moveCallTxn);
  return moveCallTxn
}


main().then(() => {
  console.log("Done")
})