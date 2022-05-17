// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {
    ISuperfluid,
    ISuperToken,
    SuperAppBase,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";
import {
    IInstantDistributionAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

import {
    IDAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/IDAv1Library.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

struct InitData {
    ISuperfluid host;
    IInstantDistributionAgreementV1
}

contract Creative is Ownable, ERC20, SuperAppBase, KeeperCompatibleInterface {
     // use the IDAv1Library for the InitData struct
    using IDAv1Library for IDAv1Library.InitData;
     // declare `_idaLib` of type InitData
    IDAv1Library.InitData internal _idaLib;

    constructor(
        ISuperfluid host,
        IInstantDistributionAgreementV1 ida
    ) {
        // assign it the host and ida addresses
        _idav1Lib = IDAv1Library.InitData(host, ida);
    }

    function createToken(ISuperfluidToken token, uint32 indexId) {
    _idav1Lib.createIndex(token, indexId);
}

    function afterAgreementCreated(
    ISuperToken superToken,
    address /*agreementClass*/,
    bytes32 /*agreementId*/,
    bytes calldata /*agreementData*/,
    bytes calldata /*cbdata*/,
    bytes calldata ctx
} external override returns (bytes memory newCtx) {

    require(msg.sender == address(_idav1Lib.host), "only host");
    uint32 indexId = 0;
    return _idav1Lib.createIndexWithCtx(ctx, superToken, indexId);

}

}
