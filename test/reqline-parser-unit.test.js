const { expect } = require('chai');

// Import the parser function directly
const { parseReqline } = require('../endpoints/reqline/parse');

describe('Reqline Parser Unit Tests', () => {
  describe('parseReqline function', () => {
    it('should parse basic GET request', () => {
      const reqline = 'HTTP GET | URL https://dummyjson.com/quotes/3';
      const result = parseReqline(reqline);

      expect(result.method).to.equal('GET');
      expect(result.url).to.equal('https://dummyjson.com/quotes/3');
      expect(result.headers).to.deep.equal({});
      expect(result.body).to.deep.equal({});
      expect(result.query).to.deep.equal({});
    });

    it('should parse GET request with query parameters', () => {
      const reqline = 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}';
      const result = parseReqline(reqline);

      expect(result.method).to.equal('GET');
      expect(result.url).to.equal('https://dummyjson.com/quotes/3?refid=1920933');
      expect(result.query).to.deep.equal({ refid: 1920933 });
    });

    it('should parse POST request with body', () => {
      const reqline =
        'HTTP POST | URL https://dummyjson.com/products/add | BODY {"title": "Test Product"}';
      const result = parseReqline(reqline);

      expect(result.method).to.equal('POST');
      expect(result.url).to.equal('https://dummyjson.com/products/add');
      expect(result.body).to.deep.equal({ title: 'Test Product' });
    });

    it('should parse request with headers', () => {
      const reqline =
        'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Content-Type": "application/json"}';
      const result = parseReqline(reqline);

      expect(result.method).to.equal('GET');
      expect(result.headers).to.deep.equal({ 'Content-Type': 'application/json' });
    });

    it('should parse complex request with all components', () => {
      const reqline =
        'HTTP POST | URL https://dummyjson.com/products/add | HEADERS {"Content-Type": "application/json"} | QUERY {"category": "electronics"} | BODY {"title": "Test Product"}';
      const result = parseReqline(reqline);

      expect(result.method).to.equal('POST');
      expect(result.url).to.equal('https://dummyjson.com/products/add?category=electronics');
      expect(result.headers).to.deep.equal({ 'Content-Type': 'application/json' });
      expect(result.query).to.deep.equal({ category: 'electronics' });
      expect(result.body).to.deep.equal({ title: 'Test Product' });
    });

    it('should handle components in different order', () => {
      const reqline =
        'HTTP POST | URL https://dummyjson.com/products/add | BODY {"title": "Test"} | HEADERS {"Content-Type": "application/json"} | QUERY {"category": "electronics"}';
      const result = parseReqline(reqline);

      expect(result.method).to.equal('POST');
      expect(result.url).to.equal('https://dummyjson.com/products/add?category=electronics');
      expect(result.headers).to.deep.equal({ 'Content-Type': 'application/json' });
      expect(result.query).to.deep.equal({ category: 'electronics' });
      expect(result.body).to.deep.equal({ title: 'Test' });
    });
  });

  describe('Error cases', () => {
    it('should throw error for missing HTTP keyword', () => {
      const reqline = 'GET | URL https://dummyjson.com/quotes/3';
      expect(() => parseReqline(reqline)).to.throw('Missing required HTTP keyword');
    });

    it('should throw error for missing URL keyword', () => {
      const reqline = 'HTTP GET | https://dummyjson.com/quotes/3';
      expect(() => parseReqline(reqline)).to.throw('Missing required URL keyword');
    });

    it('should throw error for invalid HTTP method', () => {
      const reqline = 'HTTP PUT | URL https://dummyjson.com/quotes/3';
      expect(() => parseReqline(reqline)).to.throw(
        'Invalid HTTP method. Only GET and POST are supported'
      );
    });

    it('should throw error for invalid JSON in HEADERS', () => {
      const reqline = 'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {invalid json}';
      expect(() => parseReqline(reqline)).to.throw('Invalid JSON format in HEADERS section');
    });

    it('should throw error for invalid JSON in QUERY', () => {
      const reqline = 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {invalid json}';
      expect(() => parseReqline(reqline)).to.throw('Invalid JSON format in QUERY section');
    });

    it('should throw error for invalid JSON in BODY', () => {
      const reqline = 'HTTP POST | URL https://dummyjson.com/products/add | BODY {invalid json}';
      expect(() => parseReqline(reqline)).to.throw('Invalid JSON format in BODY section');
    });

    it('should throw error for invalid keyword', () => {
      const reqline = 'HTTP GET | URL https://dummyjson.com/quotes/3 | INVALID {"test": "value"}';
      expect(() => parseReqline(reqline)).to.throw(
        'Invalid keyword. Only HEADERS, QUERY, and BODY are supported'
      );
    });

    it('should throw error for insufficient tokens', () => {
      const reqline = 'HTTP GET';
      expect(() => parseReqline(reqline)).to.throw('Missing required HTTP keyword');
    });
  });
});
