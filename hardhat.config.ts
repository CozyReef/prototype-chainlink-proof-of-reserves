import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"
import { ethers } from "ethers"
import { HardhatUserConfig } from "hardhat/config"

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
    ],
  },
  defaultNetwork: "hardhat",
  paths: {
    tests: "./tests",
  },
  typechain: {
    outDir: "./typechain",
  },
}

module.exports = config
