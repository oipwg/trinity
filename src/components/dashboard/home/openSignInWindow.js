import React from 'react';

let windowObjectRefrence = null;
let previousUrl = null;
const receiveMessage = require('./message200');

const openSignInWindow = (url, name) => {
    window.removeEventListener('message', receiveMessage);

    const strWindowFeatures =
        'toolbar=no, menubar=no, width=600, height=700, top=100, left=100';

    if (windowObjectRefrence === null || windowObjectRefrence.closed) {
        windowObjectRefrence = window.open(url, name, strWindowFeatures);
    } else if (previousUrl !== url) {
        windowObjectRefrence = window.open(url, name, strWindowFeatures);
        windowObjectRefrence.focus();
    } else {
        windowObjectRefrence.focus();
    }

    window.addEventListener('message', event => receiveMessage(event), false);

    previousUrl = url;
};

openSignInWindow();
