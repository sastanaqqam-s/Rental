// deploy contract
// approve erc20token
// deploy nft's
//call rentNFT

import { ethers } from "hardhat";

async function main() {
  const RentNFT = await ethers.getContractFactory("RentNFT");
  let erc20feetoken = "0x66c921CFC16A62048b7DdA709F2CE31Da42f9378";

  // blc contract for polygon network
  // let erc20feetoken = "0xF576eAE985F9fc2DC171e25b8Ede6653632DA013";

  console.log("erc20feetoken", erc20feetoken);

  // rinkeby
  // const rentnft = await RentNFT.deploy("0x92b503A91766f6D2b05cc6e38c6005945557d327");

  // goerili
  const rentnft = await RentNFT.deploy(erc20feetoken); // ERC20 token address for fee

  // Removed add Package role user owner can do this work
  // await rentnft._addPackageRoleUser(
  //   "0xa13cBc0919Bb0ED2DBCB710a97dE179881069c8f"
  // );

  await rentnft.deployed();

  console.log("rentnft deployed to:", rentnft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
