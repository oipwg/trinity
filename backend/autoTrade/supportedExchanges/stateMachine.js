const { Machine } = require('xstate');

const tradeMachine = Machine({
    id: 'autotrade',
    initial: 'idle',
    context: {
      hour: 0,
      blockheight: Date.now()
    },
    states: {
      idle: {
        on: {
          MONITOR: 'wait',
        }
      },
      wait: {
        on: {
         BLOCK_MATURE: 'deposit',
        }
      },
      deposit: {
        on: {
          MOVING: 'create',
        }
      },
      create: {
        on: {
          CHECK_ORDER: 'status',
        }
      },
      status: {
        on: {
          PARTIALLY_MET: '',
          NOT_PART_MET: '',
          FULLY_MET: 'withdraw'
        }
      },
      withdraw: {
        on: {
          SEND: 'success'
        }
      },
      success: {
        type: 'final',
      }
      // failure: {
      //   on: {
      //     RETRY: {
      //       target: 'wait',
      //       actions: assign({
      //         retries: (context, event) => context.retries + 1
      //       })
      //     }
      //   }
      // }
    }
  });