var CreativeToken = artifacts.require("CreativeToken");

module.exports = function(deployer) {
    deployer.deploy(CreativeToken);
};
