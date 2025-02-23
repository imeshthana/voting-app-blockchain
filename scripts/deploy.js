const hre = require("hardhat");

async function main() {
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(["Mark", "Mike", "Henry", "Rock"], 90);
  await voting.waitForDeployment();
  console.log("Contract Address", await voting.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
