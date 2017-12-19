const clientId = '844f0265b60c4502b9eed033faf526bc'
//const clientSecret = 'V0fZJ1dogss8z50HyEgLuM91rQ9fvRe839phhi3BH3o4FZC5QmAQEg1vao6YGlgx'
const corsUrl = 'https://cors-anywhere.herokuapp.com/'
const redirectUri = 'http://mrkdoob.surge.sh'

const grantType = 'client_credentials';
let accessToken;

const Spotify = {
    getAccessToken (){
      if(accessToken){
        console.log('has access token');
        return new Promise(resolve => resolve(accessToken));
      }
      let url = 'https://accounts.spotify.com/authorize?client_id=' + clientId + '&response_type=token&scope=playlist-modify-public&redirect_uri=' + redirectUri;
      console.log(url);
      return fetch(corsUrl+url, {
        method: 'GET'
      })
      .then(response => {
        if (response.ok){
          window.location.href = url;
          console.log('window match:' + window.location.href.match('/access_token=([^&]*)/'));
          if(window.location.href.match('/access_token=([^&]*)/') && window.location.href.match('/expires_in=([^&]*)/')){
            console.log('komt hier');
            accessToken = window.location.href.match('/access_token=([^&]*)/');
            let expiresIn = window.location.href.match('/expires_in=([^&]*)/');

            window.setTimeout(() => accessToken = '', expiresIn * 1000); //Controleren
            window.history.pushState('Access Token', null, '/');
          }
        }
        return; //else
      })
    },

    search (term){
      let searchUrl = 'https://api.spotify.com/v1/search?type=track&q=' + term;
      return Spotify.getAccessToken().then(() => {
        return fetch(corsUrl+searchUrl, {
          method: 'GET',
          headers: {Authorization: `Bearer ${accessToken}`}
        })
        .then(response => {
          console.log('search response');
          if (response.ok) {
            console.log('RESPONSE OK');
            return response.json();
          }
        })
      })
      .then(jsonResponse => {
        console.log('komt in jsonresponse');
        if (jsonResponse.tracks){
          console.log('KOMT IN JSONRESPONSE');
          return jsonResponse.tracks.map(track => {
            return {
              id: track.id,
              name: track.name,
              artist: track.artists[0].name,
              album: track.album.name,
              uri: track.uri
            }
          });
        }
        console.log('RETURN []');
        return [];
      });
    },

    savePlaylist(playlist, uriArray){
      if(playlist === '' || uriArray.length === 0){ //check if arguments have value
        return;
      }

      let userID;

      return this.getAccessToken().then(() => { //retrieve userID
        return fetch(corsUrl+'https://api.spotify.com/v1/me', {
          method: 'GET',
          headers: {Authorization: `Bearer ${accessToken}`}
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
        })
      })
      .then(jsonResponse => {
        if (jsonResponse.id){
          userID = jsonResponse.id;
        }
      });

    return this.getAccessToken().then(() => { //Get playlistID
      return fetch(corsUrl+ 'https://api.spotify.com/v1/users/' + userID + '/playlists', {
        method: 'POST',
        headers: {Authorization: `Bearer ${accessToken}`},
        //Content-Type: {'application/json'},
        body: {name: playlist}
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      })
    })
    .then(jsonResponse => {
      if (jsonResponse.id){
        console.log('playlistID:'+jsonResponse);
        let playlistID = jsonResponse.id;
      }
    });

    return this.getAccessToken().then(() => {
      return fetch(corsUrl+ 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + this.playlistID + '/tracks', {
        method: 'POST',
        headers: {Authorization: `Bearer ${accessToken}`},
        //Content-Type: 'application/json'},
        body: {uris: uriArray}
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      })
    })
    .then(jsonResponse => {
      if (jsonResponse.id){
        console.log('playlistID:'+jsonResponse);
        let playlistID = jsonResponse.id;
      }
    });
  }
}

export default Spotify;
