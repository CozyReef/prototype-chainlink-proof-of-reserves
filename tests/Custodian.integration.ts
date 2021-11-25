import {Custodian} from "../typechain"
import { ethers } from "hardhat"

describe("Custodian", () => {

  let custodian: Custodian

  beforeEach(async () => {
    custodian = await ethers.getContractAt("Custodian", "somewhere")
  })
})
