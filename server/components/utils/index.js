'use strict';

var config = require('../../config/environment');
var _ = require('lodash');

/**
 * parse query parameters
 *
 * http://localhost:9000/api/:controller?
 *     // match
 *     id=1|2|3|4&
 *     sellPrice[gte]=10000&
 *     sellPrice[lte]=90000&
 *     {field}={value}&
 *     // like
 *     q[name]=john&
 *     q[desc]=something&
 *     // auto
 *     q[sellPrice]=9000|-9000|9000-|9000-10000
 *     // boolean operator
 *     q[operator]=or&
 *     sort[name]=asc&
 *     sort[createdAt]=desc&
 *     fields=name|stockCount&
 *     page=1&
 *     limit=10
 */
function parseQuery( query ) {
    var options = {};
    options.where = {};

    var keys = ['fields', 'limit', 'page', 'q', 'sort'];
    var queryKeys = _.keys(query);
    var fieldKeys = _.difference(queryKeys, keys);

    if( !_.isEmpty(fieldKeys) ) {
        var f = _.chain(query).pick(function(v,k) { 
                    return ~_.indexOf(fieldKeys, k);
                }).transform(function(result, v, k){
                    var filter = {};
                    if( _.isString(v) ) {

                        if( /\|/.test(v) ) { // in array
                            var values = v.split('|');
                            filter.$in = k == 'id' ? _.map(values, function(item){ return parseInt(item) }) : values ;
                            result[k] = filter;
                        } else { // match
                            result[k] = v;
                        }

                    } else {
                        result[k] = _.transform(v, function(result, v, k) {
                            var numbers = ['gt', 'gte', 'lt', 'lte'];
                            result['$'+k] = ~_.indexOf(numbers, k) ? parseInt(v) : v ;
                        });
                    }
                }).value();

        options.where = f;
    }

    if( query.q ) {
        var q = _.chain(query.q)
                .omit('operator')
                .transform(function(result, v, k) {
                    var filter = {};
                    if( k == 'id' && !_.isEmpty(v) ) {
                      result[k] = v;
                    } else if( /price|stock|cost/i.test(k) ) {
                        // regex range numbers
                        // accept "-" on first, last or between 2 numbers
                        // example: 100, -100, 100-, 100-200
                        if( /^(\-)?\d+(\-)?(\d+)?$/.test(v) ) {
                            var price = v.replace('-', '');
                            var index = v.indexOf('-');
                            if( ~index ) {
                                if( index == 0 ) {
                                    filter['$lte'] = price;
                                } else if( index == (v.length - 1) ) {
                                    var agg = price == 0 ? '$gt' : '$gte';
                                    filter[agg] = price;
                                } else {
                                    var numbers = v.split('-');
                                    filter = { $between: numbers };
                                }
                            } else { // if null / not match is equal
                                filter = v;
                            }
                            result[k] = filter;
                        }
                    } else if(!_.isEmpty(v)) {
                        result[k] = { $regex: v, $options: 'i' };
                    }
                }).value();

        // operator query
        var _where = q;
        if(_.has(query.q, 'operator') && ~_.indexOf(['or', 'and'], query.q.operator)) {
            var operator = '$' + query.q.operator;
            _where = {};
            _where[operator] = q;
        }

        options.where = _.assign(options.where, _where);
    }

    if( query.sort ) {
        // var orders = [];
        // _.each(query.sort, function(v, k){
        //     orders.push([k, v]);
        // });
        options.sort = _.reduce(query.sort, function (result, v, k) {
          result[k] = v =='desc' ? -1 : 1;
          return result;
        }, {});
    }

    if( query.limit ) {
        options.limit = parseInt(query.limit);
    }

    // limit & offset
    if( query.page ) {
        options.limit = parseInt(query.limit) || 10;
        options.offset = options.limit * (query.page - 1);
    }

    // attributes
    if( query.fields ) {
        options.attributes = query.fields.split('|');
    }

    return options;
}

// @todo: search on desc also?
function parseElasticParams(params) {
  // if (!params.hasOwnProperty('q') || !params.hasOwnProperty('t')) return;

  console.log('params', params);

  var pageNum = parseInt(params.p) || 1;
  var perPage = parseInt(params.l) || 10;
  if (perPage > 16) perPage = 10;

  var query = {
    index: config.elasticsearch.index,
    from: (pageNum - 1) * perPage,
    size: perPage
  };

  var and = [];
  // type
  if (params.hasOwnProperty('t') && params.t !== 'all') query.type = params.t

  if (params.hasOwnProperty('pmin') && params.hasOwnProperty('pmax')) and.push({ range: {price: { gte: parseInt(params.pmin), lte: parseInt(params.pmax)}}}); // price range
  
  // if (params.hasOwnProperty('br')) and.push({ term: { brand: params.br.toLowerCase() }}); // brand
  
  if (params.hasOwnProperty('br')){
    if(params.br instanceof Array){
      var brands = [];
      for(var i=0;i<params.br.length;i++) {
        brands.push(params.br[i].toLowerCase());
      }

      and.push({ terms: { brand: brands }});
      // params.q = brands.toString();
    }else{
      and.push({ term: { brand: params.br.toLowerCase() }}); // brand
      // params.q = params.br;
    }
  } 

  if (params.hasOwnProperty('pr')){
    if(params.pr instanceof Array){
      var processors = [];
      for(var i=0;i<params.pr.length;i++) {
        processors.push(params.pr[i].toLowerCase());
      }

      and.push({ terms: { processor: processors }});
      // params.q = processors.toString();
    }else{
      and.push({ term: { processor: params.pr.toLowerCase() }}); // brand
      // params.q = params.pr;
    }
  } 

  if (params.hasOwnProperty('pu')){
    if(params.pu instanceof Array){
      var purposes = [];
      for(var i=0;i<params.pu.length;i++) {
        purposes.push(params.pu[i].toLowerCase());
      }

      and.push({ terms: { purpose: purposes }});
      // params.q = purposes.toString();
    }else{
      and.push({ term: { purpose: params.pu.toLowerCase() }}); // brand
      // params.q = params.pu;
    }
  }

  if (params.hasOwnProperty('st')){
    if(params.st instanceof Array){
      var sub_types = [];
      for(var i=0;i<params.st.length;i++) {
        sub_types.push(params.st[i].toLowerCase());
      }

      and.push({ terms: { subType: sub_types }});
      // params.q = sub_types.toString();
    }else{
      and.push({ term: { subType: params.st.toLowerCase() }}); // sub type
      // params.q = params.st;
    }
  }

  // if (params.pr) and.push({ term: { processor: params.pr.toLowerCase() }}); // processor
  // if (params.hasOwnProperty('st')) and.push({ term: { subType: params.st.toLowerCase() }}); // subtype
  // if (params.hasOwnProperty('pu')) and.push({ term: { purpose: params.pu.toLowerCase() }}); // purpose
  if (params.hasOwnProperty('ss')) and.push({ term: { screenSize: parseInt(params.ss) }}); // screen size
  // if (params.os) and.push({ term: { os: params.os.toLowerCase() }}); // operating system

  if (and.length > 0) {
    if (params.q) and.push({query: {query_string: {query: params.q.toLowerCase() }}});
    query.body = {query: {filtered: {filter: {and: and}}}};
  } else {    
    if (params.q) query.q = 'name:*' + params.q.toLowerCase() + '*';
  }

  // sort
  if (params.hasOwnProperty('s')) {
    var sort = {};
    var order = params.hasOwnProperty('o') && ['asc', 'desc'].indexOf(params.o) > -1 ? params.o : 'desc';
    sort[params.s] = { 'order': order, 'ignore_unmapped': true };
    if(query.body) {
      query.body.sort = sort;
    } else {
      query.body = {
        sort: [sort]
      };
    }
  } else {
    var sort = {'createdAt': { 'order': 'desc', 'ignore_unmapped': true }};
    if(query.body) {
      query.body.sort = sort;
    } else {
      query.body = {
        sort: [sort]
      };
    }
  }
  
  return query;
};

module.exports.parseQuery = parseQuery;
module.exports.parseElasticParams = parseElasticParams;