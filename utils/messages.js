const moment = require('moment');

function formatMessage(ussername, text) {
  return {
    ussername,
    text,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;
