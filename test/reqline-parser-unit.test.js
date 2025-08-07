const { expect } = require('chai');
const parseReqlineService = require('../services/reqline/parse-reqline');
const reqlineMessages = require('../messages/reqline');

describe('Reqline Parser Service Unit Tests', function () {
  this.timeout(10000);
  describe('parseReqlineService function', () => {
    it('should parse basic GET request', async () => {
      const payload = { reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3' };
      const result = await parseReqlineService(payload);
      expect(result.request.method).to.equal(undefined); // method is not returned in request
      expect(result.request.full_url).to.equal('https://dummyjson.com/quotes/3');
      expect(result.request.headers).to.deep.equal({});
      expect(result.request.body).to.deep.equal({});
      expect(result.request.query).to.deep.equal({});
    });

    it('should parse GET request with query parameters', async () => {
      const payload = {
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}',
      };
      const result = await parseReqlineService(payload);
      expect(result.request.full_url).to.equal('https://dummyjson.com/quotes/3?refid=1920933');
      expect(result.request.query).to.deep.equal({ refid: 1920933 });
    });

    it('should parse POST request with body', async () => {
      const payload = {
        reqline:
          'HTTP POST | URL https://dummyjson.com/products/add | BODY {"title": "Test Product"}',
      };
      const result = await parseReqlineService(payload);
      expect(result.request.full_url).to.equal('https://dummyjson.com/products/add');
      expect(result.request.body).to.deep.equal({ title: 'Test Product' });
    });

    it('should parse request with headers', async () => {
      const payload = {
        reqline:
          'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Content-Type": "application/json"}',
      };
      const result = await parseReqlineService(payload);
      expect(result.request.headers).to.deep.equal({ 'Content-Type': 'application/json' });
    });

    it('should parse complex request with all components', async () => {
      const payload = {
        reqline:
          'HTTP POST | URL https://dummyjson.com/products/add | HEADERS {"Content-Type": "application/json"} | QUERY {"category": "electronics"} | BODY {"title": "Test Product"}',
      };
      const result = await parseReqlineService(payload);
      expect(result.request.full_url).to.equal(
        'https://dummyjson.com/products/add?category=electronics'
      );
      expect(result.request.headers).to.deep.equal({ 'Content-Type': 'application/json' });
      expect(result.request.query).to.deep.equal({ category: 'electronics' });
      expect(result.request.body).to.deep.equal({ title: 'Test Product' });
    });

    it('should handle components in different order', async () => {
      const payload = {
        reqline:
          'HTTP POST | URL https://dummyjson.com/products/add | BODY {"title": "Test"} | HEADERS {"Content-Type": "application/json"} | QUERY {"category": "electronics"}',
      };
      const result = await parseReqlineService(payload);
      expect(result.request.full_url).to.equal(
        'https://dummyjson.com/products/add?category=electronics'
      );
      expect(result.request.headers).to.deep.equal({ 'Content-Type': 'application/json' });
      expect(result.request.query).to.deep.equal({ category: 'electronics' });
      expect(result.request.body).to.deep.equal({ title: 'Test' });
    });
  });

  describe('Error cases', () => {
    async function expectError(payload, expectedMessage) {
      try {
        await parseReqlineService(payload);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(expectedMessage);
      }
    }

    it('should throw error for missing HTTP keyword', async () => {
      await expectError(
        { reqline: 'GET | URL https://dummyjson.com/quotes/3' },
        reqlineMessages.MISSING_HTTP_KEYWORD
      );
    });

    it('should throw error for missing URL keyword', async () => {
      await expectError(
        { reqline: 'HTTP GET | https://dummyjson.com/quotes/3' },
        reqlineMessages.MISSING_URL_KEYWORD
      );
    });

    it('should throw error for invalid HTTP method', async () => {
      await expectError(
        { reqline: 'HTTP PUT | URL https://dummyjson.com/quotes/3' },
        reqlineMessages.INVALID_HTTP_METHOD
      );
    });

    it('should throw error for invalid JSON in HEADERS', async () => {
      await expectError(
        { reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {invalid json}' },
        reqlineMessages.INVALID_JSON_HEADERS
      );
    });

    it('should throw error for invalid JSON in QUERY', async () => {
      await expectError(
        { reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {invalid json}' },
        reqlineMessages.INVALID_JSON_QUERY
      );
    });

    it('should throw error for invalid JSON in BODY', async () => {
      await expectError(
        { reqline: 'HTTP POST | URL https://dummyjson.com/products/add | BODY {invalid json}' },
        reqlineMessages.INVALID_JSON_BODY
      );
    });

    it('should throw error for invalid keyword', async () => {
      await expectError(
        { reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | INVALID {"test": "value"}' },
        reqlineMessages.INVALID_KEYWORD
      );
    });

    it('should throw error for insufficient tokens', async () => {
      await expectError({ reqline: 'HTTP GET' }, reqlineMessages.MISSING_HTTP_KEYWORD);
    });

    it('should throw error for missing reqline parameter', async () => {
      await expectError({}, reqlineMessages.MISSING_REQLINE_PARAM);
    });
  });
});
