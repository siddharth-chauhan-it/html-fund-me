import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

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
    connectButton.innerHTML = "Connected";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    alert("No Metamask detected!");
    connectButton.innerHTML = "Install Metamask";
  }
}

async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Metamask Wallet
    const balance = await provider.getBalance(contractAddress); // Balance of contract
    console.log(ethers.utils.formatEther(balance));
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
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
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);

  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function withdraw() {
  console.log("Withdrawing...");
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Metamask Wallet
    const signer = provider.getSigner(); // Connected account from Metamask Wallet
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
