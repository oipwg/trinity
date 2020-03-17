import axios from 'axios';

// this will get pulled from user's account.
const accesstoken =
    '1a9c487ed4db38d4654e2c11d029757e0ac753d6dfe7e0c48a213ebc1e52118e';
const coinbase = axios.create({
    baseURL: 'https://api.coinbase.com/v2',
    timeout: 1000,
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accesstoken}`,
    },
});

export const listAccounts = () => {
    coinbase
        .get('/accounts', {
            headers: {
                Authorization: `Bearer ${accesstoken}`,
            },
        })
        .then(data => {
            console.log(data);
            return data;
        })
        .catch(err => {
            console.log(err);
            return err;
        });
};

//*** BUYING ***/ - need resource id
// SCOPES
// wallet:buys:create

export const placeBuyOrderWithoutFees = (
    walletId,
    amount,
    currency,
    payment_method = null,
    agree_btc_amount_varies = false,
    quote = true
) => {
    const body = JSON.stringify({
        amount,
        currency,
        payment_method,
        agree_btc_amount_varies,
        quote,
    });

    return coinbase
        .post(`accounts/${walletId}/buys`, body)
        .then(res => {
            return res;
        })
        .catch(err => console.log(err));
};

export const placeBuyOrderWithFees = (
    walletId,
    amount,
    total,
    currency,
    payment_method = null,
    agree_btc_amount_varies = false,
    quote = true
) => {
    const body = JSON.stringify({
        amount,
        total,
        currency,
        payment_method,
        agree_btc_amount_varies,
        quote,
    });

    console.log(body);
    coinbase
        .post(`accounts/${walletId}/buys`, body)
        .then(res => {
            console.log(res);

            let {
                fee,
                amount,
                total,
                subtotal,
                unit_price,
                status,
            } = res.data.data;

            console.log(fee, amount, total, subtotal, unit_price, status);
        })
        .catch(err => console.log(err));
};

//*** Selling ***/ - need resource id
// SCOPES
// wallet:sells:create
// Fees amout not included in order
export const placeSellOrderWithoutFees = async (
    walletId,
    amount,
    currency,
    payment_method = null,
    agree_btc_amount_varies = false,
    quote = true
) => {
    const body = JSON.stringify({
        amount,
        currency,
        payment_method,
        agree_btc_amount_varies,
        quote,
    });

    try {
        const res = await coinbase.post(`accounts/${walletId}/sells`, body);
        console.log(res);
        // let { fee, amount, total, subtotal, unit_price, status, } = res.data.data;
        // console.log({ fee, amount, total, subtotal, unit_price, status });
        return res;
    } catch (err) {
        return console.log(err);
    }
};

// amout with fees includes
export const placeSellOrderWithFees = (
    amount,
    total,
    currency,
    payment_method = null,
    agree_btc_amount_varies = false,
    quote = true
) => {
    const body = JSON.stringify({
        amount,
        total,
        currency,
        payment_method,
        agree_btc_amount_varies,
        quote,
    });

    console.log(body);
    coinbase
        .post(`accounts/${walletId}/sells`, body)
        .then(res => {
            console.log(res);
            let {
                fee,
                amount,
                total,
                subtotal,
                unit_price,
                status,
            } = res.data.data;

            console.log({ fee, amount, total, subtotal, unit_price, status });
        })
        .catch(err => console.log(err));
};

//************* Withdraw Funds **********/
// wallet:withdrawals:create

export const withDrawFunds = (
    accountId,
    amount,
    currency,
    payment_method,
    commit = false
) => {
    let body = {
        amount,
        currency,
        payment_method,
        commit,
    };

    coinbase
        .post(
            `https://api.coinbase.com/v2/accounts/${accountId}/withdrawals`,
            body
        )
        .then(res => {
            console.log(res);
            let {
                fee,
                amount,
                total,
                subtotal,
                unit_price,
                status,
            } = res.data.data;

            console.log({ fee, amount, total, subtotal, unit_price, status });
        })
        .catch(err => console.log(err));
};

export const listPaymentMethods = () => {
    coinbase
        .get('/payment-methods', headers)
        .then(res => {
            console.log(res.data.data);
        })
        .catch(err => {
            console.log(err);
        });
};

export const listBuysForAnAcc = () => {
    coinbase
        .get(`/accounts/${walletId}`, headers)
        .then(res => {
            console.log(res.data.data);
        })
        .catch(err => {
            console.log(err);
        });
};

export const listAddysforAccount = () => {
    coinbase
        .get(`accounts/cda72681-06cd-51f2-afde-123b47b5e2b8/`)
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
};

//************* Send Funds **********/
// wallet:transactions:send

// request requires a CB-2FA header
export const sendFunds = (to, amount, currency, description, fee, idem) => {
    let body = {
        type: 'send',
        to,
        amount,
        currency,
        description,
        fee,
        idem,
        to_financial_institution: false,
    };

    coinbase
        .post(`accounts/${walletId}/transactions`, body, {
            headers: {
                'CB-2FA-TOKEN': '5586810',
            },
        })
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
};

// id?
export const showOneAddyforAccount = () => {
    coinbase
        .get(`accounts/cda72681-06cd-51f2-afde-123b47b5e2b8/addresses/`)
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
};
