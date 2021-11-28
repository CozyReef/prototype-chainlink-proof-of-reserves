/*2021-11-28. TODO: This is lacking, and will be comprehensive as we bring this
to production ready state. Contracts serve as dummy contracts and SHOULD NOT be
used in production.
*/
import {Custodian} from "../typechain"
import { ethers } from "hardhat"

describe("Custodian", () => {

  let custodian: Custodian

  beforeEach(async () => {
    custodian = await ethers.getContractAt("Custodian", "somewhere")
  })
})
