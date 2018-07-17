$("#LogSignButton").click(function(){
  $("#formDiv").slideToggle();
});

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
      $h3.text("Ingredients: ");

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
