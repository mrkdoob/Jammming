import React, { Component } from 'react';
import './TrackList.css';
import Track from '../Track/Track.js'


class TrackList extends Component {
  mapTrack() {
    this.props.searchResults.map()
  }

  render() {
    let tracks = this.props.tracks ? this.props.tracks : []; //in case of undefined object

    return (
      <div className="TrackList">
        {tracks.map(track => {
          return <Track track={track} key={track.id} onAdd={this.props.onAdd} onRemove={this.props.onRemove} />
        })}
      </div>
    );
  }
}

export default TrackList;
