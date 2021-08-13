/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Sam Stieby and Jessica Russell
 */

/** namespace. */
var rhit = rhit || {};
rhit.FB_CHATS_COLLECTION = "Chats";
rhit.FB_KEY_MESSAGE = "message";
rhit.FB_KEY_TIMESTAMP = "timeSent";
rhit.FB_FORUM_COLLECTION = "Forum";
rhit.FB_USERS_COLLECTION = "Users";

let map;


rhit.fbAuthManager = null;
rhit.fbUsersManager = null;
rhit.fbChatsManager = null;

// From https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#loginButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};
	}
}

function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 8,
	  center: {
		lat: -34.397,
		lng: 150.644
	  }
	});
  
	var directionsService = new google.maps.DirectionsService();
  
	var directionsDisplay = new google.maps.DirectionsRenderer({
	  map: map
	});
  
	var geocoder = new google.maps.Geocoder();
  
	var pointA, pointB;
  
  
	geocoder.geocode({
	  'address': document.getElementById('addressFrom').value
	}, function(results, status) {
	  if (status != "OK") return;
	  var location = results[0].geometry.location;
	  pointA = new google.maps.LatLng(location.lat(), location.lng());
	  alert(location.lat() + ',' + location.lng());
	  var markerA = new google.maps.Marker({
		position: pointA,
		title: "point A",
		label: "A",
		map: map
	  });
	  geocoder.geocode({
		'address': document.getElementById('addressTo').value
	  }, function(results, status) {
		if (status != "OK") return;
		var location = results[0].geometry.location;
		pointB = new google.maps.LatLng(location.lat(), location.lng());
		alert(location.lat() + ',' + location.lng());
		var markerB = new google.maps.Marker({
		  position: pointB,
		  title: "point B",
		  label: "B",
		  map: map
		});
		calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB);
	  });
	});
  }
  
  function calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB) {
	directionsService.route({
	  origin: pointA,
	  destination: pointB,
	  travelMode: google.maps.TravelMode.DRIVING
	}, function(response, status) {
	  if (status == google.maps.DirectionsStatus.OK) {
		directionsDisplay.setDirections(response);
	  } else {
		window.alert('Directions request failed due to ' + status);
	  }
	});
  }
  
  function calcRoute(haight, oceanBeach, directionsService, directionsRenderer) {
	var selectedMode = "WALKING";
	var request = {
		origin: haight,
		destination: oceanBeach,
		// Note that JavaScript allows us to access the constant
		// using square brackets and a string value as its
		// "property."
		travelMode: google.maps.TravelMode[selectedMode]
	};
	directionsService.route(request, function(response, status) {
	  if (status == 'OK') {
		directionsRenderer.setDirections(response);
	  }
	});
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
		// rhit.fbChatsManager.beginListening(this.updateList.bind(this));
	}

	_createCard(buddy) {
		return htmlToElement(`      
	<div class="card">
		<div class="card-body">
		  <h5 class="card-title">${buddy.name}</h5>
		</div>
	</div>`);
	}

	updateBuddies() {
		const newBuddyList = htmlToElement('<div id="buddyListContainer"></div>');
		for (let i = 0; i < rhit.fbChatsManager.length; i++) {
			const chat = rhit.fbChatsManager.getChatAtIndex(i);
			const newCard = this._createCard(buddy);
			const chatUrlParam = `${buddy.uid}` + `${user.uid}`;
			newCard.onclick = (event) => {
				window.location.href = `/Single Chat.html?id=${chatUrlParam}`;
			}
		}
	}

}
rhit.SingleChatController = class {
	constructor() {
		HandleDrawerButtons();
	}
}
rhit.FbChatsManager = class {

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
		Rosefire.signIn("e9c3d9c1-a6b8-4f20-901b-dc72d13b3b1e", (err, rfUser) => {
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
			let name = rfUser.name;
			let email = rfUser.email;
			let uid = rfUser.username;
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
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/Homepage.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
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
		rhit.fbChatsManager = new rhit.FbChatsManager(uid);
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
	document.querySelector("#menuSignOut").onclick = (event) => {
		rhit.fbAuthManager.signOut();
		window.location.href = "/index.html";
	}
}
rhit.main = function () {
	console.log("Ready");
	// initMap();
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initializePage();
	});
};
rhit.main();
