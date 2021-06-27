import { ItunesProperties } from 'node-itunes-search';

import SearchData from '../types/SearchData';

function createSearchData(search: ItunesProperties) {
  const searchData: SearchData = {
    title: search.trackName,
    artist: search.artistName,
    album: search.collectionName,
    genre: search.primaryGenreName,
    trackNumber: search.trackNumber,
    tracksCount: search.trackCount,
    discNumber: search.discNumber,
    discsCount: search.discCount,
    releaseDate: search.releaseDate,
    cover: search.artworkUrl100?.replace('100x100bb', '1024x1024bb'),
  };

  return searchData;
}

export default createSearchData;
