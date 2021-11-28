# Chainlink NFT Proof of Reserves Prototype

This project is a demonstration using Chainlink oracles to validate NFT ownership across different chains. For Cozy Reef, our primary motivation to develop this system is to be able to deploy our primary ERC721 NFT project on Ethereum mainnet but run the Cozy Reef games and treasury on Polygon for transaction cost reduction.

Because our game instances are ephemeral, we designed a platform that absolves us of the risk of taking custody of NFTs like a traditional bridge - game tokens minted on Polygon are only valid for a specific set of game instances, so any ownership divergences are not long lasting.

## How it works

![alt text](https://github.com/CozyReef/prototype-chainlink-proof-of-reserves/blob/main/docs/imgs/architecture.png?raw=true)

1. User mints a ERC721 token on Ethereum
2. User calls a verify call on the `Custodian.sol` contract on Polygon, passing in the tokenId that they own on Ethereum.
3. the Custodian contract generates a ChainlinkOracle request, and submits it to the `Oracle.sol` coordinator contract.
4. The Oracle contract emits an event which is received by the Chainlink core node.
5. The Chainlink node parses the request, and calls a `view-function` [external adapter](https://github.com/smartcontractkit/external-adapters-js/tree/develop/packages/sources/view-function) with the tokenId.
6. The external adapter calls `ownerOf` on the NFT contract on Ethereum.
7. The owner address is passed through a series of callbacks until it's returned to the Custodian contract, which then validates the request and mints the ephemeral game token if conditions are met (Note: in the current demo code, no token is minted, a map object is updated instead). 

## Setup

#### Requires:
- npm
- npx
- docker
- docker-compose

#### Install packages:
`npm install`

#### Update the config files
Update `.env.template` and save to `.env`. `NETWORKS` is a comma delimited list of networks, e.g. `RINKEBY,MUMBAI`. Look at `hardhat.config.ts` to see how environment configs are generated.

Update `.adapter.env.template` and save as `.adapter.env`, this will be use on by the EA so the node (https) should be on the same network as the base ERC721 contract.

Update `./chainlink/mumbai.env.template` to `./chainlink/mumbai.env`. This will be the config for the Chainlink core node, which should be pointed to Polygon (testnet).

#### Setup the Infra 

Run `docker-compose run --service-ports node` to spin up the infrastructure.

Fund your Chainlink node with some native chain token (e.g. matic). You can view your chainlink node at `localhost:6688` and see the address under the `Keys` tab. We used the [Mumbai faucet](https://faucet.polygon.technology/).

## Run the Demo
Example address in the demo have been tested and are viewable in their respective networks.

#### Compile
Compile the contracts:

`npx hardhat compile`

#### Deploy a FakeNFT project

Deploy a FakeNFT contract to Ethereum (testnet)
`npx hardhat deployFakeNFT --network rinkeby` 

In our example the contract address is: 
`0x8Adb9842a8526b3e285Aa289B0Ceb217709e8551`

Mint yourself an NFT:
`npx hardhat mint 0x8Adb9842a8526b3e285Aa289B0Ceb217709e8551 --network rinkeby`

#### Setup the Oracle Coordinator
Deploy the `Oracle.sol` contract to Mumbai, which requires the LINK token address: 

`npx hardhat deployOracle 0x326C977E6efc84E512bB9C30f76E30c160eD06FB --network mumbai`

In this example, the Oracle contract address is: `0x14DD47ceb5070F66B1d5e7d07Fc9DfBd3082b7F8`

Set the Oracle contract's fulfillment permissions with the Chainlink Node's account address:

`npx hardhat oracleSetFulfillmentPermission 0x14DD47ceb5070F66B1d5e7d07Fc9DfBd3082b7F8 0x644d78e293993A9c3C0600Cd335EC1077163C81a --network mumbai`

#### Create the Jobspec
Create the Chainlink node v2 jobspec. The template is found in `./jobs/verifyNft.toml.template`. Replace `ORACLE_CONTRACT_ADDRESS` with the address of the coordinator you set above. Replace `ERC_721_NFT_CONTRACT_ADDRESS` with the ERC721 contract you deployed and minted an NFT on. You can see the example working jobspec at: `./jobs/verifyNft.toml.example`

#### Deploy the Custodian Contract
Deploy the custodian contract on Polygon (testnet):
`npx hardhat deployCustodian --network mumbai`

Example contract address:
`0xcE94fD1471CE2e76b28d7b023b27e19ba17A05Ca`

Fund your custodian contract with link from the [faucet](https://faucets.chain.link/)

Set the config on the Coordinator contract (custodianAddress linkAddress oracleAddress jobId fee):
`npx hardhat setJobConfig 0xcE94fD1471CE2e76b28d7b023b27e19ba17A05Ca 0x326C977E6efc84E512bB9C30f76E30c160eD06FB 0x14DD47ceb5070F66B1d5e7d07Fc9DfBd3082b7F8 a0a896a036a94280a15264dc05211b2e 0.1 --network mumbai`

Note: the `jobId` is the `externalJobId` uuid on your Chainlink job with the dashes removed. Fee must be at least 0.01 LINK. 

#### Kick off the verification job

Call the Verify job with your tokenId:

`npx hardhat verify 0xcE94fD1471CE2e76b28d7b023b27e19ba17A05Ca 0x326C977E6efc84E512bB9C30f76E30c160eD06FB  0 --network mumbai`

#### Verify the Loop

Check the number of times the fullfillment callback has been made:
`npx hardhat custodianFulfills 0xcE94fD1471CE2e76b28d7b023b27e19ba17A05Ca 0 --network mumbai`

Verify that the map object stored your address as the owner:
`npx hardhat custodianOwnerOf 0xcE94fD1471CE2e76b28d7b023b27e19ba17A05Ca 0 --network mumbai`

## Future Work

- Example the proof of concept to mint an ERC721 token on mumbai upon verification
- Write more tests before using this work as the base of a production system
- Update README to have CLI signatures (this can currently be found by looking at the Hardhat task code)
- Evolve this workflow to use an oracle network instead of a single node
