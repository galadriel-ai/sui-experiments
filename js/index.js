import {getFullnodeUrl, SuiClient} from '@mysten/sui.js/client';
import {MIST_PER_SUI} from '@mysten/sui.js/utils';
import {Ed25519Keypair} from '@mysten/sui.js/keypairs/ed25519';
import {TransactionBlock} from "@mysten/sui.js/transactions";
import {bcs} from "@mysten/sui.js/bcs";
import {fromB64} from "@mysten/bcs";

// YOur own wallet address and key
const MY_ADDRESS = "0x3d13424a38ba62a9e0155c78b44ffb717b8612e1025f3d56bd4592d57a008c5f"
const PRIVATE_KEY = "0x279b4815bca2414dfad94c6f72ee3191c04c64fd8d839396ba0de669a630fcc7"

const ADDRESS_OWNER = "0xa889ea8ef488a5d34fd2691b1982954958e0730c1b8d31cca91ffb346de56b41"
// Get address with `sui client addresses` and extract private key with keychain
const PRIVATE_KEY_OWNER = "02e5f4af751c878fc74669a886eb00d7489dfc988a3587937d6539f1aab61224" // no 0x

const PACKAGE_ID = "0x3fb7e588aa0894d205ef78b32b3f3a188cdf292571b31177be5ccd6666d514fa"
const FORGE_OBJECT_ID = "0x1831fa205960ca643520d210670938325642bf1220d7203f5839fb86a75d91b0"

const suiClient = new SuiClient({url: getFullnodeUrl('localnet')});

// Convert MIST to Sui
const formatBalance = (balance) => {
  return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
};

async function main() {
  const balance = await suiClient.getBalance({
    owner: ADDRESS_OWNER,
  });
  console.log(`Balance: ${formatBalance(balance)}`)
  await getOwnedObject(FORGE_OBJECT_ID)

  const tx = await makeCreateTransaction(12, 13);
  const objectCreated = tx.effects.created[0]
  console.log("Created sword: ")
  await getOwnedObject(objectCreated.reference.objectId)
  console.log(`Forge after: ${await getOwnedObject(FORGE_OBJECT_ID)}`)
}


async function getOwnedObject(objectId) {
  // const ownedObjects = await suiClient.getOwnedObjects({
  //   owner: MY_ADDRESS,
  // });
  const ownedObject = await suiClient.getObject({
      id: objectId,
      options: {showContent: true},
    }
  )
  console.log(ownedObject.data.content.fields)
}

async function makeCreateTransaction(magic, strength) {
  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${PACKAGE_ID}::my_module::sword_create`,
    // object IDs must be wrapped in moveCall arguments
    arguments: [
      txb.object(FORGE_OBJECT_ID),
      txb.pure(bcs.U64.serialize(magic)),
      txb.pure(bcs.U64.serialize(strength)),
      txb.pure(bcs.Address.serialize(MY_ADDRESS)),
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
  console.log(`Sword creation result: `, moveCallTxn);
  return moveCallTxn
}

main().then(() => {
  console.log("Done")
})