const Creative= artifacts.require("Creative");
const CreativeToken = artifacts.require("CreativeToken");
var fs = require('fs');


module.exports = async function (deployer) {
    // first addr 0x1E9b2AAf45F753995001d22524313C3b1d80819f
    // second addr 0xD1391CC98414e65802D4593d45913B73Db71f262
    // third addr 0xFdF7d86d437cDa40a6b06e4AE3E8Db703A5dcd41
    var brainContractAddress = "0x4E4C66A261ae312083A2BB56f56634bB98c83F44";
    // console.log(Creative.abi)
    var BrainContract = new web3.eth.Contract(Creative.abi, brainContractAddress);
    console.log(Creative.abi)
    var myAddress = "0xC3086402039e344140f711dC7AFa259ca362f0bb";
    var samsAddress = "0xD245Fbe9F1F7cf8944528bA1CeD277272f0da061";

    // var supertokenaddress = "0xB806966A6078ac78c789665c177DFDacfd544E71";
    // var supertokencontract = new web3.eth.Contract(CreativeToken.abi, supertokenaddress);

    var daiAddr = "0xe3CB950Cb164a31C66e32c320A800D477019DCFF"
    var supertokencontract = new web3.eth.Contract(CreativeToken.abi, daiAddr);

    var erc20ContractAddress = "0xaBc5aCAa793079153d135F2a7b56dfbF8520807D";
    var ERC20CashContract = new web3.eth.Contract(CreativeToken.abi, erc20ContractAddress);

    await BrainContract.methods.issue(
        brainContractAddress, "100000000000000000")
        .send({ from: myAddress })
        .on("receipt", function (err, transactionHash) {
            if (err) {
                console.log(err);
            } else {
                console.log(transactionHash);
            }
        });


    // await ERC20CashContract.methods.mint(
    //     "10000000000000000000000000000").send({ from: myAddress })
    //     .on("receipt", function (err, transactionHash) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log(transactionHash);
    //         }
    //     });




    await supertokencontract.methods.approve(
        brainContractAddress, "2500000000000000000000000000").send({ from: myAddress })
        .on("receipt", function (err, transactionHash) {
            if (err) {
                console.log(err);
            } else {
                console.log(transactionHash);
            }
        });


    console.log("here");
    await BrainContract.methods.distribute(
        "125000000000000000000").send({ from: myAddress })
        .on("receipt", function (err, transactionHash) {
            if (err) {
                console.log(err);
                console.log("here");
            } else {
                console.log(transactionHash);
            }
        });


    // await BrainContract.methods.test(
    // "1250000000000000000").call({ from: myAddress })
    // .on("receipt", function (err, transactionHash) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log(transactionHash);
    //     }
    // });

    // console.log("test done");

    // // await BrainContract.methods.test1().send({ from: myAddress })
    // //     .on("receipt", function (err, transactionHash) {
    // //         if (err) {
    // //             console.log(err);
    // //         } else {
    // //             console.log(transactionHash);
    // //         }
    // //     });

    // console.log("test1 done");


    // await BrainContract.methods.test2().send({ from: myAddress })
    //     .on("receipt", function (err, transactionHash) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log(transactionHash);
    //         }
    //     });

    // console.log("test2 done");

    // await BrainContract.methods.test3().send({ from: myAddress })
    //     .on("receipt", function (err, transactionHash) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log(transactionHash);
    //         }
    //     });



    // web3.eth.sendTransaction({data: code}, function(err, transactionHash) {
    //     if (!err)
    //       console.log(transactionHash);

    //     var receipt = web3.eth.getTransactionReceipt(transactionHash);
    //   });
};
