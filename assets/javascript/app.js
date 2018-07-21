$("#LogSignButton").click(function(){
  $("#formDiv").slideToggle();
});

$(document).on('click', '#signUp', function(){
  var showInId='#formDiv';
  //var oldDiv = $(showInId).html();
  $(showInId).load('signup.html #signup-div', function() {
    $('#LogSignButton').prop('disabled', true);  
  });

  $(document).on('click', '#signup-submit-btn', function() {
    event.preventDefault();

    var email = $('#signup-email-input').val().trim();
    var password = $('#signup-password-input').val().trim();
    handleSignUp(email, password);

    // clean up
    cleanup();
  });

  $(document).on('click', '#signup-cancel-btn', function() {
    event.preventDefault();
    // clean up
    cleanup();
  });

  function cleanup() {
    $(document).off('click', '#signup-submit-btn');
    $(document).off('click', '#signup-cancel-btn');
    $(showInId).slideToggle();
    $(showInId).html(whattoeat.originalLoginPage);
    $('#LogSignButton').prop('disabled', false);  
  }
});

// global custom object
var whattoeat = {};
var getPositionPromise = getPosition()
.then( function(result)  {
  console.log('getPositionPromise')
  whattoeat.pos = result.pos;
  whattoeat.location = result.location;
  return;
})
.catch( function(error) {
  console.log( error )
})
// save original login form to global object
whattoeat.originalLoginPage = $('#formDiv').html();
// save original frontpage div to global object
whattoeat.originalFrontPage = $('#frontPage').html();


// Initialize Firebase
var config = {
  apiKey: "AIzaSyCnwIO592-rycWYdGWttYt_Vcyzp_LJa14",
  authDomain: "what-do-you-wanna-eat-e411d.firebaseapp.com",
  databaseURL: "https://what-do-you-wanna-eat-e411d.firebaseio.com",
  projectId: "what-do-you-wanna-eat-e411d",
  storageBucket: "what-do-you-wanna-eat-e411d.appspot.com",
  messagingSenderId: "210098460449"
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
      var uid = user.uid;
      // [START_EXCLUDE]
      $('#LogSignButton').hide();
      $('#LogOutButton').show();
      if ( $('#formDiv').css('display') !== 'none' ) {
        $("#formDiv").slideToggle();
      }

      getUserProfile(uid).then( function(profile){
        console.log('getUserProfile 1st then:', profile);
        return (!profile) ? showInputForm(uid) : profile;
      }).then( function(profile){
        console.log('getUserProfile 2nd then:', profile);
        whattoeat.profile = profile;
        showDecidePage();
      });

      //$('#frontPage').load('decidepage.html #decidePage');
      //initMap();
      // [END_EXCLUDE]
    } else {
      // User is signed out.
      // [START_EXCLUDE]
      $('#LogSignButton').show();
      $('#LogOutButton').hide();

      if ( $('#formDiv').css('display') !== 'none' ) {
        $("#formDiv").slideToggle();
      }
      // restore original login form from global object
      $('#formDiv').html(whattoeat.originalLoginPage);
      // restore original frontpage div from global object
      $('#frontPage').html(whattoeat.originalFrontPage);
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
 * Handles the sign-in button press.
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
  return new Promise(function(resolve, reject) {
    var showInId = '#frontPage';
    //var oldDiv = $(showInId).html();
    $(showInId).load('input.html #input-div');
  
    $(document).on('click', '#input-submit-btn', function() {
      event.preventDefault();
      
      var foodsArray = [];
      $(".meats:checked").each(function() {
          foodsArray.push($(this).val());
      });
      $(".veg:checked").each(function() {
          foodsArray.push($(this).val());
      });

      var restrictionsArray = [];
      $(".restrictions:checked").each(function() {
          restrictionsArray.push($(this).val());
      });
      
      firebase.database().ref('/users/' + userId).set({restrictions: restrictionsArray,foods: foodsArray})
      //clean up
      $(document).off('click', '#input-submit-btn');
      //$(showInId).html(oldDiv);
      resolve({restrictions: restrictionsArray,foods: foodsArray})
    });  
  })
}

function showDecidePage() {
  var showInId = '#frontPage';
  var oldDiv = $(showInId).html();

  getPositionPromise.then( function() {
    $('#location').val(whattoeat.location);
  });

  $(showInId).load('decidepage.html #decidePage', function(){
    console.log('whattoeat.location',whattoeat.location)
    $('#location').val(whattoeat.location);
    var input = document.getElementById('location')
    var autocomplete = new google.maps.places.Autocomplete(input);
    // Set the data fields to return when the user selects a place.
    autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);

    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }
    });
  });  

  $(document).on('click', '#search', function() {
    event.preventDefault();
    var food = $('#food').val().trim();
    var location = $('#location').val().trim();

    if (!location){
      //if not, then border the address form red
      $('#location').css('border', '2px solid red');
      return false; // short circuit
    }

    //clean up
    $(document).off('click', '#search');
    $(showInId).html(oldDiv);
    //show next
    showPick(food, location, whattoeat.pos);
  });  
  $(document).on('click', '#randomButton', function(){
    event.preventDefault();
    var location = $('#location').val().trim();
    var randomFood = whattoeat.profile.foods[Math.floor(Math.random() * whattoeat.profile.foods.length)];

    if (!location){
      //if not, then border the address form red
      $('#location').css('border', '2px solid red');
      return false; // short circuit
    }
    $(showInId).html(oldDiv);
    //show next
    showPick(randomFood, location, whattoeat.pos);
  });
}


function showPick(food, location) {
  var showInId = '#frontPage';
  var oldDiv = $(showInId).html();
  
  $(showInId).load('pick.html #pickPage', function(){
    $('#currAddress').text(location);
    $('#foodPick').text("How about this " + food.toLowerCase() + " restaurant or recipe?");
    searchYelp( food, location, 10 );
    searchEdemam( food, 10 );  
    $('#pickInfo').append( $('<button id="pick-change-btn">').text('change') )
  });

  $(document).on('click', '#pick-change-btn', function() {
    event.preventDefault();
    //clean up
    $(document).off('click', '#pick-change-btn');
    $(showInId).html(oldDiv);
    //show next
    showDecidePage();
  });

}

function getPosition(settings) {
  return new Promise(function(resolve, reject) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // On Success
        function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          var geocoder = new google.maps.Geocoder;
          var point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          geocoder.geocode({'latLng': point}, function (locations, status) {
            var location = (status == "OK") ? locations[0].formatted_address : null;
            resolve({pos,location});
          });  
        },
        // On Error
        function(error) {
          reject(error);
        },
        settings
      );  
    } else {
      reject("Browser doesn't support Geolocation");
    }
  });
}

function getLocation(pos) {
  var googleKey = 'AIzaSyCIWbtgXbcI90D2ADfqPjRK5n1HyBFrLy8';
  var endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
  var latlng = pos.lat + ',' + pos.lng;
  var param = $.param({
    latlng: latlng,
    key: googleKey,
  })

  return $.ajax({
    url: endpoint + '?' + param,
  })
  .then(function(res){
    console.log(res);
    return (res.status == "OK") ? res.results[0].formatted_address : null;
  })
}

// function initMap() {

//   // Try HTML5 geolocation.
//   var pos;
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//       pos = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude
//       };

//       getAddress(pos);

//     }, function() {
//       //handleLocationError(true, infoWindow, map.getCenter());
//     });
//   } else {
//     // Browser doesn't support Geolocation
//     //handleLocationError(false, infoWindow, map.getCenter());
//   }

//   $(document).on('click', '#search', function() { 
//     event.preventDefault();
//     console.log( pos );

//     var userAddress = $('#location').val().trim();
//     var food = $('#food').val().trim();

//     // if address is inputted then run the search functions
//     if ($('#location').val() != "") {
//       searchYelp( pos, food );
//       searchEdemam( food );

//       $('#decidePage').load('pick.html #pickPage', function(){
//         $('#currAddress').text(userAddress);
//         $('#foodPick').text("You chose " + food);
//       });
//     } else {
//       //if not, then border the address form red
//       $('#location').css('border', '2px solid red');
//     }
//   });
// }

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
      $('#location').val( res.results[0].formatted_address );
      $('#location').css('border', "");
    }

  })
}

function searchYelp(food, location, count=1) {
  var rapid = new RapidAPI("hungryteam_5b4654e7e4b004833ec2655e", "da70f8e1-fd7f-4da4-b6be-2add1e8c39d8");
  
  rapid.call('YelpAPI', 'getBusinesses', { 
    'accessToken': 'sDKQbunPU1KnzeMLrV_TTqdY_RczqfSV1CiZC5XSqZsUr_dariJ7gaNSBnUjwmqkVEQmXGlmfvwSbYVoyXhVidzv_HzRO35udGwP1A3TBbGNWw1S0A758BtO89pGW3Yx',
    // 'latitude': pos.lat,
    // 'longitude': pos.lng,
    'location': location,
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
        var yelpURL = val.url;

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

        var yelpDiv = $('<div>').addClass('yelpDiv');
        var yelpImg = $('<div>').addClass('yelpImg');
        var yelpInfo = $('<div>').addClass('yelpInfo');
        var yesNoDiv = $('<div>').addClass('yesNoButtons');
        var yes = $('<button>').addClass('yelpYes').attr("data-url", yelpURL).html('<i class="fas fa-check"></i>');
        var no = $('<button>').addClass('yelpNo').html('<i class="fas fa-times"></i>');

        //$('#yelpYes').attr("data-url", yelpURL);
        yelpImg.append( $img );
        yelpInfo.append( $h2 , $address1, $address2, $phone, $price, $categories, $rating );
        yesNoDiv.append( yes, no );
        yelpDiv.append( yelpImg, yelpInfo, yesNoDiv );
        $('.col1').append(yelpDiv);
      }

    }
  }).on('error', function (res) {
    /*YOUR CODE GOES HERE*/ 
    console.log(res);
  });
}

function searchEdemam(food, count=1) {
  var appId = '94109746';
  var appKey = '987f9b2768860ef9a7e37737bb3ced9f';

  var endPoint = 'https://api.edamam.com/search';
  var param = $.param({
    q: food,
    to: count,
    app_id: appId,
    app_key: appKey,
    health: whattoeat.profile.restrictions
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
      var recipeURL = val.recipe.url;
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
      $h3.text("Ingredients: ");

      for (var i=0; i<val.recipe.ingredientLines.length; i++){
        
        $ingDiv.append(val.recipe.ingredientLines[i] + "<br />");
      }

      var $h2 = $('<h2>').text( label );
      var $cal = $('<p>').text( "Calories(g): " + cal );
      var $fat = $('<p>').text( "Fat (g): " + fat );
      var $carbs = $('<p>').text( "Carbs (g): " + carbs );
      var $protein = $('<p>').text( "Protein (g): " + protein );

      var edDiv = $('<div>').addClass('edDiv');
      var edImg = $('<div>').addClass('edImg');
      var edInfo = $('<div>').addClass('edInfo');
      var yesNoDiv = $('<div>').addClass('yesNoButtons');
      var yes = $('<button>').addClass('edYes').attr("data-url", recipeURL).html('<i class="fas fa-check"></i>');
      var no = $('<button>').addClass('edNo').html('<i class="fas fa-times"></i>');


      //$('#edYes').attr("data-url", recipeURL);
      edImg.append( $img );
      edInfo.append( $h2, $cal, $fat, $carbs, $protein, $h3, $ingDiv );
      yesNoDiv.append( yes, no );
      edDiv.append( edImg, edInfo, yesNoDiv );
      $('.col2').append(edDiv);

    }

  });  
}


$(document).on('click', '.yelpYes', function(){
  window.open($(this).attr("data-url"));
})

$(document).on('click', '.yelpNo', function(){
  console.log('yelp no -->>', this);
  $(this).parent().parent().remove();
})

$(document).on('click', '.edYes', function(){
  window.open($(this).attr("data-url"));
})

$(document).on('click', '.edNo', function(){
  console.log('ed no -->>', this);
  $(this).parent().parent().remove();
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
