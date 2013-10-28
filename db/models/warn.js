var mongoose = require('mongoose');
var warnSchema = require('../schema/warnSchema');
var Warn = mongoose.model('Warn', warnSchema);

module.exports = Warn;