import { ethers } from "hardhat";

async function main() {
  const testerc20 = await ethers.getContractFactory("BLCToken");

  const testerc20dep = await testerc20.deploy();

  console.log("testerc20dep deployed to:", testerc20dep.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// polygon network blc contract: 0xF576eAE985F9fc2DC171e25b8Ede6653632DA013
