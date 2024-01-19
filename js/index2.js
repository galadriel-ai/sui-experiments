import {getFullnodeUrl, SuiClient} from '@mysten/sui.js/client';
import {MIST_PER_SUI} from '@mysten/sui.js/utils';
import {Ed25519Keypair} from '@mysten/sui.js/keypairs/ed25519';
import {TransactionBlock} from "@mysten/sui.js/transactions";
import {bcs} from "@mysten/sui.js/bcs";
import {fromB64} from "@mysten/bcs";

const MY_ADDRESS = "0x3d13424a38ba62a9e0155c78b44ffb717b8612e1025f3d56bd4592d57a008c5f"
const PRIVATE_KEY = "279b4815bca2414dfad94c6f72ee3191c04c64fd8d839396ba0de669a630fcc7" // no 0x

const ADDRESS_OWNER = "0xa889ea8ef488a5d34fd2691b1982954958e0730c1b8d31cca91ffb346de56b41"
const PRIVATE_KEY_OWNER = "02e5f4af751c878fc74669a886eb00d7489dfc988a3587937d6539f1aab61224" // no 0x

const PACKAGE_ID = "0xda13e0343d7608fee50e7b3c830d5c589c5649b9cd7f6e5ae017161fd0d72acb"
const PROMPTS_OBJECT_ID = "0x05b51f2fc03125408dbb4fd649bb618d8948bed944ac0a3eaad756f5c70ea8f2"

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