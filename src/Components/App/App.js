import React, { Component } from 'react';
import './App.css';
import Playlist from '../Playlist/Playlist.js'
import SearchBar from '../SearchBar/SearchBar.js'
import SearchResults from '../SearchResults/SearchResults.js'
import Spotify from '../../util/Spotify.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: []
    }
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(trackId){
    if (typeof trackId === "undefined") {
      return; //exit
    }
    let inList = false;
    this.state.playlistTracks.map(itemFromList => { //Nog even iteratie controleren
      if(trackId === itemFromList.id){ //track.id?
        inList = true;
      };
    });
    if (!inList) {
      let trackObject = {
        uri: trackId.uri,
        id: trackId.id,
        name: trackId.name,
        artist: trackId.artist,
        album: trackId.album
      }
      let playlistTracksArray = this.state.playlistTracks;
      playlistTracksArray.push(trackObject);
      this.setState({
        playlistTracks: playlistTracksArray
      })
    }
  }

  removeTrack(track){
    this.state.playlistTracks.map(trackFromList => {
      if(track.id === trackFromList.id){
        let trackArray = this.state.playlistTracks;
        trackArray.pop(trackFromList);
        this.setState({
          playlistTracks: trackArray
        });
      }
    })
  }

  savePlaylist(){
    let trackURIs = [];
    this.state.playlistTracks.map(tracks => {
      trackURIs.push(tracks.uri);
    })

    Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.updatePlaylistName('New Playlist');
    this.setState({searchResults: []}) //reset results to empty array
  }

  updatePlaylistName(name){
    this.setState({playlistName: name});
  }

  search(search){
    Spotify.search(search).then(tracks => {
      this.setState({searchResults: tracks});
    })
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist onSave={this.savePlaylist} onNameChange={this.updatePlaylistName} onRemove={this.removeTrack} playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
