# Sui

Install

```bash
brew tap mystenlabs/tap
brew install mystenlabs/tap/sui
```

## Run testnet

```bash
./executables/sui-test-validator-macos-arm64
```

Test that it works

```bash
curl --location --request POST 'http://127.0.0.1:9000' \
--header 'Content-Type: application/json' \
--data-raw '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sui_getTotalTransactionBlocks",
  "params": []
}'
```

```bash
sui client switch --env local
```

## Explorer

```bash
cd sui
pnpm install
pnpm turbo build
pnpm explorer dev
```

Open http://localhost:3000/

## Wallet (clone sui repo)

```
cp sui/apps/wallet/configs/environment/.env.defaults sui/apps/wallet/configs/environment/.env
nano sui/apps/wallet/configs/environment/.env.defaults sui/apps/wallet/configs/environment/.env
```

edit the first line to read API_ENV=local

Run

```bash
cd sui
pnpm wallet dev
```

Install
wallet [here](https://docs.sui.io/guides/developer/getting-started/local-network#install-sui-wallet-and-sui-explorer-locally)

Get wallet address and add here to fund it:
And fund address gotten from `sui client addresses` too

```bash
curl --location --request POST 'http://127.0.0.1:9123/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "0x3d13424a38ba62a9e0155c78b44ffb717b8612e1025f3d56bd4592d57a008c5f"
    }
}'
```

# Move

To create packages

```bash
sui move new my_first_package
```

To build

```bash
cd my_first_package
sui move build
```

Deploy
```bash
sui client publish --gas-budget 100000000
```

Example
```
╭──────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Object Changes                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│ Created Objects:                                                                                     │
│  ┌──                                                                                                 │
│  │ ObjectID: 0x1831fa205960ca643520d210670938325642bf1220d7203f5839fb86a75d91b0                      │
│  │ Sender: 0xa889ea8ef488a5d34fd2691b1982954958e0730c1b8d31cca91ffb346de56b41                        │
│  │ Owner: Account Address ( 0xa889ea8ef488a5d34fd2691b1982954958e0730c1b8d31cca91ffb346de56b41 )     │
│  │ ObjectType: 0x3fb7e588aa0894d205ef78b32b3f3a188cdf292571b31177be5ccd6666d514fa::my_module::Forge  │
│  │ Version: 6                                                                                        │
│  │ Digest: 7bbJzh31fnJz94fJ8nAXDsy37ZTeV4JUmP2jc468j4rc                                              │
│  └──                                                                                                 │
│  ┌──                                                                                                 │
│  │ ObjectID: 0xcd85d22b772ed12cdd224a025aff3fcd15d4be47668cc694015f9a1bb43a8449                      │
│  │ Sender: 0xa889ea8ef488a5d34fd2691b1982954958e0730c1b8d31cca91ffb346de56b41                        │
│  │ Owner: Account Address ( 0xa889ea8ef488a5d34fd2691b1982954958e0730c1b8d31cca91ffb346de56b41 )     │
│  │ ObjectType: 0x2::package::UpgradeCap                                                              │
│  │ Version: 6                                                                                        │
│  │ Digest: 6CRCdb2mk464zLbwMpFxscQtWCqYqWevXzcSCUd8rfxw                                              │
│  └──                                                                                                 │
│                                                                                                      │
│ Mutated Objects:                                                                                     │
│  ┌──                                                                                                 │
│  │ ObjectID: 0x904fd3ed9e8182f918157359139cece5ccdf3ca98a87372289a1b03c22671bd8                      │
│  │ Sender: 0xa889ea8ef488a5d34fd2691b1982954958e0730c1b8d31cca91ffb346de56b41                        │
│  │ Owner: Account Address ( 0xa889ea8ef488a5d34fd2691b1982954958e0730c1b8d31cca91ffb346de56b41 )     │
│  │ ObjectType: 0x2::coin::Coin<0x2::sui::SUI>                                                        │
│  │ Version: 6                                                                                        │
│  │ Digest: B57o4BsWY9vvT1cHsLQ8wgPkXtMppa3diM5HVmEu167q                                              │
│  └──                                                                                                 │
│                                                                                                      │
│ Published Objects:                                                                                   │
│  ┌──                                                                                                 │
│  │ PackageID: 0x3fb7e588aa0894d205ef78b32b3f3a188cdf292571b31177be5ccd6666d514fa                     │
│  │ Version: 1                                                                                        │
│  │ Digest: ENNk5GzHXxQLQFEHVS61C7u6ZAyG9W7ZUkSVh2YPuD49                                              │
│  │ Modules: my_module                                                                                │
│  └──                                                                                                 │
╰──────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

Call function
```bash
sui client call \
--package 0x3fb7e588aa0894d205ef78b32b3f3a188cdf292571b31177be5ccd6666d514fa \
--module my_module
--function sword_create
--type-args 
```

## JS scripts

```bash
cd js
pnpm install
pnpm run dev
```

## APP

```bash
cd my-first-sui-dapp
pnpm install
pnpm run dev
```
http://localhost:5173/

