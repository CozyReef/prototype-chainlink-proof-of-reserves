// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Custodian is ChainlinkClient, Ownable {
  using Chainlink for Chainlink.Request;
  using Strings for uint256;

  address public oracle;
  bytes32 public jobId;
  uint256 public fee;

  struct Request {
    address sender;
    uint256 tokenId;
  }

  mapping(bytes32 => Request) public requests;
  mapping(uint256 => address) public owners;
  uint256 public fulfills;

  mapping(address => bool) public requestPending;

  constructor() {}

  function setJobConfig(
    address _link,
    address _oracle,
    string memory _jobId,
    uint256 _fee
  ) public onlyOwner {
    setChainlinkToken(_link);
    oracle = _oracle;
    jobId = stringToBytes32(_jobId);
    fee = _fee;
  }

  function verify(uint256 tokenId) public {
    address sender = address(this);

    // Uncomment below if you want to enforce 1 pending request per account
    //require(!requestPending[sender], "Sender already has a pending request");

    Chainlink.Request memory request = buildChainlinkRequest(
      jobId,
      sender,
      this.fulfill.selector
    );
    request.add("tokenId", tokenId.toString());

    bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
    requests[requestId] = Request(sender, tokenId);
    requestPending[sender] = true;
  }

  function fulfill(bytes32 requestId, bytes32 owner) public {
    Request storage request = requests[requestId];

    // TODO: Add validator before minting the token. Only the sender should be able to mint!
    owners[request.tokenId] = address(uint160(uint256(owner)));
    fulfills += 1;

    delete requestPending[request.sender];
  }

  function ownerOf(uint256 tokenId) public view returns (address) {
    return owners[tokenId];
  }

  function stringToBytes32(string memory source) private pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly { // solhint-disable-line no-inline-assembly
      result := mload(add(source, 32))
    }
  }
}
