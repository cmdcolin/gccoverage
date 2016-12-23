define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Util',
    'JBrowse/Model/CoverageFeature'
],
function(
    declare,
    array,
    SeqFeatureStore,
    Util,
    CoverageFeature
) {
    return declare(SeqFeatureStore, {
        constructor: function(args) {
            this.store = args.store;
            this.windowSize = args.windowSize;
            this.windowDelta = args.windowDelta;
        },

        getGlobalStats: function(callback /* , errorCallback */) {
            callback({});
        },

        getFeatures: function(query, featureCallback, finishCallback, errorCallback) {
            var hw = this.windowSize / 2; // Half the window size
            query.start = Math.max(0, query.start - hw);
            query.end = Math.min(query.end + hw, this.browser.refSeq.length);
            var thisB = this;

            if (query.end < 0 || query.start > query.end) {
                finishCallback();
                return;
            }

            this.store.getReferenceSequence(query, function(residues) {
                for (var i = hw; i < residues.length - hw; i += thisB.windowDelta) {
                    var r = residues.slice(i - hw, i + hw);
                    var ngc = 0;
                    for (var j = 0; j < r.length; j++) {
                        if (r[j] === 'c' || r[j] === 'C' || r[j] === 'g' || r[j] === 'G') {
                            ngc++;
                        }
                    }
                    var pos = query.start;
                    var score = ngc / r.length;

                    var feat = new CoverageFeature({
                        start: pos + i,
                        end: pos + i + thisB.windowDelta,
                        score: score
                    });
                    featureCallback(feat);
                }
                finishCallback();
            },
            finishCallback,
            errorCallback);
        }
    });
});
