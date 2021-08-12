/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Sam Stieby and Jessica Russell
 */

/** namespace. */
var rhit = rhit || {};

rhit.fbAuthManager = null;

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#loginButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};
	}
}

rhit.HomePageController = class {
	constructor() {
		rhit.HandleDrawerButtons();
		document.querySelector("#findBuddyButton").onclick = (event) => {
			window.location.href = "/Find Buddy.html"
		};
		document.querySelector("#findRouteButton").onclick = (event) => {
			window.location.href = "/Find Route.html"
		};
		document.querySelector("#chatButton").onclick = (event) => {
			window.location.href = "/Chat.html"
		};
		document.querySelector("#forumButton").onclick = (event) => {
			window.location.href = "/Buddy Forum.html"
		};
	}
}

rhit.ChatPageController = class {
	constructor() {
		rhit.HandleDrawerButtons();
	}
}
rhit.ForumPageController = class {
	constructor() {
		rhit.HandleDrawerButtons();
	}
}
rhit.FindBuddyPageController = class {
	constructor() {
		rhit.HandleDrawerButtons();
	}
}
rhit.FindRoutePageController = class {
	constructor() {
		rhit.HandleDrawerButtons();
	}
}
rhit.AccountPageController = class {
	constructor() {
		rhit.HandleDrawerButtons();
	}
}


rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}

	signIn() {
		console.log("Sign in using Rosefire");
		Rosefire.signIn("996fd7b5-d122-4361-b84a-4cd23dd7110d", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you provided is not valid.');
				} else {
					console.error("Custom auth error", errorCode, errorMessage);
				}
			});
		});

	}

	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});
	}

	get isSignedIn() {
		return !!this._user;
	}

	get uid() {
		return this._user.uid;
	}
}

rhit.checkForRedirects = function () {
	// if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
	// 	window.location.href = "/Homepage.html";
	// }
	// if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
	// 	window.location.href = "/";
	// }
}

rhit.initializeChats = function () {
	const urlParams = new URLSearchParams(window.location.search);

}

rhit.initializeForums = function () {

}

rhit.initializePage = function () {
	if (document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
	if (document.querySelector("#homePage")) {
		console.log("You are on the home page.");
		new rhit.HomePageController();
	}
	if (document.querySelector("#chatPage")) {
		console.log("You are on the chat page.");
		new rhit.ChatPageController();
	}
	if (document.querySelector("#forumPage")) {
		console.log("You are on the forum page.");
		new rhit.ForumPageController();
	}
	if (document.querySelector("#accountPage")) {
		console.log("You are on the profile page.");
		new rhit.AccountPageController();
	}
	if (document.querySelector("#findRoutePage")) {
		console.log("You are on the find route page.");
		new rhit.FindRoutePageController();
	}
	if (document.querySelector("#findBuddyPage")) {
		console.log("You are on the find buddy page.");
		new rhit.FindBuddyPageController();
	}
}

rhit.HandleDrawerButtons = function () {
	document.querySelector("#menuFindBuddy").onclick = (event) => {
		window.location.href = "/Find Buddy.html";
	};
	document.querySelector("#menuFindRoute").onclick = (event) => {
		window.location.href = "/Find Route.html";
	};
	document.querySelector("#menuGoToHomePage").onclick = (event) => {
		window.location.href = "/Homepage.html";
	};
	document.querySelector("#menuForum").onclick = (event) => {
		window.location.href = "/Buddy Forum.html";
	};
	document.querySelector("#menuChat").onclick = (event) => {
		window.location.href = "/Chat.html";
	};
	document.querySelector("#menuGoToProfilePage").onclick = (event) => {
		window.location.href = "/Profile.html";
	}
}

rhit.main = function () {
	console.log("Ready");
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initializePage();
	});
};
rhit.main();
