// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FakeNFT is ERC721Enumerable, Ownable {
  using Strings for uint256;

  uint256 public MAX_TOKENS;

  string public ipfsBaseUri;

  constructor(
    string memory _name,
    string memory _symbol,
    uint256 _maxTokens
  ) ERC721(_name, _symbol) {
    MAX_TOKENS = _maxTokens;
  }

  function setUri(string calldata _ipfsBaseUri) external onlyOwner {
    ipfsBaseUri = _ipfsBaseUri;
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override
    returns (string memory)
  {
    require(
      _exists(tokenId),
      "ERC721Metadata: URI query for nonexistent token"
    );

    string memory sequenceId = tokenId.toString();
    return string(abi.encodePacked(ipfsBaseUri, sequenceId, ".json"));
  }

  function mint() external {
    require(balanceOf(msg.sender) < 1, "Player can only mint one token total");
    require(
      totalSupply() + 1 <= MAX_TOKENS,
      "There are not enough tokens left to mint"
    );
    _safeMint(msg.sender, totalSupply());
  }
}
