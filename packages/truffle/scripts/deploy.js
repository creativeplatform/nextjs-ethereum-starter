const { web3tx } = require("@decentral.ee/web3-helpers");
const { setWeb3Provider } = require("@decentral.ee/web3-helpers/src/config");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const Creative= artifacts.require("Creative");

module.exports = async function(callback) {
    try {
        const version = process.env.RELEASE_VERSION || "test";
        console.log("release version:", version);

        // make sure that we are using the same web3 provider in the helpers
        setWeb3Provider(web3.currentProvider);

        const sf = new SuperfluidSDK.Framework({
            web3,
            version: version,
            // renamed from fDAI
            tokens: ["MIT"]
        });
        await sf.initialize();

        const token = await web3tx(
            Creative.new,
            "Deploy Creative"
        )(
            "Creative",
            "CRT",
            // renamed from fDAIx
            sf.tokens.MITx.address,
            sf.host.address,
            sf.agreements.ida.address
        );
        console.log("Token deployed at", token.address);
        callback();
    } catch (err) {
        callback(err);
    }
};
