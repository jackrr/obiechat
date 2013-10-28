var mongoose = require('mongoose');
var _ = require('underscore');
var warnGroupSchema = require('../schema/warnGroupSchema');
var WarnGroup = mongoose.model('WarnGroup', warnGroupSchema);

WarnGroup.addWarn = function(groupID, warn, cb) {
	WarnGroup.findById(groupID, function(err, wg) {
		if (err) return cb(err);
		var oldWarn;
		var createNew = true;
		if (warn.description) {
			warn.description = warn.description.trim();
		}

		// to prevent redundant warns on one post ...
		_.each(wg.warns, function(w, index) {
			//	1. has all the new warns types (append new warn description to old)
			var append = true;
			_.each(warn.types, function(type) {
				if (_.indexOf(w.types, type) < 0) {
					append = false;
				}
			});
			if (append) {
				if (warn.description) {
					w.description = w.description + '\nAND\n' + warn.description;
				}
				createNew = false;
			}

			//	2. has the same creator (overwrite in this case)
			if (w.creatorID.equals(warn.creatorID)) {
				wg.warns[index] = warn;
				createNew = false;
			}
		});
		if (createNew) {
			WarnGroup.findOneAndUpdate({_id: groupID}, { $push: { warns: warn } }, cb);
		} else {
			WarnGroup.findOneAndUpdate({_id: groupID}, { $set: { warns: wg.warns } }, cb);
		}
	});
};

WarnGroup.addConfirm = function(groupID, warnID, userID, cb) {
	WarnGroup.findOneAndUpdate({_id: groupID, 'warns._id': warnID}, { $addToSet: { 'warns.$.confirmedBy': userID } }, cb);
};

module.exports = WarnGroup;