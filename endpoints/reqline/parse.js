const { createHandler } = require('@app-core/server');
const parseReqlineService = require('../../services/reqline/parse-reqline');

module.exports = createHandler({
  path: '/',
  method: 'post',
  async handler(rc, helpers) {
    try {
      const result = await parseReqlineService(rc.body);
      return {
        status: helpers.http_statuses.HTTP_200_OK,
        data: result,
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
