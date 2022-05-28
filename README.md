# Creative - a superfluid superapp demo
![image](https://user-images.githubusercontent.com/33012322/169733585-58a65d40-7f08-4065-89b7-fb1988b546e8.png)


Creative is a gamified blockchain platform that connects independent artists, brands, and fans to create new opportunities for collaboration.

Brands get access to exclusive content and unique fan experiences while they can collaborate with creators in the process—allowing them to engage directly with their consumers on an intimate level. Creative also offers reward-based incentives through P2E DeFi (decentralized financial incentive) tokens which are used by collaborators as currency for rewards or compensation.

## How it's made

This project uses mainly Superfluid to distribute streaming royalties to creators from commercial streaming platforms (Creative, Apple Music, etc.). This uses their Instant Distribution Agreement (IDA). We also used EPNS to add notifications to the creators when there is a royalty withdraw period. We added Transak to allow creators to top up their wallets if they need gas or something. We used an API to get data from the streaming platforms for this experiment.

## Technology

- [Superfluid](https://www.superfluid.finance/)
- [Polygon](https://polygon.technology/)
- [Filecoin](https://filecoin.io/)
- [IPFS](https://ipfs.io/)
- [Scaffold-Eth](https://docs.scaffoldeth.io/scaffold-eth/)
- [transak](https://transak.com/)
- [epns](https://epns.io/)

## Stack
- [Typescript](https://www.typescriptlang.org/)
- [Hardhat](https://hardhat.org/)
- [TypeChain](https://github.com/ethereum-ts/TypeChain)
- [Ethers.js](https://docs.ethers.io/v5/)
- [useDApp](https://usedapp.io/)
- [Chakra UI](https://chakra-ui.com/)
- Linting with [ESLint](https://eslint.org/)
- Formatting with [Prettier](https://prettier.io/)
- Linting, typechecking and formatting on by default using [`husky`](https://github.com/typicode/husky) for commit hooks
- Testing with [Jest](https://jestjs.io/) and [`react-testing-library`](https://testing-library.com/docs/react-testing-library/intro)
- [Eth-Hooks](https://scaffold-eth.github.io/eth-hooks/)

## Getting Started

This project uses Yarn Workspaces, so you'll need [Yarn](https://classic.yarnpkg.com/en/docs/install)

```bash
https://github.com/creativeplatform/nextjs-ethereum-starter
cd nextjs-ethereum-starter

yarn install

# Start up the Hardhat Network
yarn chain
```

Here we just install the npm project's dependencies, and by running `yarn chain` we spin up an instance of Hardhat Network that you can connect to using MetaMask. In a different terminal in the same directory, run:

```bash
yarn deploy
```

This will deploy the contract to Hardhat Network. After this completes run:

```bash
yarn dev
```

This will start up the Next.js development server and your site will be available at http://localhost:3000/

To interact with the local contract, be sure to switch your MetaMask Network to `Localhost 8545`
