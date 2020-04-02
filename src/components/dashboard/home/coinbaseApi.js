import axios from 'axios';

// this will get pulled from user's account.


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
