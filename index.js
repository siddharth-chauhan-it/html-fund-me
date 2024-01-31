import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress, ownerAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum != "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      connectButton.innerHTML = "Connected";
    }
  } else {
    alert("No Metamask detected!");
  }
}

async function getBalance() {
  // Checking if metamask is installed
  if (typeof window.ethereum == "undefined") {
    alert("No Metamask detected!");
    return;
  }

  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Metamask Wallet
    const balance = await provider.getBalance(contractAddress); // Balance of contract
    const formattedBalance = ethers.utils.formatEther(balance);
    console.log(`Balance: ${formattedBalance}`);
    alert(`Balance: ${formattedBalance}`);
  }
}

async function fund() {
  // Checking if metamask is installed
  if (typeof window.ethereum == "undefined") {
    alert("No Metamask detected!");
    return;
  }

  // Checking if the user is connected to Metamask!
  const accounts = await ethereum.request({ method: "eth_accounts" });
  if (accounts.length < 1) {
    console.log("Please Connect");
    alert("Please Connect");
    return;
  }

  const ethAmount = document.getElementById("ethAmount").value;

  // Checking if the ethAmount is blank
  if (!ethAmount) {
    alert("Please enter the funding amount");
    console.log("Please enter the funding amount");
    return;
  }

  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum != "undefined") {
    // provider / connection to the blockchain
    // signer / wallet / someone with some gas
    // contract abi
    // contract address
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Metamask Wallet
    const signer = provider.getSigner(); // Connected account from Metamask Wallet
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
      alert(error.error.message);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);

  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
        alert(`Completed with ${transactionReceipt.confirmations} confirmations`);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function withdraw() {
  // Checking if metamask is installed
  if (typeof window.ethereum == "undefined") {
    alert("No Metamask detected!");
    return;
  }

  console.log("Withdrawing...");
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Metamask Wallet
    const signer = provider.getSigner(); // Connected account from Metamask Wallet
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Checking if the user is connected to Metamask!
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length < 1) {
      console.log("Please Connect");
      alert("Please Connect");
      return;
    }

    // Checking if the user is the owner!
    const signerAddress = await signer.getAddress();
    if (signerAddress !== ownerAddress) {
      console.log(`signerAddress: ${signerAddress}`);
      console.log(`ownerAddress: ${ownerAddress}`);
      console.log("Only the owner of this contract can withdraw funds");
      alert("Only the owner of this contract can withdraw funds");
      return;
    }

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
