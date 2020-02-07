/**
 * Old fashioned biblio loader
 * @author Jim Chen
 */

var BiblioLoader = (function (defaultTags, defaultGroupOrder) {
  var MONTHS = {
    'jan': 0.00,
    'feb': 0.01,
    'mar': 0.02,
    'apr': 0.03,
    'may': 0.04,
    'jun': 0.05,
    'jul': 0.06,
    'aug': 0.07,
    'sep': 0.08,
    'oct': 0.09,
    'nov': 0.10,
    'dec': 0.11,
    '': 0.12
  };

  function getSimpleDate(year, month) {
    let cleanMonth = month.trim().substring(0, 3).toLowerCase();
    if (!(cleanMonth in MONTHS)) {
      cleanMonth = '';
    }
    return parseInt(year, 10) + MONTHS[cleanMonth];
  }

  function _paperComparator(a, b) {
    var time_a = getSimpleDate(a['time']['year'], a['time']['month']),
        time_b = getSimpleDate(b['time']['year'], b['time']['month']);
    if (time_a < time_b) {
      return -1
    } else if (time_a > time_b) {
      return 1;
    } else {
      if (a['sort_title'] > b['sort_title']) {
        return 1;
      } else if (a['sort_title'] < b['sort_title']) {
        return -1;
      }
      return 0;
    }
  }

  function _paperRenderer(_, paper) {
    return _('tr', {}, [
      _('td', {}, [
        _('span', { 'className': 'date' }, [
          _('big', {}, [_('strong', {}, [_('', paper['time']['year'])])]),
          _('br'),
          _('', paper['time']['month'])
        ])
      ]),
      _('td', { 'className': 'publication' }, [
        _('span', { 'className': 'pubtitle' }, 
          paper['url'].trim() !== '' ? [
            _('img', { 
              'src': 'img/pdficon_small.png', 
              'style': {'width': '16px', 'height': '16px'},
              'alt': 'PDF'
            }),
            _('', ' '),
            _('a', { 'href': paper['url'] }, [ _('', paper['title']) ])
          ] : [
            _('', paper['title'])
          ]
        ),
        _('br'),
        _('span', { 'className': 'authors' }, 
          paper['authors'].map(function (author) {
                return _('span', {}, [_('', author['name'])])
              })
            .reduce(function (base, record, idx, arr) {
              if (idx === arr.length - 1) {
                return base.concat([record]);
              } else {
                return base.concat([record, _('', ', ')]);
              }
            }, [])),
        _('br'),
        _('span', { 'className': 'venue' }, [
          _('', paper['venue'] + ' ' + paper['time']['year'])
        ])
      ]),
    ]);
  }

  function BiblioLoader(tagset) {
    this.baseUrl = 
      'https://www.cs.washington.edu/_webservices/publications/json.php?tags=';
    this.tagset = (typeof tagset === 'undefined') ? defaultTags : tagset;
  }

  BiblioLoader.prototype.load = function () {
    let tags = this.tagset.map(function (tag) {
        return encodeURIComponent(tag);
      }).join(',');
    return fetch(this.baseUrl + tags, {'mode': 'cors'})
      .then(function(response) {
        return response.json();
      })
      .then(function(papers) {
        return papers.map(function (paper) {
          return {
            'id': paper['uid'] + '_' + paper['vid'] + '_' + paper['nid'],
            'title': paper['title'],
            'sort_title': paper['biblio_sort_title'],
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

  BiblioLoader.prototype.loadGrouped = function () {
    return this.load().then(function (papers) {
      var groups = {};
      papers.forEach(function (paper) {
        if (!(paper['biblio_type_name'] in groups)) {
          groups[paper['biblio_type_name']] = [];
        }
        groups[paper['biblio_type_name']].push(paper);
      });
      // Sort the groups by publication time then title
      for (var group in groups) {
        groups[group].sort(_paperComparator);
      }
      return groups;
    });
  };

  BiblioLoader.prototype.createBiblioDOM = function (parent, _, groupOrder) {
    if (typeof groupOrder === 'undefined' || groupOrder === null) {
      return this.load().then(function (papers) {
        papers.sort(_paperComparator);
        parent.innerHTML = '';
        parent.appendChild(_('table', { 'className': 'table' }, [
          _('tbody', {}, papers.reverse().map(function (paper) {
            return _paperRenderer(_, paper);
          }))]));
        return papers;
      });
    } else {
      return this.loadGrouped().then(function (grouped) {
        console.log('not implemented');
      });
    }
  };

  return BiblioLoader;
})(["crowdlab",
    "ai-crowd-train-test",
    "crowd-argumentation",
    "ai-bootstrapping-communities",
    "ai-crowd-task-routing",
    "ai-crowd-multi-label",
    "crowd-task-design"], 
   null);
