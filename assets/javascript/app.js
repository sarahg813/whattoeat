$("#LogSignButton").click(function(){
  $("#formDiv").slideToggle();
});

$(document).on('click', "#signUp", function(){
  var showInId='#formDiv';
  var oldDiv = $(showInId).html();
  $(showInId).load('signup.html #signup-div');

  $(document).on('click', '#signup-submit-btn', function() {
    var email = $('#signup-email-input').val().trim();
    var password = $('#signup-password-input').val().trim();
    handleSignUp(email, password);

    // clean up
    $(document).off('click', '#signup-submit-btn');
    $(showInId).slideToggle();
    $(showInId).html(oldDiv);
  });
});


// Initialize Firebase
var config = {
  apiKey: "AIzaSyDw9RAL-92BRIfkIz6A_B4e269AxQCQtZ8",
  authDomain: "dbwritetest.firebaseapp.com",
  databaseURL: "https://dbwritetest.firebaseio.com",
  projectId: "dbwritetest",
  storageBucket: "dbwritetest.appspot.com",
  messagingSenderId: "890074454165"
};

firebase.initializeApp(config);
// End_Initialize Firebase

initApp(); // Start using firebase.auth();

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    // [START_EXCLUDE silent]
    console.log('firebase.auth().onAuthStateChanged');
    // [END_EXCLUDE]
    if (user) {
      // User is signed in.
      console.log(' User is signed in.');
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      // [START_EXCLUDE]
      if (!emailVerified) {
      }
      $('#LogSignButton').hide();
      $('#LogOutButton').show();
      if ( $('#formDiv').css('display') !== 'none' )
        $("#formDiv").slideToggle();

      getUserProfile(uid)
        .then( function(profile){
          console.log(profile);
          if (profile) {
            // profile exist
            console.log('profile exist');
          } else {
            // no profile
            console.log('no profile');
            showInputForm(uid);
          }
        });


      // [END_EXCLUDE]
    } else {
      // User is signed out.
      // [START_EXCLUDE]
      $('#LogSignButton').show();
      $('#LogOutButton').hide();
      // [END_EXCLUDE]
    }
    // [START_EXCLUDE silent]
    $('#logInButton').prop('disabled', false); //.disabled = false;
    // [END_EXCLUDE]
  });
  // [END authstatelistener]

  $(document).on('click', '#logInButton', toggleSignIn);
  $(document).on('click', '#LogOutButton', toggleSignIn);
  //$('#quickstart-sign-up').on('click', handleSignUp);
  //$('#quickstart-verify-email').on('click', sendEmailVerification);
  //$('#quickstart-password-reset').on('click', sendPasswordReset);
}
/**
 * Handles the sign in button press.
 */
function toggleSignIn() {
  if (firebase.auth().currentUser) {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
  } else {
    var email = $('#username-input').val().trim();
    var password = $('#password-input').val().trim();
    if (email.length < 4) {
      alert('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      $('#logInButton').prop('disabled', false); //.disabled = false;
      // [END_EXCLUDE]
    });
    // [END authwithemail]
  }
  $('#logInButton').prop('disabled', true); //.disabled = true;
}
/**
 * Handles the sign up button press.
 */
function handleSignUp(email, password) {
  if (email.length < 4) {
    alert('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    alert('Please enter a password.');
    return;
  }
  // Sign in with email and pass.
  // [START createwithemail]
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END createwithemail]
}

function getUserProfile(userId) {
  return firebase.database().ref('/users/' + userId).once('value').then(function(snap) { // returns {name:kit}
  // firebase.database().ref().child('users').child(userid).once('value').then(function(snap) { // returns {name:kit}
  // return firebase.database().ref('users').orderByKey().equalTo(userid).once('value').then(function(snap) { // return S3d33zBQZiWjZ944rYAJnc9zamY2: {name: "Kit"}
    //console.log( snap.val() );
    return snap.val();
  });
}

function showInputForm(userId){
  var showInId = '#frontPage';
  var oldDiv = $(showInId).html();
  $(showInId).load('input.html #input-div');

  $(document).on('click', '#input-submit-btn', function() {
    event.preventDefault();
    
    var restrictionsArray = [];
    $(".restricitons:checked").each(function() {
        restrictionsArray.push($(this).val());
    });

    firebase.database().ref('/users/' + userId).set({
      restrictions: restrictionsArray
    })
    //clean up
    $(document).off('click', '#input-submit-btn');
    $(showInId).html(oldDiv);
  });
}

function initMap() {
  // var map, infoWindow;
  // map = new google.maps.Map(document.getElementById('map'), {
  //   center: {lat: 0, lng: 0},
  //   zoom: 16
  // });
  //infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  var pos;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //infoWindow.setPosition(pos);
      //infoWindow.setContent('Location found.');
      //infoWindow.open(map);
      // map.setCenter(pos);
      getAddress(pos);
    }, function() {
      //handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    //handleLocationError(false, infoWindow, map.getCenter());
  }

  $(document).on('click', '#search', function() { 
    event.preventDefault();
    console.log( pos );

    var food = $('#food').val().trim();
    searchYelp( pos, food );
    searchEdemam( food );
  });
}

function getAddress(pos) {
  var googleKey = 'AIzaSyCIWbtgXbcI90D2ADfqPjRK5n1HyBFrLy8';
  var endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
  var latlng = pos.lat + ',' + pos.lng;
  var param = $.param({
    latlng: latlng,
    key: googleKey,
  })

  $.ajax({
    url: endpoint + '?' + param,
  })
  .then( function(res){
    // console.log(res);
    var status = res.status;
    if (status == "OK") {
      $('#location').val( res.results[0].formatted_address )
    }

  })
}

function searchYelp(pos, food, count=2) {
  var rapid = new RapidAPI("hungryteam_5b4654e7e4b004833ec2655e", "da70f8e1-fd7f-4da4-b6be-2add1e8c39d8");
  
  rapid.call('YelpAPI', 'getBusinesses', { 
    'accessToken': 'sDKQbunPU1KnzeMLrV_TTqdY_RczqfSV1CiZC5XSqZsUr_dariJ7gaNSBnUjwmqkVEQmXGlmfvwSbYVoyXhVidzv_HzRO35udGwP1A3TBbGNWw1S0A758BtO89pGW3Yx',
    'latitude': pos.lat,
    'longitude': pos.lng,
    'term': food,
    'open_now': true,
    'limit': count

  }).on('success', function (res) {
    /*YOUR CODE GOES HERE*/ 
    console.log(res);

    if (res.total > 0) {
      //var val = res.businesses[0];
      for( var val of res.businesses ) {
        var imgURL = val.image_url;
        var name = val.name;
        var address1 = val.location.display_address[0];
        var address2 = val.location.display_address[1];
        var phone = val.display_phone;
        var price = val.price;
        var rating = val.rating;
        var yelpUrl = val.url;

        var categoriesArr = [];
        for (var i in val.categories) {
          categoriesArr.push(val.categories[i].title);
        }

        var $img = $('<img>').attr({
          alt: name,
          src: imgURL,
          width: '200px'
        });

        var $h2 = $('<h2>').text( name );
        var $address1 = $('<p>').text ( address1 );
        var $address2 = $('<p>').text ( address2 );
        var $phone = $('<p>').text ( phone );
        var $price = $('<span>').text( price );
        var $categories = $('<span>').text( " - " + categoriesArr.join(", ") );
        var $rating = $('<p>').text( rating + "/5 stars");
      
        var $yesBtn = $('<button>').html('<i class="fas fa-check"></i>').addClass('yes');
        var $noBtn = $('<button>').html('<i class="fas fa-times"></i>').addClass('no');

        var $imgDiv = $('<div>').addClass('yelpImg');
        var $infoDiv = $('<div>').addClass('yelpInfo');
        var $div = $('<div>').addClass('yelp-div');

        $('#yelpImg').append( $img );
        $('#yelpInfo').append( $h2 , $address1, $address2, $phone, $price, $categories, $rating );

      }

    }
  }).on('error', function (res) {
    /*YOUR CODE GOES HERE*/ 
    console.log(res);
  });
}

function searchEdemam(food, count=2) {
  var appId = '94109746';
  var appKey = '987f9b2768860ef9a7e37737bb3ced9f';

  var endPoint = 'https://api.edamam.com/search';
  var param = $.param({
    q: food,
    to: count,
    app_id: appId,
    app_key: appKey
  });

  $.ajax({
    url: endPoint + '?' + param,
  })
  .then(function(res){
    console.log(res);
    //var val = res.hits[0];
    for( var val of res.hits ) {
      var imgURL = val.recipe.image;
      var label = val.recipe.label;
      var cal = Math.floor(val.recipe.calories);
      var fat = Math.floor(val.recipe.digest[0].total);
      var carbs = Math.floor(val.recipe.digest[1].total);
      var protein = Math.floor(val.recipe.digest[2].total);
     
  
      var $img = $('<img>').attr({
        alt: label,
        src: imgURL,
        width: '200px'
      });

      
      var $ingDiv = $('<div>');
      var $h3 = $('<h3>');
      $h3.text(val.recipe.ingredientLines.length + "Ingredients: ");

      for (var i=0; i<val.recipe.ingredientLines.length; i++){
        
        $ingDiv.append(val.recipe.ingredientLines[i] + "<br />");
      }

      var $h2 = $('<h2>').text( label );
      var $cal = $('<p>').text( "Calories(g): " + cal );
      var $fat = $('<p>').text( "Fat (g): " + fat );
      var $carbs = $('<p>').text( "Carbs (g): " + carbs );
      var $protein = $('<p>').text( "Protein (g): " + protein );

      $('#edImg').append( $img );
      $('#edInfo').append( $h2, $cal, $fat, $carbs, $protein, $h3, $ingDiv );

    }

  });  
}


$(document).on('click', '.yelp-div .yes', function(){
  console.log('yelp yes');
})

$(document).on('click', '.yelp-div .no', function(){
  console.log('yelp no -->>', this);
  $(this).parent().remove();
})
$(document).on('click', '.edamam-div .yes', function(){
  console.log('yelp yes');
})

$(document).on('click', '.edamam-div .no', function(){
  console.log('yelp no -->>', this);
  $(this).parent().remove();
})

$( document ).on('click', '#test-btn', function(){
  console.log('hello world');
  searchEdemam('steak', 1);
  searchYelp({lat: 37.7911558, lng: -122.39433290000001}, 'steak', 1);
})

// var slideIndex = 1;
// showDivs(slideIndex, "slides");

// function plusDivs(n) {
//   showDivs(slideIndex += n);
// }

// function showDivs(n) {
//   var i;
//   var x = document.getElementsByClassName("slides");
//   if (n > x.length) {slideIndex = 1}    
//   if (n < 1) {slideIndex = x.length}
//   for (i = 0; i < x.length; i++) {
//      x[i].style.display = "none";  
//   }
//   x[slideIndex-1].style.display = "block";  
// }
