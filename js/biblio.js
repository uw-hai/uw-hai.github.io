/**
 * Old fashioned biblio loader
 * @author Jim Chen
 */

var BiblioLoader = (function (tags) {
  function BiblioLoader(tagset) {
    this.tagset = (typeof tagset === 'undefined') ? tags : tagset;
  }

  BiblioLoader.prototype.load = function () {
    let tags = this.tagset.map(function (tag) {
        return encodeURIComponent(tag);
      }).join(',');
    return fetch('https://www.cs.washington.edu/_webservices/publications/json.php?tags=' + tags, {'mode': 'cors'})
      .then(function(response) {
        return response.json().map(function (paper) {
          return {
            'title': paper['title'],
            'sort_title': paper[''],
            'venue': paper['biblio_secondary_title'],
            'time': {
              'year': paper['biblio_year'],
              'month': paper['biblio_date']
            },
            'url': paper['biblio_url'],
            'type': paper['biblio_type_name'],
            'authors': paper['biblio_contributors'].map(function (author) {
              return {
                'name': author['name'],
                'affiliation': author['affiliation'],
                'rank': parseInt(author['rank'], 10)
              };
            })
          };
        });
      })
      .catch(function(error) {
        console.error('Request failed', error);
        throw error;
      });
  };

  return BiblioLoader;
})(["crowdlab",
    "ai-crowd-train-test",
    "crowd-argumentation",
    "ai-bootstrapping-communities",
    "ai-crowd-task-routing",
    "ai-crowd-multi-label",
    "crowd-task-design"]);
