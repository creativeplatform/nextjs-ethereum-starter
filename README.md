# Dividend Rights Token - a superfluid superapp demo

Creative is a gamified blockchain platform that connects independent artists, brands, and fans to create new opportunities for collaboration.

Brands get access to exclusive content and unique fan experiences while they can collaborate with creators in the process—allowing them to engage directly with their consumers on an intimate level. Creative also offers reward-based incentives through P2E DeFi (decentralized financial incentive) tokens which are used by collaborators as currency for rewards or compensation.

## Getting Started

This project uses Yarn Workspaces, so you'll need [Yarn](https://classic.yarnpkg.com/en/docs/install)

```bash
git clone https://github.com/ChangoMan/nextjs-ethereum-starter.git
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
