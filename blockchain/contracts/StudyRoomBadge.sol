// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StudyRoomBadge
 * @notice 自习室预约系统的 NFT 徽章合约
 * @dev 当用户在自习室第一次完成预约时，系统自动铸造一枚独一无二的 NFT 徽章
 */
contract StudyRoomBadge is ERC721Enumerable, Ownable {
    /// @dev 下一个可用的 Token ID（从 1 开始）
    uint256 private _nextTokenId;

    /// @dev tokenId → tokenURI 映射
    mapping(uint256 => string) private _tokenURIs;

    /// @dev 记录某个地址是否已铸造过（每人仅限一枚）
    mapping(address => bool) private _hasMinted;

    /// @dev 总铸造数量
    uint256 private _totalMinted;

    /// @dev 铸造事件
    event BadgeMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("Study Room Badge", "SRB") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @notice 铸造 NFT 徽章
     * @param to 接收者地址
     * @param uri Token 元数据 URI（指向 IPFS）
     * @return tokenId 铸造的 Token ID
     * @dev 仅合约拥有者（后端服务）可调用
     *      每个地址只能铸造一次
     */
    function safeMint(address to, string memory uri) public onlyOwner returns (uint256) {
        require(to != address(0), "StudyRoomBadge: cannot mint to zero address");
        require(!_hasMinted[to], "StudyRoomBadge: address already minted");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _hasMinted[to] = true;
        _totalMinted++;

        emit BadgeMinted(to, tokenId, uri);

        return tokenId;
    }

    /**
     * @notice 批量查询某些地址是否已铸造
     * @param addresses 要查询的地址列表
     * @return bool[] 每个地址是否已铸造
     */
    function hasMintedBatch(address[] calldata addresses) external view returns (bool[] memory) {
        bool[] memory results = new bool[](addresses.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            results[i] = _hasMinted[addresses[i]];
        }
        return results;
    }

    /**
     * @notice 查询某个地址是否已铸造
     */
    function hasMinted(address account) external view returns (bool) {
        return _hasMinted[account];
    }

    /**
     * @notice 获取总铸造数量
     */
    function totalMinted() external view returns (uint256) {
        return _totalMinted;
    }

    /**
     * @notice 获取 Token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "StudyRoomBadge: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    /**
     * @notice 内部设置 Token URI
     */
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }
}
