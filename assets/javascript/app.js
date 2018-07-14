function initMap() {
  var map, infoWindow;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0},
    zoom: 16
  });
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
      map.setCenter(pos);
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