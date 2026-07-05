import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 开始部署 StudyRoomBadge 合约...\n");

  // 获取合约工厂
  const StudyRoomBadge = await ethers.getContractFactory("StudyRoomBadge");

  // 部署合约
  const contract = await StudyRoomBadge.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployerAddress = (await ethers.getSigners())[0].address;
  const network = await ethers.provider.getNetwork();

  console.log(`✅ 合约部署成功！`);
  console.log(`   合约地址: ${contractAddress}`);
  console.log(`   部署者:    ${deployerAddress}`);
  console.log(`   网络:      ${network.name}\n`);

  // ======================
  // 保存合约信息供后端使用
  // ======================
  const artifact = await ethers.getContractFactory("StudyRoomBadge");
  const buildInfo = {
    contractAddress,
    deployerAddress,
    network: network.name,
    chainId: Number(network.chainId),
    abi: artifact.interface.formatJson(),
    deployedAt: new Date().toISOString(),
  };

  // 保存到 backend 目录
  const outputDir = path.join(__dirname, "..", "..", "backend", "src", "nft", "contracts");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "StudyRoomBadge.json"), JSON.stringify(buildInfo, null, 2));

  console.log(`📝 合约 ABI 已保存到: ${path.join(outputDir, "StudyRoomBadge.json")}`);
  console.log("\n🎉 部署完成！");
}

main().catch((error) => {
  console.error("❌ 部署失败:", error);
  process.exitCode = 1;
});
