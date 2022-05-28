// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {
    ISuperfluid,
    ISuperToken
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";
import {
    IInstantDistributionAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Creative is Ownable, ERC20 {

    // Address for the uma oracle contract
    address umaOracle = 0xB1d3A89333BBC3F5e98A991d6d4C1910802986BC;

    uint32 public constant INDEX_ID = 0;
    uint8 private _decimals;

    ISuperToken private _cashToken;
    ISuperToken private _daiToken;
    ISuperfluid private _host;
    IInstantDistributionAgreementV1 private _ida;

    // use callbacks to track approved subscriptions
    mapping(address => bool) public isSubscribing;

    constructor(
        string memory name,
        string memory symbol,
        ISuperToken cashToken,
        ISuperToken daiToken,
        ISuperfluid host,
        IInstantDistributionAgreementV1 ida
    )

    ERC20(name, symbol) {
        _cashToken = cashToken;
        _daiToken = daiToken;
        _host = host;
        _ida = ida;

        _host.callAgreement(
            _ida,
            abi.encodeWithSelector(
                _ida.createIndex.selector,
                _cashToken,
                INDEX_ID,
                new bytes(0) // placeholder ctx
            ),
            new bytes(0)
        );

        transferOwnership(msg.sender);
        _decimals = 0;
    }

    // Issue new shares to beneficiary
    function issue(address beneficiary, uint256 amount) external {
        // then adjust beneficiary subscription units
        uint256 currentAmount = balanceOf(beneficiary);

        // first try to do ERC20 mint
        ERC20._mint(beneficiary, amount);

        _host.callAgreement(
            _ida,
            abi.encodeWithSelector(
                _ida.updateSubscription.selector,
                _cashToken,
                INDEX_ID,
                beneficiary,
                uint128(currentAmount) + uint128(amount),
                new bytes(0) // placeholder ctx
            ),
            new bytes(0) // user data
        );
    }

    /// @dev Distribute `amount` of cash among all token holders
    function distribute(uint256 cashAmount) external {
        /* // here we want to send a request to the oracle
        bytes32 thing = "true";

        (bool success, bytes memory data) =  umaOracle.call(abi.encodeWithSignature("requestPrice(bytes32,uint256)", thing, block.timestamp));

        // if not successful, bail
        if (!success) {
        }
            // decode the data
            // uint256 price = abi.decode(data, uint256); */

        (uint256 actualCashAmount, ) = _ida.calculateDistribution(
            _cashToken,
            address(this),
            INDEX_ID,
            cashAmount
        );

        _cashToken.transferFrom(owner(), address(this), actualCashAmount);

        _host.callAgreement(
            _ida,
            abi.encodeWithSelector(
                _ida.distribute.selector,
                _cashToken,
                INDEX_ID,
                actualCashAmount,
                new bytes(0) // placeholder ctx
            ),
            new bytes(0) // user data
        );
    }


        /// @dev Distribute `amount` of cash among all token holders
    function distributeDAI(uint256 cashAmount) external {
        (uint256 actualCashAmount, ) = _ida.calculateDistribution(
            _daiToken,
            address(this),
            INDEX_ID,
            cashAmount
        );

        _daiToken.transferFrom(owner(), address(this), actualCashAmount);

        _host.callAgreement(
            _ida,
            abi.encodeWithSelector(
                _ida.distribute.selector,
                _daiToken,
                INDEX_ID,
                actualCashAmount,
                new bytes(0) // placeholder ctx
            ),
            new bytes(0) // user data
        );
    }

    /// @dev ERC20._transfer override
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        uint128 senderUnits = uint128(ERC20.balanceOf(sender));
        uint128 recipientUnits = uint128(ERC20.balanceOf(recipient));
        // first try to do ERC20 transfer
        ERC20._transfer(sender, recipient, amount);

        _host.callAgreement(
            _ida,
            abi.encodeWithSelector(
                _ida.updateSubscription.selector,
                _cashToken,
                INDEX_ID,
                sender,
                senderUnits - uint128(amount),
                new bytes(0) // placeholder ctx
            ),
            new bytes(0) // user data
        );

        _host.callAgreement(
            _ida,
            abi.encodeWithSelector(
                _ida.updateSubscription.selector,
                _cashToken,
                INDEX_ID,
                recipient,
                recipientUnits + uint128(amount),
                new bytes(0) // placeholder ctx
            ),
            new bytes(0) // user data
        );
    }
}
