const { expect } = require('chai');
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

describe('Reqline Parser', () => {
  describe('Valid Syntax Tests', () => {
    it('should parse basic GET request with query parameters', async () => {
      const response = await axios.post(`${BASE_URL}/`, {
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}',
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.not.have.property('error');
      expect(response.data.request.query).to.deep.equal({ refid: 1920933 });
      expect(response.data.request.full_url).to.equal(
        'https://dummyjson.com/quotes/3?refid=1920933'
      );
      expect(response.data.response.http_status).to.equal(200);
    });

    it('should parse GET request with headers and query', async () => {
      const response = await axios.post(`${BASE_URL}/`, {
        reqline:
          'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Content-Type": "application/json"} | QUERY {"refid": 1920933}',
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.not.have.property('error');
      expect(response.data.request.headers).to.deep.equal({ 'Content-Type': 'application/json' });
      expect(response.data.request.query).to.deep.equal({ refid: 1920933 });
    });

    it('should parse POST request with body', async () => {
      const response = await axios.post(`${BASE_URL}/`, {
        reqline:
          'HTTP POST | URL https://dummyjson.com/products/add | BODY {"title": "Test Product", "price": 99.99}',
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.not.have.property('error');
      expect(response.data.request.body).to.deep.equal({ title: 'Test Product', price: 99.99 });
      expect(response.data.response.http_status).to.equal(201);
    });

    it('should parse complex request with all components', async () => {
      const response = await axios.post(`${BASE_URL}/`, {
        reqline:
          'HTTP POST | URL https://dummyjson.com/products/add | HEADERS {"Content-Type": "application/json", "Authorization": "Bearer token123"} | QUERY {"category": "electronics"} | BODY {"title": "Test Product", "price": 99.99}',
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.not.have.property('error');
      expect(response.data.request.headers).to.deep.equal({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token123',
      });
      expect(response.data.request.query).to.deep.equal({ category: 'electronics' });
      expect(response.data.request.body).to.deep.equal({ title: 'Test Product', price: 99.99 });
      expect(response.data.request.full_url).to.equal(
        'https://dummyjson.com/products/add?category=electronics'
      );
    });
  });

  describe('Error Handling Tests', () => {
    it('should reject invalid HTTP method (PUT)', async () => {
      try {
        await axios.post(`${BASE_URL}/`, {
          reqline: 'HTTP PUT | URL https://dummyjson.com/quotes/3',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.be.true;
        expect(error.response.data.message).to.equal(
          'Invalid HTTP method. Only GET and POST are supported'
        );
      }
    });

    it('should reject missing HTTP keyword', async () => {
      try {
        await axios.post(`${BASE_URL}/`, {
          reqline: 'GET | URL https://dummyjson.com/quotes/3',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.be.true;
        expect(error.response.data.message).to.equal('Missing required HTTP keyword');
      }
    });

    it('should reject missing URL keyword', async () => {
      try {
        await axios.post(`${BASE_URL}/`, {
          reqline: 'HTTP GET | https://dummyjson.com/quotes/3',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.be.true;
        expect(error.response.data.message).to.equal('Missing required URL keyword');
      }
    });

    it('should reject invalid JSON in HEADERS', async () => {
      try {
        await axios.post(`${BASE_URL}/`, {
          reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {invalid json}',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.be.true;
        expect(error.response.data.message).to.equal('Invalid JSON format in HEADERS section');
      }
    });

    it('should reject invalid JSON in QUERY', async () => {
      try {
        await axios.post(`${BASE_URL}/`, {
          reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {invalid json}',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.be.true;
        expect(error.response.data.message).to.equal('Invalid JSON format in QUERY section');
      }
    });

    it('should reject invalid JSON in BODY', async () => {
      try {
        await axios.post(`${BASE_URL}/`, {
          reqline: 'HTTP POST | URL https://dummyjson.com/products/add | BODY {invalid json}',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.be.true;
        expect(error.response.data.message).to.equal('Invalid JSON format in BODY section');
      }
    });

    it('should reject invalid keyword', async () => {
      try {
        await axios.post(`${BASE_URL}/`, {
          reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | INVALID {"test": "value"}',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.be.true;
        expect(error.response.data.message).to.equal(
          'Invalid keyword. Only HEADERS, QUERY, and BODY are supported'
        );
      }
    });

    it('should reject missing reqline parameter', async () => {
      try {
        await axios.post(`${BASE_URL}/`, {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error).to.be.true;
        expect(error.response.data.message).to.equal('Missing reqline parameter');
      }
    });
  });

  describe('Response Format Tests', () => {
    it('should include timing information in response', async () => {
      const response = await axios.post(`${BASE_URL}/`, {
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3',
      });

      expect(response.data.response).to.have.property('duration');
      expect(response.data.response).to.have.property('request_start_timestamp');
      expect(response.data.response).to.have.property('request_stop_timestamp');
      expect(response.data.response.duration).to.be.a('number');
      expect(response.data.response.request_start_timestamp).to.be.a('number');
      expect(response.data.response.request_stop_timestamp).to.be.a('number');
    });

    it('should include request details in response', async () => {
      const response = await axios.post(`${BASE_URL}/`, {
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"test": "value"}',
      });

      expect(response.data.request).to.have.property('query');
      expect(response.data.request).to.have.property('body');
      expect(response.data.request).to.have.property('headers');
      expect(response.data.request).to.have.property('full_url');
      expect(response.data.request.query).to.deep.equal({ test: 'value' });
    });
  });

  describe('Test Endpoint', () => {
    it('should return test cases and documentation', async () => {
      const response = await axios.get(`${BASE_URL}/test`);

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('valid_test_cases');
      expect(response.data).to.have.property('error_test_cases');
      expect(response.data).to.have.property('usage');
      expect(response.data.valid_test_cases).to.be.an('array');
      expect(response.data.error_test_cases).to.be.an('array');
    });
  });
});
