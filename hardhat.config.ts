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

task("oracleOwner", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the oracle contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Oracle", args.contract)
    const result = await contract.isOwner()

    console.log("Owner value: ", result)
  })

task("deployCustodian", "Deploys the custodian contract", async (_, hre) => {
  const factory = await hre.ethers.getContractFactory("Custodian")
  const contract = await factory.deploy({ gasLimit: 2100000 })

  console.log("Contract deployed at: ", contract.address)
})

task("deployFakeNFT", "Deploys the FakeNFT contract", async (_, hre) => {
  const factory = await hre.ethers.getContractFactory("FakeNFT")
  const contract = await factory.deploy("Fake NFT", "FNFT", 1000)

  console.log("Contract deployed at: ", contract.address)
})

task("setJobConfig", "Sets the job config on the custodian contract")
  .addPositionalParam("address", "Address of the custodian contract")
  .addPositionalParam("link", "Address of link on the custodian contract")
  .addPositionalParam("oracle", "Address of the oracle node")
  .addPositionalParam("jobId", "The oracle job to run")
  .addPositionalParam("fee", "The oracle fee to pay in LINK")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.address)
    const transaction = await contract.setJobConfig(
      args.link,
      args.oracle,
      args.jobId,
      hre.ethers.utils.parseEther(args.fee)
    )

    console.log("Job config set: ", transaction.hash)
  })

task("getOracle", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the Custodian contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const result = await contract.oracle()

    console.log("Oracle value: ", result)
  })

task("getJobId", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the Custodian contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const result = await contract.jobId()

    console.log("Oracle value: ", result)
  })

  task("getFee", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the Custodian contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const result = await contract.fee()

    console.log("Oracle fee: ", result)
  })

task("verify", "Verifies that user owns a token")
  .addPositionalParam("contract", "The address of the Custodian contract")
  .addPositionalParam("address", "The address to check")
  .addPositionalParam("tokenId", "The token ID to verify")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const transaction = await contract.verify(args.tokenId, { gasLimit: 2100000 })

    console.log("Verification transaction completed: ", transaction.hash)
  })

task(
  "custodianOwnerOf",
  "Verifies if the user owns the token according to the FakeNFT"
)
  .addPositionalParam("contract", "The address of the Custodian contract")
  .addPositionalParam("tokenId", "The token ID to verify")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const ownerOf = await contract.ownerOf(args.tokenId)

    console.log(`Owner of ${args.tokenId}: ${ownerOf}`)
  })

task(
  "custodianFulfills",
  "Check number of fulfill calls on the custodian"
)
  .addPositionalParam("contract", "The address of the Custodian contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("Custodian", args.contract)
    const fulfills = await contract.fulfills()

    console.log(`Fulfills: ${fulfills}`)
  })

task(
  "mint",
  "Mint a FakeNFT"
)
  .addPositionalParam("contract", "The address of the FakeNFT contract")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("FakeNFT", args.contract)
    const transaction = await contract.mint()

    console.log("Mint transaction completed: ", transaction.hash)
  })

task(
  "nftOwnerOf",
  "Verifies if the user owns the token according to the FakeNFT"
)
  .addPositionalParam("contract", "The address of the FakeNFT contract")
  .addPositionalParam("tokenId", "The token ID to verify")
  .setAction(async (args, hre) => {
    const contract = await hre.ethers.getContractAt("FakeNFT", args.contract)
    const ownerOf = await contract.ownerOf(args.tokenId)

    console.log(`Owner of ${args.tokenId}: ${ownerOf}`)
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
