import itunes from 'node-itunes-search';

async function itunesSearch(title: string) {
  const result = await itunes.search({
    term: title,
    limit: 1,
    media: itunes.Media.Music,
  });

  return result.resultCount > 0 ? result.results[0] : false;
}

export default itunesSearch;
