const { createHandler } = require('@app-core/server');
const axios = require('axios');

/**
 * Parse reqline statement without using regex
 * @param {string} reqline - The reqline statement to parse
 * @returns {Object} Parsed components
 */
function parseReqline(reqline) {
  const tokens = reqline.split(' | ');

  if (tokens.length < 2) {
    throw new Error('Missing required HTTP keyword');
  }

  // Parse HTTP method
  const httpToken = tokens[0].trim();
  if (!httpToken.startsWith('HTTP ')) {
    throw new Error('Missing required HTTP keyword');
  }

  const method = httpToken.substring(5).trim();
  if (method !== 'GET' && method !== 'POST') {
    throw new Error('Invalid HTTP method. Only GET and POST are supported');
  }

  // Parse URL
  const urlToken = tokens[1].trim();
  if (!urlToken.startsWith('URL ')) {
    throw new Error('Missing required URL keyword');
  }

  const url = urlToken.substring(4).trim();
  if (!url) {
    throw new Error('URL value is required');
  }

  // Initialize default values
  let headers = {};
  let query = {};
  let body = {};

  // Parse optional tokens (HEADERS, QUERY, BODY)
  for (let i = 2; i < tokens.length; i++) {
    const token = tokens[i].trim();

    if (token.startsWith('HEADERS ')) {
      try {
        const headersJson = token.substring(8).trim();
        headers = JSON.parse(headersJson);
      } catch (error) {
        throw new Error('Invalid JSON format in HEADERS section');
      }
    } else if (token.startsWith('QUERY ')) {
      try {
        const queryJson = token.substring(6).trim();
        query = JSON.parse(queryJson);
      } catch (error) {
        throw new Error('Invalid JSON format in QUERY section');
      }
    } else if (token.startsWith('BODY ')) {
      try {
        const bodyJson = token.substring(5).trim();
        body = JSON.parse(bodyJson);
      } catch (error) {
        throw new Error('Invalid JSON format in BODY section');
      }
    } else {
      throw new Error('Invalid keyword. Only HEADERS, QUERY, and BODY are supported');
    }
  }

  // Build full URL with query parameters
  let fullUrl = url;
  if (Object.keys(query).length > 0) {
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const queryParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    fullUrl = `${url}?${queryParams.toString()}`;
  }

  return {
    method,
    url: fullUrl,
    headers,
    body,
    query,
  };
}

/**
 * Execute HTTP request using axios
 * @param {Object} requestConfig - Parsed request configuration
 * @returns {Object} Response data with timing information
 */
async function executeRequest(requestConfig) {
  const startTime = Date.now();

  try {
    const response = await axios({
      method: requestConfig.method.toLowerCase(),
      url: requestConfig.url,
      headers: requestConfig.headers,
      data: requestConfig.body,
      timeout: 10000, // 10 second timeout
    });

    const endTime = Date.now();

    return {
      http_status: response.status,
      duration: endTime - startTime,
      request_start_timestamp: startTime,
      request_stop_timestamp: endTime,
      response_data: response.data,
    };
  } catch (error) {
    const endTime = Date.now();

    return {
      http_status: error.response?.status || 500,
      duration: endTime - startTime,
      request_start_timestamp: startTime,
      request_stop_timestamp: endTime,
      response_data: error.response?.data || { error: error.message },
    };
  }
}

const handler = createHandler({
  path: '/',
  method: 'post',
  async handler(requestComponents, helpers) {
    try {
      const { reqline } = requestComponents.body;

      if (!reqline) {
        return {
          status: helpers.http_statuses.HTTP_400_BAD_REQUEST,
          data: {
            error: true,
            message: 'Missing reqline parameter',
          },
        };
      }

      // Parse the reqline statement
      const parsedRequest = parseReqline(reqline);

      // Execute the request
      const response = await executeRequest(parsedRequest);

      return {
        status: helpers.http_statuses.HTTP_200_OK,
        data: {
          request: {
            query: parsedRequest.query,
            body: parsedRequest.body,
            headers: parsedRequest.headers,
            full_url: parsedRequest.url,
          },
          response,
        },
      };
    } catch (error) {
      return {
        status: helpers.http_statuses.HTTP_400_BAD_REQUEST,
        data: {
          error: true,
          message: error.message,
        },
      };
    }
  },
});

// Export both the handler and the parseReqline function for testing
module.exports = handler;
module.exports.parseReqline = parseReqline;
