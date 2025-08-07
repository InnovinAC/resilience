const axios = require('axios');
const { throwAppError } = require('@app-core/errors');
const reqlineMessages = require('../../messages/reqline');

function parseReqline(reqline) {
  const tokens = reqline.split(' | ');

  if (tokens.length < 2) {
    throwAppError(reqlineMessages.MISSING_HTTP_KEYWORD, 'REQLINE_MISSING_HTTP');
  }

  // Parse HTTP method
  const httpToken = tokens[0].trim();
  if (!httpToken.startsWith('HTTP ')) {
    throwAppError(reqlineMessages.MISSING_HTTP_KEYWORD, 'REQLINE_MISSING_HTTP');
  }

  const method = httpToken.substring(5).trim();
  if (method !== 'GET' && method !== 'POST') {
    throwAppError(reqlineMessages.INVALID_HTTP_METHOD, 'REQLINE_INVALID_METHOD');
  }

  // Parse URL
  const urlToken = tokens[1].trim();
  if (!urlToken.startsWith('URL ')) {
    throwAppError(reqlineMessages.MISSING_URL_KEYWORD, 'REQLINE_MISSING_URL');
  }

  const url = urlToken.substring(4).trim();
  if (!url) {
    throwAppError(reqlineMessages.MISSING_URL_VALUE, 'REQLINE_MISSING_URL_VALUE');
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
        throwAppError(reqlineMessages.INVALID_JSON_HEADERS, 'REQLINE_INVALID_JSON_HEADERS');
      }
    } else if (token.startsWith('QUERY ')) {
      try {
        const queryJson = token.substring(6).trim();
        query = JSON.parse(queryJson);
      } catch (error) {
        throwAppError(reqlineMessages.INVALID_JSON_QUERY, 'REQLINE_INVALID_JSON_QUERY');
      }
    } else if (token.startsWith('BODY ')) {
      try {
        const bodyJson = token.substring(5).trim();
        body = JSON.parse(bodyJson);
      } catch (error) {
        throwAppError(reqlineMessages.INVALID_JSON_BODY, 'REQLINE_INVALID_JSON_BODY');
      }
    } else {
      throwAppError(reqlineMessages.INVALID_KEYWORD, 'REQLINE_INVALID_KEYWORD');
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

async function executeRequest(requestConfig) {
  const startTime = Date.now();

  try {
    const response = await axios({
      method: requestConfig.method.toLowerCase(),
      url: requestConfig.url,
      headers: requestConfig.headers,
      data: requestConfig.body,
      timeout: 10000,
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

module.exports = async function parseReqlineService(payload) {
  if (!payload || !payload.reqline) {
    throwAppError(reqlineMessages.MISSING_REQLINE_PARAM, 'REQLINE_MISSING_PARAM');
  }
  const parsedRequest = parseReqline(payload.reqline);
  const response = await executeRequest(parsedRequest);
  return {
    request: {
      query: parsedRequest.query,
      body: parsedRequest.body,
      headers: parsedRequest.headers,
      full_url: parsedRequest.url,
    },
    response,
  };
};
