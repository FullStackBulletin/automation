/* eslint "no-console": "off" */

import 'source-map-support/register';

export const createIssue = (event, context, callback) => {
  console.log(event, context);
  callback(null, 'done');
};

export default createIssue;
