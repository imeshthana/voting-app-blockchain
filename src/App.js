import "./App.css";
import { ethers } from "ethers";
import Login from "./components/Login";
import { useEffect, useState } from "react";
import Voting from "./abis/Voting.json";
import Vote from "./components/Vote";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [remainingTime, setRemainingTime] = useState("");
  const [canVote, setCanVote] = useState(false);
  const [votingStatus, setVotingStatus] = useState(false);
  const [index, setIndex] = useState(0);

  const initializeProvider = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      return provider;
    }
    return null;
  };

  const handleAccountConnect = async () => {
    try {
      const currentProvider = provider || (await initializeProvider());
      if (!currentProvider) {
        console.error("No provider available");
        return;
      }

      const signer = await currentProvider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const votingContract = new ethers.Contract(
        "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        Voting,
        signer
      );
      setContract(votingContract);

      await loadBlockchainData(votingContract, address);
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const loadBlockchainData = async (votingContract, currentAccount) => {
    try {
      const candidatesList = await votingContract.getAllVotesOfCandidates();
      const formattedCandidates = candidatesList.map((candidate, index) => ({
        index: index,
        name: candidate.name,
        voteCount: Number(candidate.voteCount),
      }));
      setCandidates(formattedCandidates);

      const time = await votingContract.getRemainingTime();
      setRemainingTime(Number(time));

      const status = await votingContract.getVotingStatus();
      setVotingStatus(status);

      const canvote = await votingContract.voters(currentAccount);
      setCanVote(canvote);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };

  const accountsChanged = async () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        setAccount(null);
      });
    }
  };

  const vote = async () => {
    const vote = await contract.vote(index);
    await vote.wait();
    setCanVote(false);
    await loadBlockchainData(contract, account);
  };

  async function handleIndexChange(e) {
    setIndex(e.target.value);
  }

  useEffect(() => {
    initializeProvider();
    accountsChanged();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", accountsChanged);
      }
    };
  }, []);

  return (
    <div className="App">
      {!account ? (
        <Login connectAccount={handleAccountConnect} />
      ) : (
        <Vote
          account={account}
          candidates={candidates}
          remainingTime={remainingTime}
          showButton={canVote}
          handleIndexChange={handleIndexChange}
          voteFunction={vote}
        />
      )}
    </div>
  );
}

export default App;
