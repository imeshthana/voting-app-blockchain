import "./App.css";
import { ethers } from "ethers";
import Login from "./components/Login";
import { useEffect, useState } from "react";
import Voting from "./abis/Voting.json";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [remainingTime, setRemainingTime] = useState("");
  const [canVote, setCanVote] = useState(false);
  const [votingStatus, setVotingStatus] = useState(false);
  const [votingContract, setVotingContract] = useState(null);

  const handleAccountConnect = async () => {
    const currentProvider = provider || (await initializeProvider());
    const signer = await currentProvider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);

    const voting = new ethers.Contract(
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      Voting,
      signer
    );
    setVotingContract(voting);

    await loadBlockchainData(voting, address);
  };

  const accountsChanged = async () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          const account = ethers.getAddress(accounts[0]);
          setAccount(account);
          if (votingContract) {
            await loadBlockchainData(votingContract, account);
          }
        } else {
          setAccount(null);
          setCandidates([]);
          setRemainingTime("");
          setCanVote(false);
          setVotingStatus(false);
        }
      });
    }
  };

  const loadBlockchainData = async (voting, address) => {
    const candidatesList = await voting.getAllVotesOfCandidates();
    const formattedCandidates = await candidatesList.map((candidate, index) => {
      return {
        index: index,
        name: candidate.name,
        voteCount: Number(candidate.voteCount),
      };
    });
    setCandidates(formattedCandidates);
    console.log(candidates);

    const time = await voting.getRemainingTime();
    setRemainingTime(Number(time));
    console.log(time);

    const status = await voting.getVotingStatus();
    setVotingStatus(status);
    console.log(votingStatus);

    const canvote = await voting.voters(address);
    setCanVote(canvote);
    console.log(canvote);
  };

  const initializeProvider = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      return provider;
    }
    return null;
  };

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
      {account ? <></> : <Login connectAccount={handleAccountConnect} />}
    </div>
  );
}

export default App;

// import "./App.css";
// import { ethers } from "ethers";
// import Login from "./components/Login";
// import { useEffect, useState } from "react";
// import Voting from "./abis/Voting.json";

// function App() {
//   const [provider, setProvider] = useState(null);
//   const [account, setAccount] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [candidates, setCandidates] = useState([]);
//   const [remainingTime, setRemainingTime] = useState("");
//   const [canVote, setCanVote] = useState(false);
//   const [votingStatus, setVotingStatus] = useState(false);

//   const initializeProvider = async () => {
//     if (window.ethereum) {
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       setProvider(provider);
//       return provider;
//     }
//     return null;
//   };

//   const handleAccountConnect = async () => {
//     try {
//       const currentProvider = provider || (await initializeProvider());
//       if (!currentProvider) {
//         console.error("No provider available");
//         return;
//       }

//       const signer = await currentProvider.getSigner();
//       const address = await signer.getAddress();
//       setAccount(address);

//       const votingContract = new ethers.Contract(
//         "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
//         Voting,
//         signer
//       );
//       setContract(votingContract);

//       await loadBlockchainData(votingContract, address);
//     } catch (error) {
//       console.error("Error connecting account:", error);
//     }
//   };

//   const loadBlockchainData = async (votingContract, currentAccount) => {
//     try {
//       const candidatesList = await votingContract.getAllVotesOfCandidates();
//       const formattedCandidates = candidatesList.map((candidate, index) => ({
//         index: index,
//         name: candidate.name,
//         voteCount: Number(candidate.voteCount),
//       }));
//       setCandidates(formattedCandidates);

//       const time = await votingContract.getRemainingTime();
//       setRemainingTime(Number(time));

//       const status = await votingContract.getVotingStatus();
//       setVotingStatus(status);

//       const canvote = await votingContract.voters(currentAccount);
//       setCanVote(canvote);
//     } catch (error) {
//       console.error("Error loading blockchain data:", error);
//     }
//   };

//   const accountsChanged = async () => {
//     if (window.ethereum) {
//       window.ethereum.on("accountsChanged", async (accounts) => {
//         if (accounts.length > 0) {
//           const account = ethers.getAddress(accounts[0]);
//           setAccount(account);
//           if (contract) {
//             await loadBlockchainData(contract, account);
//           }
//         } else {
//           setAccount(null);
//           setCandidates([]);
//           setRemainingTime("");
//           setCanVote(false);
//           setVotingStatus(false);
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     initializeProvider();
//     accountsChanged();

//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeListener("accountsChanged", accountsChanged);
//       }
//     };
//   }, []);

//   return (
//     <div className="App">
//       {!account ? <Login connectAccount={handleAccountConnect} /> : <></>}
//     </div>
//   );
// }

// export default App;
