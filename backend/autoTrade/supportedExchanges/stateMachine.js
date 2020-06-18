
  // Available variables:
  // - Machine
  // - interpret
  // - assign
  // - send
  // - sendParent
  // - spawn
  // - raise
  // - actions
  // - XState (all XState exports)
  const { Machine, actions, interpret, assign } = require('xstate')
  
  const tradeMachine = Machine({
    id: 'fetch',
    initial: 'idle',
    context: {
      hour: 0,
      blockHeight: 0,
      receivedQty: 0,
      feeFloTx1: 0,
      hourlyCostOfRentalBtc: 0,
      totalQty: 0,
      feeFloTx2: 0,
      sellableQty: 0,
      bittrexTradeFee: 0.002,
      bittrexWithdrawlFee: .0005,
      estFeeBtcTx1: 0,
      offerPriceBtc: 0,
      offerPriceBtc24h: 0,
    },
    states: {
      idle: {
        on: {
          RESULTS: {
            target: 'resultsFromRenting',
            actions: ''
            
         }
        }
      },
      resultsFromRenting: {
        on: {
          BALANCE: {
            target: 'balDepositedInWallet',
            actions: ''
          }
        }
      },
      balDepositedInWallet: {
        on: {
          BALANCE: {
            target: 'getFees'
          }
        }
      },
      getFees: {
        on: {
          CALC: {
            target: 'calc'
          }
        }
      },
      calc: {
        on: {
          MOVE: {
            target: 'moveToBittrex'
          }
        }
      },
      moveToBittrex: {
        on: {
          DEPOSIT: {
            target: 'getFeeTx2'
          }
        }
      },
      getFeeTx2: {
        on: {
          FEE: {
            target: 'getSellableQty'
          }
        }
      },
      getSellableQty: {
        on: {
          WAIT: {
            target: 'wait150Blocks'
          }
        }
      },
      wait150Blocks: {
        on: {
          WAIT: 'calcOfferPrice'
        }
      },
      calcOfferPrice: {
        on: {
          CALC: {
            target: 'createOffer'
          }
        }
      },
      createOffer: {
        on: {
          OFFER: {
            target: 'updateUnsold'
          }
        }
      },
      updateUnsold: {},
      loop: {
        on: {
          LOOP: {
            target: ''
          }
        }
      },
      orderStatus: {
        on: {
          NOT_PARTIAL: {
            target: 'noPartiallyMetOrder'
          },
          PARTIAL: {
            target: 'partiallyMetOrder'
          },
          FULLY: {
            target: 'fullMetOrder'
          }
        }
      },
      noPartiallyMetOrder: {},
      partiallyMetOrder: {},
      fullMetOrder: {},
      withdrawlBtc: {},
      resetValues: {},
      rent: {},
      done: {},
      
    }
  });
 
  module.exports = {
    tradeMachine
  }





//   // const tradeMachine = Machine({
//     id: 'fetch',
//     initial: 'idle',
//     context: {
//       hour: 0,
//       receivedQtyHr: 0,
//       blockHeight: 0,
//       receivedQty: 0,
//       targetMargin: margin,
//       profitReinvestment: reinvestmentRate,
//       feeFloTx1: 0,
//       hourlyCostOfRentalBtc: 0,
//       totalQty: 0,
//       feeFloTx2: 0,
//       sellableQty: 0,
//       bittrexTradeFee: 0.002,
//       bittrexWithdrawlFee: .0005,
//       estFeeBtcTx1: 0,
//       offerPriceBtc: 0,
//       offerPriceBtc24h: 0,
//     },
//     states: {
//       idle: {
//             on: {
//                 NEXT: 'resultsFromRenting'
//             }
//       },
//       resultsFromRenting: {
//         on: {
//           NEXT: {
//             target: 'balDepositedInWallet',
//             actions: 'getBalanceAndFees'
//           }
//         }
//       },
//       balDepositedInWallet: {
//         on: {
//           BALANCE: {
//             target: 'getFees'
//           }
//         }
//       },
//       getFees: {
//         on: {
//           CALC: {
//             target: 'calc'
//           }
//         }
//       },
//       calc: {
//         on: {
//           MOVE: {
//             target: 'moveToBittrex'
//           }
//         }
//       },
//       moveToBittrex: {
//         on: {
//           DEPOSIT: {
//             target: 'getFeeTx2'
//           }
//         }
//       },
//       getFeeTx2: {
//         on: {
//           FEE: {
//             target: 'getSellableQty'
//           }
//         }
//       },
//       getSellableQty: {
//         on: {
//           WAIT: {
//             target: 'wait150Blocks'
//           }
//         }
//       },
//       wait150Blocks: {
//         on: {
//           WAIT: 'calcOfferPrice'
//         }
//       },
//       calcOfferPrice: {
//         on: {
//           CALC: {
//             target: 'createOffer'
//           }
//         }
//       },
//       createOffer: {
//         on: {
//           OFFER: {
//             target: 'updateUnsold'
//           }
//         }
//       },
//       updateUnsold: {},
//       loop: {
//         on: {
//           LOOP: {
//             target: ''
//           }
//         }
//       },
//       orderStatus: {
//         on: {
//           NOT_PARTIAL: {
//             target: 'noPartiallyMetOrder'
//           },
//           PARTIAL: {
//             target: 'partiallyMetOrder'
//           },
//           FULLY: {
//             target: 'fullMetOrder'
//           }
//         }
//       },
//       noPartiallyMetOrder: {},
//       partiallyMetOrder: {},
//       fullMetOrder: {},
//       withdrawlBtc: {},
//       resetValues: {},
//       rent: {},
//       done: {},
      
//     }
//   },
//     {
//         actions: {
//             getBalanceAndFees: async (context, event) => {
//                 let { balance, transactions } = await getBalanceFromAddress
//                 let fees = await getFees(transactions)

//                 context.receivedQty = balance
//                 context.feeFloTx1 = fees

//                 console.log({context, event})
//             }
//         }
//     }
//   );
















// const tradeService = interpret(tradeMachine);

// tradeService.subscribe(state => {
//     console.log('---', {state})
// })

// tradeService.start();

// tradeService.transition('PUSH')