import { Request, Response } from 'express';

import ytsr from 'ytsr';

import SearchQuery from '../types/SearchQuery';
import SearchResponse, { SearchItem } from '../types/SearchResponse';

async function info(
  req: Request<{}, {}, {}, SearchQuery>,
  res: Response<SearchResponse>
): Promise<any> {
  if (req.query.q === undefined) {
    res.status(400).json({
      error: 'parameter [q] is required',
    });
    return;
  }

  const search = await ytsr(req.query.q, { limit: 5 });

  const response: SearchResponse = {
    corrected: search.correctedQuery,
    results: [],
  };

  search.items.forEach((item) => {
    if (item.type === 'video') {
      const searchItem: SearchItem = {
        v: item.id,
        title: item.title,
        author: item.author?.url,
        thumbnail: item.bestThumbnail.url,
      };

      response.results?.push(searchItem);
    }
  });

  res.status(200).json(response);
}

export default info;
