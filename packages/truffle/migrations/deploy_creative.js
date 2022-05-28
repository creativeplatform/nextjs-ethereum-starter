const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const Creative= artifacts.require("Creative");

module.exports = async function(deployer) {

    sf = new SuperfluidSDK.Framework({
        web3,
        version: "v1",
        tokens: ["fDAI"]
    });

    await sf.initialize();

    const superCreativeToken = "0xB806966A6078ac78c789665c177DFDacfd544E71";
    const SuperFakeDAIToken = "0xe3cb950cb164a31c66e32c320a800d477019dcff";
    const HostAddress = "0x69252f265DB334d22b7ad57117b237351B7199C1";
    const IDAAddress = "0x556ba0b3296027Dd7BCEb603aE53dEc3Ac283d2b";

    await deployer.deploy(Creative, "CreativeToken", "CRT", superCreativeToken, SuperFakeDAIToken, HostAddress, IDAAddress);

};

/*
string memory name,
string memory symbol,
ISuperToken cashToken,
ISuperfluid host,
IInstantDistributionAgencodeWithSignatureeementV1 ida)
ERC20(name, symbol)
*/
