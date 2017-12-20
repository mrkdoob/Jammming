const clientId = '844f0265b60c4502b9eed033faf526bc'
const redirectUri = 'http://localhost:3000'

let accessToken;

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
        const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public%20playlist-modify-private&redirect_uri=${redirectUri}`;
        window.location = accessUrl;
        return this.getAccessToken();
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

    savePlaylist(name, uriArray){
      if(name === '' || uriArray.length === 0){ //check if arguments have value
        console.log('no playlist name or empty playlist array');
        return;
      }

      let userID;
      let playlistID;
      const accessToken = Spotify.getAccessToken();
      const headers = { Authorization: `Bearer ${accessToken}`}

      return fetch('https://api.spotify.com/v1/me', {headers:headers}
      ).then(response => response.json()
      ).then(jsonResponse => {
        if (!jsonResponse.id){
          console.log('No user ID');
          return;
        }
        userID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({name: name})
        })
        .then(response => {
          return response.json();
        })
        .then(jsonResponse => {
          if (!jsonResponse.id){
            console.log('No playlistID');
            return;
          }
        playlistID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({uris: uriArray})
        })
    });
  })
}
}

export default Spotify;
