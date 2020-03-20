export const openSignInWindow = (url, name) => {
    let windowObjectRefrence = null;
    let previousUrl = null;

    // window.removeEventListener('message', receiveMessage);

    const strWindowFeatures =
        'centerscreen=yes,menubar=no,location=no,resizable=no,scrollbars=no,status=no,width=600,height=700';

    if (windowObjectRefrence === null || windowObjectRefrence.closed) {
        // if the pointer to the widnwo object in memory does not exist
        // or if such pointer exists but the window was close
        windowObjectRefrence = window.open(url, name, strWindowFeatures);
        // then create it. The new window will be created and will be brought on top of any other window
    } else {
        windowObjectRefrence.focus();
    }

    // add the listener for receiving a message from the popup
    // window.addEventListener('message', event => receiveMessage(event), false);
    // assign the previous URL
    previousUrl = url;

    if (!previousUrl) {
        window.close();
    }

    console.log(previousUrl);
    const params = window.location.search;
    console.log(params);

    console.log(window.opener);

    /* 
    
    
     // get the URL parameters which will include the auth token
   const params = window.location.search;
   if (window.opener) {
     // send them to the opening window
     window.opener.postMessage(params);
     // close the popup
     window.close();
   }
 });
 // some text to show the user
//  return <p>Please wait...</p>;
    
    
    
    */
};
