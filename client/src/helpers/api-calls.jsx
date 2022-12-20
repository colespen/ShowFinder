// fetch city name using coords
  // useEffect(() => {
  //   const xhr = new XMLHttpRequest();
  //   if (geolocation.loaded) {
  //     xhr.open('GET',
  //       `https://us1.locationiq.com/v1/reverse.php?key=${iqToken}&lat=`
  //       + lat + "&lon=" + lng + "&format=json", true);
  //     xhr.send();
  //     xhr.onreadystatechange = processRequest;
  //     xhr.addEventListener("readystatechange", processRequest, false);
  //   }
  //   function processRequest(e) {
  //     if (xhr.readyState === 4 && xhr.status === 200) {
  //       const response = JSON.parse(xhr.responseText);
  //       const city = response.address.city;
  //       setCurrCity(city);
  //     }
  //   }
  // }, [lat, lng, geolocation.loaded]);

  // fetch HQ show data with params
  // useEffect(() => {
  //   const options = {
  //     method: 'GET',
  //     baseURL: 'https://api.predicthq.com/v1/events/',
  //     params: {
  //       'relevance': 'start_around,location_around',
  //       'start_around.origin': date,
  //       'location_around.origin': lat + "," + lng,
  //       'location_around.offset': '1km',
  //       // 'location_around.scale': '5km',
  //       'active.gte': date,
  //       'category': 'concerts'
  //     },
  //     headers: {
  //       authorization: `Bearer ${hqToken}`
  //     }
  //   };
  //   if (geolocation.loaded) axios.request(options)
  //     .then(res => {
  //       setShows(res.data);
  //       console.log("res.data~~~~~~~~~: ", res.data);
  //     })
  //     .catch(err => {
  //       console.error(err.message);
  //     });
  // }, [geolocation, date, lat, lng]);

  // results OR empty array seems wrong but need to not map on undefined axios get
  // const showMarkers = (shows.results || []).map(show => (
  //   show.entities.map(venue => (

  //     <Marker
  //       key={show.id}
  //       position={[show.location[1], show.location[0]]}>
  //       <Popup key={venue.entity_id}>
  //         {show.title} <br /> {venue.name}
  //       </Popup>
  //     </Marker>
  //   ))
  // ));

  // fetch Rapid show
  // useEffect(() => {
  //   const options = {
  //     method: 'GET',
  //     baseURL: 'https://concerts-artists-events-tracker.p.rapidapi.com/location',
  //     params: {
  //       'name': currCity,
  //       'minDate': date,
  //       'maxDate': date
  //     },
  //     headers: {
  //       'X-RapidAPI-Key': rapidKey,
  //       'X-RapidAPI-Host': 'concerts-artists-events-tracker.p.rapidapi.com'
  //     }
  //   };
  //   if (geolocation.loaded) axios.request(options)
  //     .then(res => {
  //       setNewShows(res.data);
  //       console.log("res.data~~~~~~~~~: ", res.data);
  //     })
  //     .catch(err => {
  //       console.error(err.message);
  //     });
  // }, [geolocation, date, currCity]);