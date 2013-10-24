var mongoose = require('mongoose');
var _ = require('underscore');
var warnGroupSchema = require('../schema/warnGroupSchema');
var WarnGroup = mongoose.model('WarnGroup', warnGroupSchema);

WarnGroup.addWarn = function(groupID, warn, cb) {
	WarnGroup.findOneAndUpdate({_id: groupID}, { $push: { warns: warn } }, cb);
};

WarnGroup.addConfirm = function(groupID, warnID, userID, cb) {
	WarnGroup.findOneAndUpdate({_id: groupID, 'warns._id': warnID}, { $addToSet: { 'warns.$.confirmedBy': userID } }, cb);
};

module.exports = WarnGroup;