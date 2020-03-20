const receiveMessage = event => {
    // Do we trust the sender of this message? (might be
    // different from what we originally opened, for example).
    if (event.origin !== BASE_URL) {
      return;
    }
    const { data } = event;
    console.log(event, data)
    // if we trust the sender and the source is our popup
    if (data.source === 'lma-login-redirect') {
      // get the URL params and redirect to our server to use Passport to auth/login
      const { payload } = data;
      window.location.pathname = redirectUrl;
    }
   };