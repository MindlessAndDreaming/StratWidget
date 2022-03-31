import global from "~/mixins/global.js";

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export default {
    mixins: [global],
    methods: {
        deleteWorkerConfirmBox() {
            this.$bvModal.msgBoxConfirm('Are you sure? Have you withdrawn all remaining dust from the contract?')
                .then(value => {
                    if (value) {
                        var addressKey = `workerAddress${this.$store.state.myAccount.networkId}`;
                        localStorage.removeItem(addressKey);
                        window.location.reload();                  
                    }
                })
                .catch(err => {
                console.log(err);
                })
        },
        async deployWorker() {
            this.showOverlay = true; 

            var workerContract = new window.w3.eth.Contract(
                [
                    {
                        "anonymous":false,
                        "inputs":[
                            {
                                "indexed":true,
                                "internalType":"address",
                                "name":"_from",
                                "type":"address"
                            },
                            {
                                "indexed":true,
                                "internalType":"address",
                                "name":"_assetAddress",
                                "type":"address"
                            },
                            {
                                "indexed":false,
                                "internalType":"uint256",
                                "name":"amount",
                                "type":"uint256"
                            }
                        ],
                        "name":"LogWithdraw",
                        "type":"event"
                    },
                    {
                        "anonymous":false,
                        "inputs":[
                            {
                                "indexed":true,
                                "internalType":"address",
                                "name":"_from",
                                "type":"address"
                            },
                            {
                                "indexed":true,
                                "internalType":"address",
                                "name":"_assetAddress",
                                "type":"address"
                            },
                            {
                                "indexed":false,
                                "internalType":"uint256",
                                "name":"id",
                                "type":"uint256"
                            }
                        ],
                        "name":"LogWithdrawNFT",
                        "type":"event"
                    },
                    {
                        "anonymous":false,
                        "inputs":[
                            {
                                "indexed":true,
                                "internalType":"address",
                                "name":"previousOwner",
                                "type":"address"
                            },
                            {
                                "indexed":true,
                                "internalType":"address",
                                "name":"newOwner",
                                "type":"address"
                            }
                        ],
                        "name":"OwnershipTransferred",
                        "type":"event"
                    },
                    {
                        "anonymous":false,
                        "inputs":[
                            {
                                "indexed":false,
                                "internalType":"address",
                                "name":"account",
                                "type":"address"
                            }
                        ],
                        "name":"Paused",
                        "type":"event"
                    },
                    {
                        "anonymous":false,
                        "inputs":[
                            {
                                "indexed":false,
                                "internalType":"address",
                                "name":"account",
                                "type":"address"
                            }
                        ],
                        "name":"Unpaused",
                        "type":"event"
                    },
                    {
                        "inputs":[
                            {
                                "components":[
                                    {
                                        "internalType":"address",
                                        "name":"To",
                                        "type":"address"
                                    },
                                    {
                                        "internalType":"bytes",
                                        "name":"Data",
                                        "type":"bytes"
                                    }
                                ],
                                "internalType":"struct Worker.Action[]",
                                "name":"actions",
                                "type":"tuple[]"
                            }
                        ],
                        "name":"execute",
                        "outputs":[
                            {
                                "components":[
                                    {
                                        "internalType":"bool",
                                        "name":"status",
                                        "type":"bool"
                                    },
                                    {
                                        "internalType":"bytes",
                                        "name":"Data",
                                        "type":"bytes"
                                    }
                                ],
                                "internalType":"struct Worker.Result[]",
                                "name":"",
                                "type":"tuple[]"
                            }
                        ],
                        "stateMutability":"nonpayable",
                        "type":"function"
                    },
                    {
                        "inputs":[
                            {
                                "internalType":"address",
                                "name":"",
                                "type":"address"
                            },
                            {
                                "internalType":"address",
                                "name":"",
                                "type":"address"
                            },
                            {
                                "internalType":"uint256",
                                "name":"",
                                "type":"uint256"
                            },
                            {
                                "internalType":"bytes",
                                "name":"",
                                "type":"bytes"
                            }
                        ],
                        "name":"onERC721Received",
                        "outputs":[
                            {
                                "internalType":"bytes4",
                                "name":"",
                                "type":"bytes4"
                            }
                        ],
                        "stateMutability":"nonpayable",
                        "type":"function"
                    },
                    {
                        "inputs":[],
                        "name":"owner",
                        "outputs":[
                            {
                                "internalType":"address",
                                "name":"",
                                "type":"address"
                            }
                        ],
                        "stateMutability":"view",
                        "type":"function"
                    },
                    {
                        "inputs":[],
                        "name":"paused",
                        "outputs":[
                            {
                                "internalType":"bool",
                                "name":"",
                                "type":"bool"
                            }
                        ],
                        "stateMutability":"view",
                        "type":"function"
                    },
                    {
                        "inputs":[],
                        "name":"renounceOwnership",
                        "outputs":[],
                        "stateMutability":"nonpayable",
                        "type":"function"
                    },
                    {
                        "inputs":[
                            {
                                "internalType":"address",
                                "name":"newOwner",
                                "type":"address"
                            }
                        ],
                        "name":"transferOwnership",
                        "outputs":[],
                        "stateMutability":"nonpayable",
                        "type":"function"
                    },
                    {
                        "inputs":[
                            {
                                "internalType":"address",
                                "name":"sender",
                                "type":"address"
                            },
                            {
                                "internalType":"uint256",
                                "name":"_amount0",
                                "type":"uint256"
                            },
                            {
                                "internalType":"uint256",
                                "name":"_amount1",
                                "type":"uint256"
                            },
                            {
                                "internalType":"bytes",
                                "name":"_data",
                                "type":"bytes"
                            }
                        ],
                        "name":"uniswapV2Call",
                        "outputs":[],
                        "stateMutability":"nonpayable",
                        "type":"function"
                    },
                    {
                        "inputs":[
                            {
                                "internalType":"address",
                                "name":"_assetAddress",
                                "type":"address"
                            }
                        ],
                        "name":"withdraw",
                        "outputs":[],
                        "stateMutability":"nonpayable",
                        "type":"function"
                    },
                    {
                        "inputs":[
                            {
                                "internalType":"address",
                                "name":"_assetAddress",
                                "type":"address"
                            },
                            {
                                "internalType":"uint256",
                                "name":"_assetID",
                                "type":"uint256"
                            }
                        ],
                        "name":"withdrawERC721",
                        "outputs":[],
                        "stateMutability":"nonpayable",
                        "type":"function"
                    }
                ]
            );
            var worker = workerContract.deploy({
                data: '0x608060405234801561001057600080fd5b5061002d61002261004c60201b60201c565b61005460201b60201c565b60008060146101000a81548160ff021916908315150217905550610118565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b611e7d806101276000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063715018a611610066578063715018a61461011e5780638da5cb5b14610128578063baae8abf14610146578063f2fde38b14610176578063f3e414f81461019257610093565b806310d1e85c14610098578063150b7a02146100b457806351cff8d9146100e45780635c975abb14610100575b600080fd5b6100b260048036038101906100ad919061115b565b6101ae565b005b6100ce60048036038101906100c99190611324565b6105c6565b6040516100db91906113e2565b60405180910390f35b6100fe60048036038101906100f991906113fd565b6105da565b005b61010861085c565b6040516101159190611445565b60405180910390f35b610126610872565b005b6101306108fa565b60405161013d919061146f565b60405180910390f35b610160600480360381019061015b91906115e1565b610923565b60405161016d91906117c0565b60405180910390f35b610190600480360381019061018b91906113fd565b610b5d565b005b6101ac60048036038101906101a791906117e2565b610c54565b005b6101b661085c565b156101f6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101ed9061187f565b60405180910390fd5b60003373ffffffffffffffffffffffffffffffffffffffff16630dfe16816040518163ffffffff1660e01b8152600401602060405180830381865afa158015610243573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061026791906118b4565b905060003373ffffffffffffffffffffffffffffffffffffffff1663d21220a76040518163ffffffff1660e01b8152600401602060405180830381865afa1580156102b6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102da91906118b4565b9050600084848101906102ed9190611975565b9050806000015173ffffffffffffffffffffffffffffffffffffffff1663c45a01556040518163ffffffff1660e01b8152600401602060405180830381865afa15801561033e573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061036291906118b4565b73ffffffffffffffffffffffffffffffffffffffff1663e6a4390584846040518363ffffffff1660e01b815260040161039c9291906119be565b602060405180830381865afa1580156103b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103dd91906118b4565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461044a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161044190611a33565b60405180910390fd5b60008714806104595750600086145b610498576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161048f90611a9f565b60405180910390fd5b6000871415806104a9575060008614155b6104e8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104df90611b0b565b60405180910390fd5b6104f06108fa565b73ffffffffffffffffffffffffffffffffffffffff168873ffffffffffffffffffffffffffffffffffffffff161461052757600080fd5b6105348160600151610da8565b50806020015173ffffffffffffffffffffffffffffffffffffffff1663a9059cbb3383604001516040518363ffffffff1660e01b8152600401610578929190611b3a565b6020604051808303816000875af1158015610597573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105bb9190611b8f565b505050505050505050565b600063150b7a0260e01b9050949350505050565b6105e2610f66565b73ffffffffffffffffffffffffffffffffffffffff166106006108fa565b73ffffffffffffffffffffffffffffffffffffffff1614610656576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161064d90611c08565b60405180910390fd5b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036106f75760003090508073ffffffffffffffffffffffffffffffffffffffff163191503373ffffffffffffffffffffffffffffffffffffffff166108fc839081150290604051600060405180830381858888f193505050501580156106f0573d6000803e3d6000fd5b50506107f3565b8173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401610730919061146f565b602060405180830381865afa15801561074d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107719190611c3d565b90508173ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33836040518363ffffffff1660e01b81526004016107ae929190611b3a565b6020604051808303816000875af11580156107cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107f19190611b8f565b505b8173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f9207361cc2a04b9c7a06691df1eb87c6a63957ae88bf01d0d18c81e3d1272099836040516108509190611c6a565b60405180910390a35050565b60008060149054906101000a900460ff16905090565b61087a610f66565b73ffffffffffffffffffffffffffffffffffffffff166108986108fa565b73ffffffffffffffffffffffffffffffffffffffff16146108ee576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108e590611c08565b60405180910390fd5b6108f86000610f6e565b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b606061092d610f66565b73ffffffffffffffffffffffffffffffffffffffff1661094b6108fa565b73ffffffffffffffffffffffffffffffffffffffff16146109a1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161099890611c08565b60405180910390fd5b6109a961085c565b156109e9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109e09061187f565b60405180910390fd5b6000825167ffffffffffffffff811115610a0657610a056111f9565b5b604051908082528060200260200182016040528015610a3f57816020015b610a2c611032565b815260200190600190039081610a245790505b50905060005b8351811015610b5357600080858381518110610a6457610a63611c85565b5b60200260200101516000015173ffffffffffffffffffffffffffffffffffffffff16868481518110610a9957610a98611c85565b5b602002602001015160200151604051610ab29190611cf0565b6000604051808303816000865af19150503d8060008114610aef576040519150601f19603f3d011682016040523d82523d6000602084013e610af4565b606091505b509150915081610b0357600080fd5b60006040518060400160405280841515815260200183815250905080858581518110610b3257610b31611c85565b5b60200260200101819052505050508080610b4b90611d36565b915050610a45565b5080915050919050565b610b65610f66565b73ffffffffffffffffffffffffffffffffffffffff16610b836108fa565b73ffffffffffffffffffffffffffffffffffffffff1614610bd9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bd090611c08565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610c48576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c3f90611df0565b60405180910390fd5b610c5181610f6e565b50565b610c5c610f66565b73ffffffffffffffffffffffffffffffffffffffff16610c7a6108fa565b73ffffffffffffffffffffffffffffffffffffffff1614610cd0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cc790611c08565b60405180910390fd5b8173ffffffffffffffffffffffffffffffffffffffff166342842e0e3033846040518463ffffffff1660e01b8152600401610d0d93929190611e10565b600060405180830381600087803b158015610d2757600080fd5b505af1158015610d3b573d6000803e3d6000fd5b505050508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f9207361cc2a04b9c7a06691df1eb87c6a63957ae88bf01d0d18c81e3d127209983604051610d9c9190611c6a565b60405180910390a35050565b6060610db261085c565b15610df2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610de99061187f565b60405180910390fd5b6000825167ffffffffffffffff811115610e0f57610e0e6111f9565b5b604051908082528060200260200182016040528015610e4857816020015b610e35611032565b815260200190600190039081610e2d5790505b50905060005b8351811015610f5c57600080858381518110610e6d57610e6c611c85565b5b60200260200101516000015173ffffffffffffffffffffffffffffffffffffffff16868481518110610ea257610ea1611c85565b5b602002602001015160200151604051610ebb9190611cf0565b6000604051808303816000865af19150503d8060008114610ef8576040519150601f19603f3d011682016040523d82523d6000602084013e610efd565b606091505b509150915081610f0c57600080fd5b60006040518060400160405280841515815260200183815250905080858581518110610f3b57610f3a611c85565b5b60200260200101819052505050508080610f5490611d36565b915050610e4e565b5080915050919050565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6040518060400160405280600015158152602001606081525090565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061108d82611062565b9050919050565b61109d81611082565b81146110a857600080fd5b50565b6000813590506110ba81611094565b92915050565b6000819050919050565b6110d3816110c0565b81146110de57600080fd5b50565b6000813590506110f0816110ca565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f84011261111b5761111a6110f6565b5b8235905067ffffffffffffffff811115611138576111376110fb565b5b60208301915083600182028301111561115457611153611100565b5b9250929050565b60008060008060006080868803121561117757611176611058565b5b6000611185888289016110ab565b9550506020611196888289016110e1565b94505060406111a7888289016110e1565b935050606086013567ffffffffffffffff8111156111c8576111c761105d565b5b6111d488828901611105565b92509250509295509295909350565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611231826111e8565b810181811067ffffffffffffffff821117156112505761124f6111f9565b5b80604052505050565b600061126361104e565b905061126f8282611228565b919050565b600067ffffffffffffffff82111561128f5761128e6111f9565b5b611298826111e8565b9050602081019050919050565b82818337600083830152505050565b60006112c76112c284611274565b611259565b9050828152602081018484840111156112e3576112e26111e3565b5b6112ee8482856112a5565b509392505050565b600082601f83011261130b5761130a6110f6565b5b813561131b8482602086016112b4565b91505092915050565b6000806000806080858703121561133e5761133d611058565b5b600061134c878288016110ab565b945050602061135d878288016110ab565b935050604061136e878288016110e1565b925050606085013567ffffffffffffffff81111561138f5761138e61105d565b5b61139b878288016112f6565b91505092959194509250565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b6113dc816113a7565b82525050565b60006020820190506113f760008301846113d3565b92915050565b60006020828403121561141357611412611058565b5b6000611421848285016110ab565b91505092915050565b60008115159050919050565b61143f8161142a565b82525050565b600060208201905061145a6000830184611436565b92915050565b61146981611082565b82525050565b60006020820190506114846000830184611460565b92915050565b600067ffffffffffffffff8211156114a5576114a46111f9565b5b602082029050602081019050919050565b600080fd5b600080fd5b6000604082840312156114d6576114d56114b6565b5b6114e06040611259565b905060006114f0848285016110ab565b600083015250602082013567ffffffffffffffff811115611514576115136114bb565b5b611520848285016112f6565b60208301525092915050565b600061153f61153a8461148a565b611259565b9050808382526020820190506020840283018581111561156257611561611100565b5b835b818110156115a957803567ffffffffffffffff811115611587576115866110f6565b5b80860161159489826114c0565b85526020850194505050602081019050611564565b5050509392505050565b600082601f8301126115c8576115c76110f6565b5b81356115d884826020860161152c565b91505092915050565b6000602082840312156115f7576115f6611058565b5b600082013567ffffffffffffffff8111156116155761161461105d565b5b611621848285016115b3565b91505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61165f8161142a565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561169f578082015181840152602081019050611684565b838111156116ae576000848401525b50505050565b60006116bf82611665565b6116c98185611670565b93506116d9818560208601611681565b6116e2816111e8565b840191505092915050565b60006040830160008301516117056000860182611656565b506020830151848203602086015261171d82826116b4565b9150508091505092915050565b600061173683836116ed565b905092915050565b6000602082019050919050565b60006117568261162a565b6117608185611635565b93508360208202850161177285611646565b8060005b858110156117ae578484038952815161178f858261172a565b945061179a8361173e565b925060208a01995050600181019050611776565b50829750879550505050505092915050565b600060208201905081810360008301526117da818461174b565b905092915050565b600080604083850312156117f9576117f8611058565b5b6000611807858286016110ab565b9250506020611818858286016110e1565b9150509250929050565b600082825260208201905092915050565b7f5061757361626c653a2070617573656400000000000000000000000000000000600082015250565b6000611869601083611822565b915061187482611833565b602082019050919050565b600060208201905081810360008301526118988161185c565b9050919050565b6000815190506118ae81611094565b92915050565b6000602082840312156118ca576118c9611058565b5b60006118d88482850161189f565b91505092915050565b6000608082840312156118f7576118f66114b6565b5b6119016080611259565b90506000611911848285016110ab565b6000830152506020611925848285016110ab565b6020830152506040611939848285016110e1565b604083015250606082013567ffffffffffffffff81111561195d5761195c6114bb565b5b611969848285016115b3565b60608301525092915050565b60006020828403121561198b5761198a611058565b5b600082013567ffffffffffffffff8111156119a9576119a861105d565b5b6119b5848285016118e1565b91505092915050565b60006040820190506119d36000830185611460565b6119e06020830184611460565b9392505050565b7f556e617574686f72697a65640000000000000000000000000000000000000000600082015250565b6000611a1d600c83611822565b9150611a28826119e7565b602082019050919050565b60006020820190508181036000830152611a4c81611a10565b9050919050565b7f5468657265206d7573742062652061207a65726f206173736574000000000000600082015250565b6000611a89601a83611822565b9150611a9482611a53565b602082019050919050565b60006020820190508181036000830152611ab881611a7c565b9050919050565b7f5468657265206d7573742062652061206e6f6e207a65726f2061737365740000600082015250565b6000611af5601e83611822565b9150611b0082611abf565b602082019050919050565b60006020820190508181036000830152611b2481611ae8565b9050919050565b611b34816110c0565b82525050565b6000604082019050611b4f6000830185611460565b611b5c6020830184611b2b565b9392505050565b611b6c8161142a565b8114611b7757600080fd5b50565b600081519050611b8981611b63565b92915050565b600060208284031215611ba557611ba4611058565b5b6000611bb384828501611b7a565b91505092915050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b6000611bf2602083611822565b9150611bfd82611bbc565b602082019050919050565b60006020820190508181036000830152611c2181611be5565b9050919050565b600081519050611c37816110ca565b92915050565b600060208284031215611c5357611c52611058565b5b6000611c6184828501611c28565b91505092915050565b6000602082019050611c7f6000830184611b2b565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600081905092915050565b6000611cca82611665565b611cd48185611cb4565b9350611ce4818560208601611681565b80840191505092915050565b6000611cfc8284611cbf565b915081905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611d41826110c0565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203611d7357611d72611d07565b5b600182019050919050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000611dda602683611822565b9150611de582611d7e565b604082019050919050565b60006020820190508181036000830152611e0981611dcd565b9050919050565b6000606082019050611e256000830186611460565b611e326020830185611460565b611e3f6040830184611b2b565b94935050505056fea2646970667358221220b5bff3a0656d906e983b71be2e62eb718fe0000db5b688f7f3fa6321e50bc34564736f6c634300080d0033', 
                arguments: []
            }).send({
                from: this.coinbase,
                gasPrice: this.gas_price, 
                gas: '1999999'
            }, async (e, transactionHash) => {
                console.log(e, transactionHash);
                let transactionReceipt = null
                while (transactionReceipt == null) {
                    transactionReceipt = await new window.w3.eth.getTransactionReceipt(transactionHash);
                    await sleep(2500);
                }
                console.log(transactionReceipt);
                var addressKey =  `workerAddress${this.$store.state.myAccount.networkId}`;
                localStorage.setItem(addressKey, transactionReceipt.contractAddress);

                this.$store.commit('myAccount/change', {
                    networkId: this.networkId,
                    coinbase: this.coinbase,
                    balance: this.humanize(await window.w3.eth.getBalance(this.coinbase), 18), 
                });

                this.showOverlay = false;
            })
        }
    }
}