/**
 * @author 
 * Sam Stieby and Jessica Russell
 */

/** namespace. */
var rhit = rhit || {};
rhit.FB_CHATS_COLLECTION = "Chats";
rhit.FB_CONTACTS_COLLECTION = "Contacts";
rhit.FB_KEY_CONTACTLIST = "contactList";
rhit.FB_KEY_MESSAGE = "message";
rhit.FB_KEY_CONTACT = "contact";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_FORUM_COLLECTION = "Forum";
rhit.FB_USERS_COLLECTION = "Users";
rhit.FB_KEY_AUTHOR = "author";
rhit.FB_KEY_TITLE = "title";
rhit.FB_KEY_BODY = "body";
rhit.FB_ROUTES_COLLECTION = "Routes";
rhit.FB_KEY_POINTA = "pointA";
rhit.FB_KEY_POINTB = "pointB";
rhit.FB_KEY_BUDDY_NAME = "buddyName";

let map;
rhit.hasRoute = "";

rhit.fbAuthManager = null;
rhit.fbUsersManager = null;
rhit.fbChatsManager = null;
rhit.fbForumManager = null;
rhit.fbSinglePostManager = null;
rhit.fbRoutesManager = null;
rhit.fbConfirmRoutePageManager = null;

// From https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ForumListController = class {
	constructor() {
		rhit.HandleDrawerButtons();

		document.querySelector("#submitForumPost").addEventListener("click", (event) => {
			const title = document.querySelector("#postTitle").value;
			const body = document.querySelector("#postBody").value;
			const author = rhit.fbAuthManager.uid;
			rhit.fbForumManager.add(title, body, author);
		});

		$("#addForum").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#postTitle").value = "";
			document.querySelector("#postBody").value = "";
		});
		$("#addForum").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#postTitle").focus();
		});

		rhit.fbForumManager.beginListening(this.updateList.bind(this));
	}

	updateList() {
		console.log("I need to update the list on the page!");
		console.log(`Num posts = ${rhit.fbForumManager.length}`);
		console.log("Example post = ", rhit.fbForumManager.getPostIndex(0));


		const newList = htmlToElement('<div id="forumListContainer"></div>');

		for (let i = 0; i < rhit.fbForumManager.length; i++) {
			const post = rhit.fbForumManager.getPostIndex(i);
			const newCard = this._createCard(post);
			newCard.onclick = (event) => {
				window.location.href = `/PostDetail.html?id=${post.id}`;
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#forumListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// Put in the new quoteListContainer
		oldList.parentElement.appendChild(newList);
	}

	_createCard(post) {
		return htmlToElement(`<div class="card mx-auto forumPost">
		<div class="card-body">
		  <h4 class="card-title">${post.title}</h4>
		  <p class="card-text">${post.body}</p>
		  <p class="card-author">By: ${post.author}</p>
		</div>
	  </div>`);
	}
}

rhit.Post = class {
	constructor(id, title, body, author) {
		this.id = id;
		this.title = title;
		this.body = body;
		this.author = author;
	}
}

rhit.FbForumManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_FORUM_COLLECTION);
		this._unsubscribe = null;
	}

	add(title, body, author) {
		// Add a new document with a generated id.
		this._ref.add({
			[rhit.FB_KEY_TITLE]: title,
			[rhit.FB_KEY_BODY]: body,
			[rhit.FB_KEY_AUTHOR]: author,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}

	beginListening(changeListener) {

		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("Post update!");
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getPostIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const post = new rhit.Post(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_TITLE),
			docSnapshot.get(rhit.FB_KEY_BODY),
			docSnapshot.get(rhit.FB_KEY_AUTHOR));
		return post;
	}
}

rhit.ForumDetailPageController = class {
	constructor() {

		document.querySelector("#submitEditPost").addEventListener("click", (event) => {
			const title = document.querySelector("#inputTitle").value;
			const body = document.querySelector("#inputBody").value;
			const author = rhit.fbAuthManager.uid;
			rhit.fbSinglePostManager.update(title, body, author);
		});

		$("#editPostDialog").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inputTitle").value = rhit.fbSinglePostManager.title;
			document.querySelector("#inputBody").value = rhit.fbSinglePostManager.body;
		});
		$("#editPostDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputTitle").focus();
		});

		document.querySelector("#submitDeletePost").addEventListener("click", event => {
			rhit.fbSinglePostManager.delete().then(() => {
				console.log("Document successfully deleted!");
				window.location.href = "/Buddy Forum.html";
			}).catch(error => console.error("Error removing document: ", error));
		});

		document.querySelector("#forumGoBackButton").addEventListener("click", event => {
			window.location.href = "/Buddy Forum.html";
		})

		rhit.fbSinglePostManager.beginListening(this.updateView.bind(this));
	}

	updateView() {
		document.querySelector("#cardTitle").innerHTML = rhit.fbSinglePostManager.title;
		document.querySelector("#cardBody").innerHTML = rhit.fbSinglePostManager.body;
		document.querySelector("#cardAuthor").innerHTML = rhit.fbSinglePostManager.author;
		if (rhit.fbSinglePostManager.author == rhit.fbAuthManager.uid) {
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
	}
}

rhit.FbSinglePostManager = class {
	constructor(postId) {
		rhit.HandleDrawerButtons();
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_FORUM_COLLECTION).doc(postId);
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
				//window.location.href = "/";
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	update(title, body, author) {
		this._ref.update({
			[rhit.FB_KEY_TITLE]: title,
			[rhit.FB_KEY_BODY]: body,
			[rhit.FB_KEY_AUTHOR]: author,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
			.then(() => {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				// The document probably doesn't exist.
				console.error("Error updating document: ", error);
			});
	}

	delete() {
		return this._ref.delete();
	}

	get title() {
		return this._documentSnapshot.get(rhit.FB_KEY_TITLE);
	}

	get body() {
		return this._documentSnapshot.get(rhit.FB_KEY_BODY);
	}

	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#loginButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};
	}
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB) {
	directionsService.route({
		origin: pointA,
		destination: pointB,
		travelMode: google.maps.TravelMode.WALKING
	}, function (response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
		} else {
			window.alert('Directions request failed due to ' + status);
		}
	});
}

rhit.HomePageController = class {
	constructor() {
		rhit.HandleDrawerButtons();
		document.querySelector("#findBuddyButton").onclick = (event) => {
			window.location.href = "/Find Buddy.html";
		};
		document.querySelector("#findRouteButton").onclick = (event) => {
			window.location.href = `/Find Route.html?uid=${rhit.fbAuthManager.uid}`;
		};
		document.querySelector("#chatButton").onclick = (event) => {
			window.location.href = `/Chat.html?uid=${rhit.fbAuthManager.uid}`;
		};
		document.querySelector("#forumButton").onclick = (event) => {
			window.location.href = "/Buddy Forum.html";
		};
	}
}

rhit.ChatPageController = class {
	constructor() {
		rhit.HandleDrawerButtons();
		rhit.fbChatsManager.beginListening(this.updateList.bind(this));
		this.lastMessage = "";
	}

	updateList() {
		const newList = htmlToElement('<div id="chatListContainer"></div>');
		for (let i = 0; i < rhit.fbChatsManager.length; i++) {
			const chat = rhit.fbChatsManager.getChatAtIndex(i);
			const newCard = this._createCard(chat);
			newCard.onclick = (event) => {
				window.location.href = `/Single Chat.html?id=${chat.index}`;
			}
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#chatListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

	_createCard(buddy) {
		return htmlToElement(`      
	<div id="contactCard" class="card">
		<div class="card-body">
		  <h5 class="card-title">Chat with ${buddy.buddyId}</h5>
		</div>
	</div>`);
	}

}

rhit.chat = class {
	constructor(index, buddyId) {
		this.index = index;
		this.buddyId = buddyId;
	}
}

rhit.FbChatsManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_CONTACTS_COLLECTION).doc(uid);
		this._unsubscribe = null;
	}

	add(contact) {
		this._ref.add({
			[rhit.FB_KEY_CONTACTLIST_ID]: this._uid,
			[rhit.FB_KEY_CONTACT]: contact
		})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});

	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((querySnapshot) => {
			console.log("Updating Contact list!");
			this._documentSnapshots = querySnapshot;
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getAtIndex(index) {
		const docSnapshot = new rhit.chat(this._documentSnapshots[index]);
		const chat = new rhit.chat(docSnapshot.get());
		return chat;
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
		let A = document.querySelector("#addressFrom").value;
		let B = document.querySelector("#addressTo").value;
		initMap(A, B);
		document.querySelector("#submit").onclick = (event) => {
			let A = document.querySelector("#addressFrom").value;
			let B = document.querySelector("#addressTo").value;
			initMap(A, B);
		}
		document.querySelector("#submitAddRoute").onclick = (event) => {
			let A = document.querySelector("#addressFrom").value;
			let B = document.querySelector("#addressTo").value;
			let bud = document.querySelector("#inputBuddyName").value;
			let uid = rhit.fbAuthManager.uid;
			rhit.fbRoutesManager.add(A, B, bud);
			rhit.hasRoute();
		}
	}
}

rhit.FbRoutesManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_ROUTES_COLLECTION);
		this._unsubscribe = null;
	}

	add(A, B, buddy) {
		this.hasRoute = true;
		this._ref.add({
			[rhit.FB_KEY_AUTHOR]: this._uid,
			[rhit.FB_KEY_POINTA]: A,
			[rhit.FB_KEY_POINTB]: B,
			[rhit.FB_KEY_BUDDY_NAME]: buddy,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now()
		});
	}

}

rhit.ConfirmedRoutePageController = class {
	constructor() {
		rhit.HandleDrawerButtons();
		rhit.fbConfirmRoutePageManager.beginListening(this.updateMap.bind(this));
	}

	updateMap() {
		document.querySelector("#buddyOutput").innerHTML = `
		<div id="outputSalutations">
		<h2 id="buddyOutput">You are walking with ${rhit.fbConfirmRoutePageManager.buddyName}!</h2>
		<h2 id="salutations">Stay safe and enjoy your trip!</h2>
		</div>`
		initMap(rhit.fbConfirmRoutePageManager.pointA, rhit.fbConfirmRoutePageManager.pointB);
	}
}

rhit.Post = class {
	constructor(pointA, pointB) {
		this.pointA = pointA;
		this.pointB = pointB;
	}
}

rhit.FbConfirmRoutePageManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_ROUTES_COLLECTION);
		this._unsubscribe = null;
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(30);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		})
	}

	get pointA() {
		const mostRecent = this._documentSnapshots[0];
		return mostRecent.get(rhit.FB_KEY_POINTA);
	}

	get pointB() {
		const mostRecent = this._documentSnapshots[0];
		return mostRecent.get(rhit.FB_KEY_POINTB);
	}

	get buddyName() {
		const mostRecent = this._documentSnapshots[0];
		return mostRecent.get(rhit.FB_KEY_BUDDY_NAME);
	}
}

function initMap(pointAGiven, pointBGiven) {
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 8,
		center: {
			lat: -34.397,
			lng: 150.644
		}
	});
	console.log(map);
	var directionsService = new google.maps.DirectionsService();

	var directionsDisplay = new google.maps.DirectionsRenderer({
		map: map
	});
	var geocoder = new google.maps.Geocoder();

	// var pointA, pointB;


	geocoder.geocode({
		'address': pointAGiven
	}, function (results, status) {
		if (status != "OK") return;
		var location = results[0].geometry.location;
		pointA = new google.maps.LatLng(location.lat(), location.lng());
		// alert(location.lat() + ',' + location.lng());
		var markerA = new google.maps.Marker({
			position: pointA,
			title: "point A",
			label: "A",
			map: map
		});
		geocoder.geocode({
			'address': pointBGiven
		}, function (results, status) {
			if (status != "OK") return;
			var location = results[0].geometry.location;
			pointB = new google.maps.LatLng(location.lat(), location.lng());
			// alert(location.lat() + ',' + location.lng());
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
	const urlParams = new URLSearchParams(window.location.search);
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
		const uid = urlParams.get("uid");
		rhit.fbChatsManager = new rhit.FbChatsManager(uid);
		new rhit.ChatPageController();
	}
	if (document.querySelector("#forumPage")) {
		console.log("You are on the forum page.");
		const uid = urlParams.get("uid");
		rhit.fbForumManager = new rhit.FbForumManager(uid);
		new rhit.ForumListController();
	}
	if (document.querySelector("#singlePostPage")) {
		console.log("You are on the detail page.");
		const postId = urlParams.get("id");
		if (!postId) {
			window.location.href = "/";
		}
		rhit.fbSinglePostManager = new rhit.FbSinglePostManager(postId);
		new rhit.ForumDetailPageController();
	}
	if (document.querySelector("#accountPage")) {
		console.log("You are on the profile page.");
		new rhit.AccountPageController();
	}
	if (document.querySelector("#findRoutePage")) {
		console.log("You are on the find route page.");
		const uid = urlParams.get("uid");
		rhit.fbRoutesManager = new rhit.FbRoutesManager(uid);
		new rhit.FindRoutePageController();
	}
	if (document.querySelector("#findBuddyPage")) {
		console.log("You are on the find buddy page.");
		new rhit.FindBuddyPageController();
	}
	if (document.querySelector("#routeConfirmedPage")) {
		console.log("You are on the confirmed route page.");
		const uid = urlParams.get("uid");
		rhit.fbConfirmRoutePageManager = new rhit.FbConfirmRoutePageManager(uid);
		new rhit.ConfirmedRoutePageController();
	}
}

rhit.hasRoute = function () {
	firebase.firestore().collection(rhit.FB_ROUTES_COLLECTION).get().then(snap => {
		let size = parseInt(snap.size);
		if (size > 0) {
			document.querySelector("#menuConfirmedRoute").onclick = (event) => {
				window.location.href = `/Confirmed Route.html?uid=${rhit.fbAuthManager.uid}`;
			}
		}
		if (size <= 0) {
			document.querySelector("#menuConfirmedRoute").onclick = (event) => {
				alert("Create a route first!");
			}
		}
	}
	);
}

rhit.HandleDrawerButtons = function () {
	rhit.hasRoute();
	document.querySelector("#menuFindBuddy").onclick = (event) => {
		window.location.href = "/Find Buddy.html";
	};
	document.querySelector("#menuFindRoute").onclick = (event) => {
		window.location.href = `/Find Route.html?uid=${rhit.fbAuthManager.uid}`;
	};
	document.querySelector("#menuGoToHomePage").onclick = (event) => {
		window.location.href = "/Homepage.html";
	};
	document.querySelector("#menuForum").onclick = (event) => {
		window.location.href = "/Buddy Forum.html";
	};
	document.querySelector("#menuChat").onclick = (event) => {
		window.location.href = `/Chat.html?uid=${rhit.fbAuthManager.uid}`;
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
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initializePage();
	});
};

rhit.main();
