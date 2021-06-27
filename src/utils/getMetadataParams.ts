import SearchData from '../types/SearchData';

function getMetadataParams(data: SearchData) {
  // https://wiki.multimedia.cx/index.php/FFmpeg_Metadata
  return [
    ['-id3v2_version', '4'],

    /* eslint-disable indent */
    ...(data.cover
      ? [
          ['-map_metadata', '0'],
          ['-map', '0'],
          ['-map', '1'],
        ]
      : []),
    /* eslint-enable indent */

    ...(data.title ? ['-metadata', `title=${data.title}`] : []),

    ...(data.artist ? ['-metadata', `artist=${data.artist}`] : []),

    ...(data.album ? ['-metadata', `album=${data.album}`] : []),

    ...(data.genre ? ['-metadata', `genre=${data.genre}`] : []),

    ...(data.trackNumber && data.tracksCount
      ? ['-metadata', `track=${data.trackNumber}/${data.tracksCount}`]
      : []),

    ...(data.discNumber && data.discsCount
      ? ['-metadata', `disc=${data.discNumber}/${data.discsCount}`]
      : []),

    // check: is this really the right way to do it?
    ...(data.releaseDate ? ['-metadata', `date=${data.releaseDate}`] : []),
  ];
}

export default getMetadataParams;
