/*2021-11-28. TODO: This is lacking, and will be comprehensive as we bring this
to production ready state. Contracts serve as dummy contracts and SHOULD NOT be
used in production.
*/
import {Custodian, LinkToken, Oracle} from "../typechain"
import { ethers } from "hardhat"
import { readFileSync } from 'fs'
import fetch from "node-fetch";

describe("Custodian", () => {

  let custodian: Custodian
  let link: LinkToken
  let oracle: Oracle
  let jobId: string
  let externalJobId: string
  let chainlinkNodeAddress: string

  beforeEach(async () => {
    const addressOfRinkebyNft = "0xdA9a6BCFf10D92f1D772910e1912a70289584a22"
    const bridgeJson = {
      name: "viewfunction",
      confirmations: 0,
      minimumContractPayment: "0",
      url: "https://rinkeby.arbitrum.io/rpc"
    }
    const authJson = {"email": "test@test.com", "PASSWORD":"Mzsb4c5IMPfNOzMevT2C"}


    const localChainlinkApi = "http://localhost:6688/v2/jobs"
    const localChainlinkSessionsApi = "http://localhost:6688/sessions"
    const localChainlinkBridgeApi = "http://localhost:6688/v2/bridge_types"
    const localChainlinkKeysApi = "http://localhost:6688/v2/keys/eth"

    const custodianFactory = await ethers.getContractFactory("Custodian")
    custodian = await custodianFactory.deploy()

    const Link = await ethers.getContractFactory("LinkToken")
    link = await Link.deploy()

    const oracleFactory = await ethers.getContractFactory("Oracle")
    oracle = await oracleFactory.deploy(link.address)

    // setup chainlink node stuff
    let verifyNft = readFileSync('./jobs/verifyNft.toml.template','utf8');
    verifyNft = verifyNft.replaceAll("{ORACLE_CONTRACT_ADDRESS}", oracle.address)
    verifyNft = verifyNft.replace("{ERC_721_NFT_CONTRACT_ADDRESS}", addressOfRinkebyNft)
    const finalBody = {"toml": verifyNft}

    const authResponse = await fetch(localChainlinkSessionsApi, {
      method: 'POST',
      body: JSON.stringify(authJson),
      headers: {'Content-Type': 'application/json'}
    });
    let cookie = authResponse.headers.get("set-cookie")

    const createBridgeResponse = await fetch(localChainlinkBridgeApi, {
      method: 'POST',
      body: JSON.stringify(bridgeJson),
      headers: {
        'Content-Type': 'application/json',
        'cookie': cookie
      }
    });

    const response = await fetch(localChainlinkApi, {
      method: 'POST',
      body: JSON.stringify(finalBody),
      headers: {
        'Content-Type': 'application/json',
        'cookie': cookie
      }
    });
    const responseAsJson = await response.json()
    jobId = responseAsJson['data']['id']
    externalJobId = responseAsJson['data']['attributes']['externalJobID']

    const keysResponse = await fetch(localChainlinkKeysApi, {
      method: 'GET',
      headers: {'cookie': cookie}
    });
    const keysResponseAsJson = await keysResponse.json()
    chainlinkNodeAddress = keysResponseAsJson['data']['attributes']['address']


    await oracle.setFulfillmentPermission(
      chainlinkNodeAddress, true
    )

    console.log(jobId)
    console.log(externalJobId)
  })

  it("test", async () => {
    //custodian = await ethers.getContractAt("Custodian", "0x1b97f846D8E8AF0d6D20f074Cb73fc1fd27aAE5B")
    //await custodian.setJobConfig(
    //  "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    //  "0x14d2799901336D37810c49c3ed4f9b8fB0B555BE",
    //  "113d550b8df44c689a615968615a97fb",
    //  ethers.utils.parseEther("0.1")
    //)
    //await custodian.verify(0)
    //let address = await custodian.ownerOf(0)
    //console.log("address: ", address)
  })

})
