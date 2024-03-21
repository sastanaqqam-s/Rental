
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Wrapped, Wrapped__factory } from "../typechain";


async function tokenuri() {
//   const wrapped = await ethers.getContractFactory("wrapped");
const [deployer, user1, user2, user3, user4, user5] = await ethers.getSigners();

  const nft = await Wrapped__factory.connect("0x50118478dff5c54019b4d7d7ecc80fd8b88b8425",deployer)

  let startat = await nft.startAt()

  console.log("startat:", startat);

  let endat = await nft.expireAt()

  console.log("endat:", endat);



 let uri = await nft.tokenURI(BigNumber.from(1))

  console.log("uri:", uri);
}

tokenuri().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
