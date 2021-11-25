// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Custodian is ChainlinkClient, Ownable {
  using Chainlink for Chainlink.Request;
  using Strings for uint256;

  address private oracle;
  bytes32 private jobId;
  uint256 private fee;

  struct Request {
    address sender;
    uint256 tokenId;
  }

  mapping(bytes32 => Request) public requests;
  mapping(uint256 => address) public owners;

  mapping(address => bool) public requestPending;

  constructor() {
    setPublicChainlinkToken();
  }

  function setJobConfig(
    address _oracle,
    bytes32 _jobId,
    uint256 _fee
  ) public onlyOwner {
    oracle = _oracle;
    jobId = _jobId;
    fee = _fee;
  }

  function verify(uint256 tokenId) public {
    address sender = address(this);

    require(!requestPending[sender], "Sender already has a pending request");

    Chainlink.Request memory request = buildChainlinkRequest(
      jobId,
      sender,
      this.fulfill.selector
    );
    request.add("tokenId", tokenId.toString());
    request.addBytes("address", abi.encodePacked(sender));

    bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
    requests[requestId] = Request(sender, tokenId);
    requestPending[sender] = true;
  }

  function fulfill(bytes32 requestId, bool doesOwn) external {
    Request storage request = requests[requestId];

    if (doesOwn) {
      owners[request.tokenId] = request.sender;
    }

    delete requestPending[request.sender];
  }

  function ownerOf(uint256 tokenId) public view returns (bool) {
    return owners[tokenId] == address(this);
  }
}
