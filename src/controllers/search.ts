import { Request, Response } from 'express';

import ytsr from 'ytsr';

import SearchQuery from '../types/SearchQuery';
import SearchResponse, { SearchItem } from '../types/SearchResponse';

async function info(
  req: Request<{}, {}, {}, SearchQuery>,
  res: Response<SearchResponse>
): Promise<any> {
  if (req.query.q === undefined || req.query.q === '') {
    res.status(400).json({
      error: 'parameter [q] is required',
    });
    return;
  }

  const filters = await ytsr.getFilters(req.query.q);
  const filter = filters.get('Type')?.get('Video');
  if (!filter || filter.url === null) {
    res.status(400).json({
      error: 'could not find any video',
    });
    return;
  }

  const search = await ytsr(filter.url, { limit: 10 });

  const response: SearchResponse = {
    corrected: search.correctedQuery,
    results: [],
  };

  search.items.forEach((item) => {
    if (item.type === 'video') {
      const searchItem: SearchItem = {
        v: item.id,
        title: item.title,
        author: item.author?.name,
        thumbnail: item.bestThumbnail.url,
      };

      response.results?.push(searchItem);
    }
  });

  res.status(200).json(response);
}

export default info;
