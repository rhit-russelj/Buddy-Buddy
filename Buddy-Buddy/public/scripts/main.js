/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Sam Stieby and Jessica Russell
 */

/** namespace. */
var rhit = rhit || {};

signIn() {
Rosefire.signIn("996fd7b5-d122-4361-b84a-4cd23dd7110d", (err, rfUser) => {
	if (err) {
	  console.log("Rosefire error!", err);
	  return;
	}
	console.log("Rosefire success!", rfUser);
  
	// Next use the Rosefire token with Firebase auth.
	firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
	  if (error.code === 'auth/invalid-custom-token') {
		console.log("The token you provided is not valid.");
	  } else {
		console.log("signInWithCustomToken error", error.message);
	  }
	}); // Note: Success should be handled by an onAuthStateChanged listener.
  });
}
  
rhit.checkForRedirects() = function() {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/Homepage.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
}

rhit.initializeChats() = function() {
const urlParams = new URLSearchParams(window.location.search);

}

rhit.initializeForums() = function() {

}

rhit.main = function () {

}
rhit.main();
