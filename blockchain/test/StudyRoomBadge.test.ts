import { expect } from "chai";
import { ethers } from "hardhat";
import { StudyRoomBadge } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StudyRoomBadge", function () {
  let badge: StudyRoomBadge;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const metadataURI = "ipfs://QmTest123/metadata.json";

  beforeEach(async function () {
    [owner, user1, user2, unauthorized] = await ethers.getSigners();

    const StudyRoomBadge = await ethers.getContractFactory("StudyRoomBadge");
    badge = await StudyRoomBadge.deploy();
    await badge.waitForDeployment();
  });

  describe("部署", function () {
    it("应正确设置名称和符号", async function () {
      expect(await badge.name()).to.equal("Study Room Badge");
      expect(await badge.symbol()).to.equal("SRB");
    });

    it("合约拥有者应为部署者", async function () {
      expect(await badge.owner()).to.equal(owner.address);
    });

    it("初始总铸造数应为 0", async function () {
      expect(await badge.totalMinted()).to.equal(0);
    });

    it("初始 nextTokenId 应为 1", async function () {
      expect(await badge.totalSupply()).to.equal(0);
    });
  });

  describe("铸造", function () {
    it("owner 应能成功铸造 NFT", async function () {
      const tx = await badge.safeMint(user1.address, metadataURI);
      const receipt = await tx.wait();

      // 检查余额
      expect(await badge.balanceOf(user1.address)).to.equal(1);
      expect(await badge.ownerOf(1)).to.equal(user1.address);
      expect(await badge.totalSupply()).to.equal(1);
      expect(await badge.totalMinted()).to.equal(1);

      // 检查 TokenURI
      expect(await badge.tokenURI(1)).to.equal(metadataURI);
    });

    it("同一地址不能铸造两次", async function () {
      await badge.safeMint(user1.address, metadataURI);
      await expect(
        badge.safeMint(user1.address, metadataURI)
      ).to.be.revertedWith("StudyRoomBadge: address already minted");
    });

    it("不能铸造到零地址", async function () {
      await expect(
        badge.safeMint(ethers.ZeroAddress, metadataURI)
      ).to.be.revertedWith("StudyRoomBadge: cannot mint to zero address");
    });

    it("非 owner 不能铸造", async function () {
      await expect(
        badge.connect(unauthorized).safeMint(user2.address, metadataURI)
      ).to.be.revertedWithCustomError(badge, "OwnableUnauthorizedAccount");
    });

    it("多次铸造应递增 Token ID", async function () {
      await badge.safeMint(user1.address, "uri1");
      await badge.safeMint(user2.address, "uri2");
      await badge.safeMint(owner.address, "uri3");

      expect(await badge.ownerOf(1)).to.equal(user1.address);
      expect(await badge.ownerOf(2)).to.equal(user2.address);
      expect(await badge.ownerOf(3)).to.equal(owner.address);
      expect(await badge.totalSupply()).to.equal(3);
      expect(await badge.totalMinted()).to.equal(3);
    });
  });

  describe("查询", function () {
    it("hasMinted 应正确返回", async function () {
      expect(await badge.hasMinted(user1.address)).to.equal(false);
      await badge.safeMint(user1.address, metadataURI);
      expect(await badge.hasMinted(user1.address)).to.equal(true);
    });

    it("hasMintedBatch 应批量查询正确", async function () {
      await badge.safeMint(user1.address, metadataURI);

      const results = await badge.hasMintedBatch([user1.address, user2.address, owner.address]);
      expect(results[0]).to.equal(true);
      expect(results[1]).to.equal(false);
      expect(results[2]).to.equal(false);
    });

    it("查询不存在的 Token URI 应回退", async function () {
      await expect(
        badge.tokenURI(999)
      ).to.be.revertedWith("StudyRoomBadge: URI query for nonexistent token");
    });
  });

  describe("ERC-721 枚举", function () {
    it("tokenByIndex 应按序返回 Token ID", async function () {
      await badge.safeMint(user1.address, "uri1");
      await badge.safeMint(user2.address, "uri2");
      expect(await badge.tokenByIndex(0)).to.equal(1);
      expect(await badge.tokenByIndex(1)).to.equal(2);
    });

    it("tokenOfOwnerByIndex 应返回用户持有的 Token", async function () {
      await badge.safeMint(user1.address, "uri1");
      expect(await badge.tokenOfOwnerByIndex(user1.address, 0)).to.equal(1);
    });
  });
});
