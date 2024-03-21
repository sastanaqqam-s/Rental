
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

async function main() {

  let day = 24 * 60 * 60;
  let itemID = BigNumber.from(1)
  let startAt = BigNumber.from(Math.floor(new Date().getTime() / 1000) + 1 * day)
  let endAt = BigNumber.from(Math.floor(new Date().getTime() / 1000) + 5 * day)



  const RentNFT = await ethers.getContractFactory("RentNFT");
  const testerc20 = await ethers.getContractFactory("BLCToken");
  const rentnft = await RentNFT.deploy("0x92b503A91766f6D2b05cc6e38c6005945557d327");


  // await rentnft.deployed();

  // const rentnft = await RentNFT.attach("0xb58848752f671a6a8139c2fe596644dd85dcf93a");


  console.log("rentnft deployed to:", rentnft.address);





  const blctoken = testerc20.attach("0x92b503A91766f6D2b05cc6e38c6005945557d327")

  const approvetoken = await blctoken.approve(rentnft.address, BigNumber.from("10000000000000000000000000000"))

  console.log("Approve token", approvetoken)

  var nftaddresses: string[] = [];

  const testNFTs = await ethers.getContractFactory("MyNFT");


  // generate test nft's
  const testnft = await testNFTs.deploy();
 
  nftaddresses.push(testnft.address)
  for (let i = 0; i < 5; i++) {
    console.log("deploy token", i)

    const testnft = await testNFTs.deploy();
    await testnft.deployed();
    nftaddresses.push(testnft.address)
    console.log("testNFT deployed to:", testnft.address);
  }
  const [owner, addr1, addr2] = await ethers.getSigners();

  console.log("nftaddresses", nftaddresses)

  console.log("owner", owner.address)


  let testnftnotk = testNFTs.attach(nftaddresses[0])

  console.log("mint nft for owner", owner.address)

  await testnftnotk.mintNFT(owner.address,"owner.address")

  console.log("setapprovale", owner.address)


  await testnftnotk.setApprovalForAll(rentnft.address, true)





  await delay(10000);

      let listnftforrent = await rentnft.listNFTForRent(itemID, "0x9fca32153f886366c6614a6f52cf79be1c6dd5ac", BigNumber.from(Math.floor(new Date().getTime() / 1000) + 100 * day), BigNumber.from(1 * day), BigNumber.from(10 * day), BigNumber.from("1"), "1:1", "2048:2048", "adw1dqa231",[BigNumber.from("0")])
console.log("listnftforrent",listnftforrent)

  for (let index = 0; index < nftaddresses.length; index++) {
    const nftaddress = nftaddresses[index];
    let testnftnotk = testNFTs.attach(nftaddress)
    await testnftnotk.setApprovalForAll(rentnft.address, true)
    console.log("approved erc721:", nftaddress);
  }

 

  console.log("nftaddresses", nftaddresses)



  for (let index = 0; index < nftaddresses.length; index++) {
    const nftaddress = nftaddresses[index];

    let listnftforrent = rentnft.listNFTForRent(itemID, nftaddress, BigNumber.from(Math.floor(new Date().getTime() / 1000) + 100 * day), BigNumber.from(1 * day), BigNumber.from(10 * day), BigNumber.from("1"), "1:1", "2048:2048", "adw1dqa231",[BigNumber.from("0")])

    console.log("listnftforrent:", (await listnftforrent).hash);
    await delay(5000);

  }

  // let startat = BigNumber.from(Math.floor(new Date().getTime() / 1000) + 1 * day);
  // let endat = BigNumber.from(Math.floor(new Date().getTime() / 1000) + 8 * day);
  // console.log("startat",startAt)
  // console.log("endat",endat)

  // let rentNFTtx = rentnft.rentNFT(BigNumber.from("19"), startat, endat);


 

  // console.log("rentNFTtx:", (await rentNFTtx).hash);


  for (let index = 0; index < nftaddresses.length; index++) {
    const nftaddress = nftaddresses[index];

    let rentNFTtx = rentnft.rentNFT(BigNumber.from("1"), BigNumber.from(Math.floor(new Date().getTime() / 1000)+ 1 * day), BigNumber.from(Math.floor(new Date().getTime() / 1000)+ 8 * day),BigNumber.from("0"))

    console.log("rentNFTtx:", (await rentNFTtx).hash);

  }




}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
