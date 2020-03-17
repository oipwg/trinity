export const receiveMessage = event => {
    // Do we trust the sender of this message? (might be
    // different from what we originally opened, for example).

    console.log({ BASE_URL }, event.origin);

    if (event.origin !== BASE_URL) {
        return;
    }
    const { data, isTrusted } = event;

    console.log(data);

    console.log(window);
};
