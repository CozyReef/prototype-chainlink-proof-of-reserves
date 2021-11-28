import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"
import * as dotenv from "dotenv"
import { ethers } from "ethers"
import { HardhatUserConfig, task } from "hardhat/config"

dotenv.config()
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

task("deployOracle", "Deploys the oracle contract")
  .addPositionalParam("link", "Address of link on the custodian contract")
  .setAction( async (args, hre) => {
  const factory = await hre.ethers.getContractFactory("Oracle")
  const contract = await factory.deploy(args.link, { gasLimit: 2100000 })

  console.log("Contract deployed at: ", contract.address)
})

// npx hardhat deployOracle 0x326C977E6efc84E512bB9C30f76E30c160eD06FB --network mumbai

task("oracleSetFulfillmentPermission")
  .addPositionalParam("address", "Address of the oracle")
  .addPositionalParam("nodeAddress", "Address of the chainlink node")
  .setAction( async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Oracle", args.address)
    const transaction = await contract.setFulfillmentPermission(
      args.nodeAddress,
      true
    )

    console.log("Permission set: ", transaction.hash)
  })
// npx hardhat oracleSetFulfillmentPermission 0x14DD47ceb5070F66B1d5e7d07Fc9DfBd3082b7F8 0x644d78e293993A9c3C0600Cd335EC1077163C81a --network mumbai

task("oracleOwner", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the oracle contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Oracle", args.contract)
    const result = await contract.isOwner()

    console.log("Owner value: ", result)
  })

// npx hardhat oracleOwner 0x206Cc4d96cd769d6C30Cf1E83AA90bAd30B45767

task("deployCustodian", "Deploys the custodian contract", async (_, hre) => {
  const factory = await hre.ethers.getContractFactory("Custodian")
  const contract = await factory.deploy({ gasLimit: 2100000 })

  console.log("Contract deployed at: ", contract.address)
})

// npx hardhat deployCustodian --network mumbai
//0x2C3349AAb732d0967Ac7dDB096b91b5e1c02714a

task("deployFakeNFT", "Deploys the FakeNFT contract", async (_, hre) => {
  const factory = await hre.ethers.getContractFactory("FakeNFT")
  const contract = await factory.deploy("Fake NFT", "FNFT", 1000)

  console.log("Contract deployed at: ", contract.address)
})

// npx hardhat deployFakeNFT --network rinkeby
//0x8Adb9842a8526b3e285Aa289B0Ceb217709e8551


task("setJobConfig", "Sets the job config on the custodian contract")
  .addPositionalParam("address", "Address of the custodian contract")
  .addPositionalParam("link", "Address of link on the custodian contract")
  .addPositionalParam("oracle", "Address of the oracle node")
  .addPositionalParam("jobId", "The oracle job to run")
  .addPositionalParam("fee", "The oracle fee to pay in LINK")
  .setAction(async (args, hre) => {
    //const jobId = ethers.utils.parseBytes32String(args.jobId)
    const contract = await hre.ethers.getContractAt("Custodian", args.address)
    const transaction = await contract.setJobConfig(
      args.link,
      args.oracle,
      args.jobId,
      hre.ethers.utils.parseEther(args.fee)
    )

    console.log("Job config set: ", transaction.hash)
  })


// external job id --> remove hyphens 0eec7e1dd0d2476ca1a872dfb6633f02
// npx hardhat setJobConfig 0x2C3349AAb732d0967Ac7dDB096b91b5e1c02714a 0x326C977E6efc84E512bB9C30f76E30c160eD06FB 0x14DD47ceb5070F66B1d5e7d07Fc9DfBd3082b7F8 69dad7b2102f48b8b118e47580876fe6 0.1 --network mumbai

task("getOracle", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the Custodian contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const result = await contract.oracle()

    console.log("Oracle value: ", result)
  })

  // npx hardhat getOracle 0x2C3349AAb732d0967Ac7dDB096b91b5e1c02714a --network mumbai

task("getJobId", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the Custodian contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const result = await contract.jobId()

    console.log("Oracle value: ", result)
  })

  // npx hardhat getJobId 0x2C3349AAb732d0967Ac7dDB096b91b5e1c02714a --network mumbai

  task("getFee", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the Custodian contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const result = await contract.fee()

    console.log("Oracle fee: ", result)
  })

  // npx hardhat getFee 0x2C3349AAb732d0967Ac7dDB096b91b5e1c02714a --network mumbai

task("verify", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the Custodian contract")
  .addPositionalParam("address", "The address to check")
  .addPositionalParam("tokenId", "The token ID to verify")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const transaction = await contract.verify(args.tokenId, { gasLimit: 2100000 })

    console.log("Verification transaction completed: ", transaction.hash)
  })


// npx hardhat verify 0x2C3349AAb732d0967Ac7dDB096b91b5e1c02714a 0x326C977E6efc84E512bB9C30f76E30c160eD06FB  1 --network mumbai


task(
  "ownerOf",
  "Verifies if the user owns the token according to the Custodian"
)
  .addPositionalParam("contract", "The address of the Custodian contract")
  .addPositionalParam("address", "The address to check")
  .addPositionalParam("tokenId", "The token ID to verify")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const isOwner = await contract.ownerOf(args.tokenId)

    console.log(`Owner of ${args.tokenId}: ${isOwner}`)
  })

const { NETWORKS } = process.env

const networkEntries = NETWORKS
  ? NETWORKS.split(",")
      .filter((v) => !!v)
      .map((network) => {
        const urlVar = network.toUpperCase() + "_API_URL"
        const privateKeyVar = network.toUpperCase() + "_PRIVATE_KEY"

        const url = process.env[urlVar]
        const privateKey = process.env[privateKeyVar]

        const key = network.toLowerCase()
        const value = { url, accounts: [privateKey] }

        return [key, value]
      })
  : []

const networkConfigs = Object.fromEntries(networkEntries)

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.6",
      },
      {
        version: "0.8.4",
        settings: { },
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: networkConfigs,
  paths: {
    tests: "./tests",
  },
  typechain: {
    outDir: "./typechain",
  },
}

module.exports = config
