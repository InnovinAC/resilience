const { createHandler } = require('@app-core/server');

module.exports = createHandler({
  path: '/test',
  method: 'get',
  async handler(requestComponents, helpers) {
    const testCases = [
      {
        name: 'Basic GET request',
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}',
        expected: {
          method: 'GET',
          url: 'https://dummyjson.com/quotes/3?refid=1920933',
          query: { refid: 1920933 },
          body: {},
          headers: {},
        },
      },
      {
        name: 'GET request with headers',
        reqline:
          'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Content-Type": "application/json"} | QUERY {"refid": 1920933}',
        expected: {
          method: 'GET',
          url: 'https://dummyjson.com/quotes/3?refid=1920933',
          query: { refid: 1920933 },
          body: {},
          headers: { 'Content-Type': 'application/json' },
        },
      },
      {
        name: 'POST request with body',
        reqline:
          'HTTP POST | URL https://dummyjson.com/products/add | BODY {"title": "Test Product", "price": 99.99}',
        expected: {
          method: 'POST',
          url: 'https://dummyjson.com/products/add',
          query: {},
          body: { title: 'Test Product', price: 99.99 },
          headers: {},
        },
      },
      {
        name: 'Complex request with all components',
        reqline:
          'HTTP POST | URL https://dummyjson.com/products/add | HEADERS {"Content-Type": "application/json", "Authorization": "Bearer token123"} | QUERY {"category": "electronics"} | BODY {"title": "Test Product", "price": 99.99}',
        expected: {
          method: 'POST',
          url: 'https://dummyjson.com/products/add?category=electronics',
          query: { category: 'electronics' },
          body: { title: 'Test Product', price: 99.99 },
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token123' },
        },
      },
    ];

    const errorTestCases = [
      {
        name: 'Missing HTTP keyword',
        reqline: 'GET | URL https://dummyjson.com/quotes/3',
        expectedError: 'Missing required HTTP keyword',
      },
      {
        name: 'Missing URL keyword',
        reqline: 'HTTP GET | https://dummyjson.com/quotes/3',
        expectedError: 'Missing required URL keyword',
      },
      {
        name: 'Invalid HTTP method',
        reqline: 'HTTP PUT | URL https://dummyjson.com/quotes/3',
        expectedError: 'Invalid HTTP method. Only GET and POST are supported',
      },
      {
        name: 'Invalid JSON in HEADERS',
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {invalid json}',
        expectedError: 'Invalid JSON format in HEADERS section',
      },
      {
        name: 'Invalid JSON in QUERY',
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {invalid json}',
        expectedError: 'Invalid JSON format in QUERY section',
      },
      {
        name: 'Invalid JSON in BODY',
        reqline: 'HTTP POST | URL https://dummyjson.com/products/add | BODY {invalid json}',
        expectedError: 'Invalid JSON format in BODY section',
      },
      {
        name: 'Invalid keyword',
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | INVALID {"test": "value"}',
        expectedError: 'Invalid keyword. Only HEADERS, QUERY, and BODY are supported',
      },
    ];

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: {
        message: 'Reqline Parser Test Cases',
        valid_test_cases: testCases,
        error_test_cases: errorTestCases,
        usage: {
          endpoint: 'POST /',
          request_format: {
            reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}',
          },
          response_format: {
            request: {
              query: { refid: 1920933 },
              body: {},
              headers: {},
              full_url: 'https://dummyjson.com/quotes/3?refid=1920933',
            },
            response: {
              http_status: 200,
              duration: 347,
              request_start_timestamp: 1691234567890,
              request_stop_timestamp: 1691234568237,
              response_data: {
                id: 3,
                quote: 'Thinking is the capital, Enterprise is the way, Hard Work is the solution.',
                author: 'Abdul Kalam',
              },
            },
          },
        },
      },
    };
  },
});
