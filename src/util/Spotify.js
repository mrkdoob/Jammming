const clientId = ''
const corsUrl = 'https://cors-anywhere.herokuapp.com/'
const redirectUri = 'http://localhost:3000'

const grantType = 'client_credentials';
let accessToken;
let url = 'https://accounts.spotify.com/authorize?client_id=' + clientId + '&response_type=token&scope=playlist-modify-public&redirect_uri=' + redirectUri;

const Spotify = {
      getAccessToken() {
      if (accessToken) {
        return accessToken;
      }

      const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
      const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

      if (accessTokenMatch && expiresInMatch) {
        accessToken = accessTokenMatch[1];
        const expiresIn = Number(expiresInMatch[1]);
        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/'); // This clears the parameters, allowing us to grab a new access token when it expires.
        return accessToken;
      } else {
        const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
        window.location = accessUrl;
      }
    },

    search(term) {
      const accessToken = Spotify.getAccessToken();
      return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then(response => {
        return response.json();
      }).then(jsonResponse => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }));
      });
    },

    savePlaylist(playlist, uriArray){
      if(playlist === '' || uriArray.length === 0){ //check if arguments have value
        console.log('no playlist name or empty playlist array');
        return;
      }

      let userID;
      let playlistID;
      const accessToken = Spotify.getAccessToken();

      fetch(corsUrl+'https://api.spotify.com/v1/me', {  //retrieve userID
          method: 'GET',
          headers: {Authorization: `Bearer ${accessToken}`}
        })
        .then(response => { //code never reached
          console.log('first response');
          return response.json();
        })
      .then(jsonResponse => {
        if (!jsonResponse.id){
          console.log('No user ID');
          return;
        }
        userID = jsonResponse.id;
        console.log('user id:' + userID);
      });

      console.log('reaches second POST');
      console.log('user id at second POST:' + userID);

      fetch(corsUrl+ 'https://api.spotify.com/v1/users/' + this.userID + '/playlists', { //Get playlistID
        method: 'POST',
        headers: {Authorization: `Bearer ${accessToken}`},
        //Content-Type: {'application/json'},
        body: {name: playlist}
      })
      .then(response => {
        console.log('second response reached');
        return response.json();
      })
    .then(jsonResponse => {
      console.log('2nd json response reached');
      if (!jsonResponse.id){
        console.log('No playlistID');
        return;
      }

      playlistID = jsonResponse.id;
      console.log('playlistID jsonresponse: ' +playlistID);
    });

    console.log('reaches third post');

    return fetch(corsUrl+ 'https://api.spotify.com/v1/users/' + this.userID + '/playlists/' + this.playlistID + '/tracks', {
        method: 'POST',
        headers: {Authorization: `Bearer ${accessToken}`},
        //Content-Type: 'application/json'},
        body: {uris: uriArray}
      })
      .then(response => {
        console.log('Third response:' + response.json());
        return response.json();
      })
    .then(jsonResponse => {
      console.log('3rd json response reached');
      if (!jsonResponse.id){
        console.log('no playlistid 2');
        return;
      }
      let newPlaylistID = jsonResponse.id;
      console.log('playlistID:'+newPlaylistID);
    });
  }
}

export default Spotify;
