define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/Color',
    'dojo/on',
    'JBrowse/View/Track/_YScaleMixin',
    'JBrowse/View/Track/Wiggle/XYPlot',
    'JBrowse/View/Track/Wiggle/_Scale',
    'JBrowse/Util',
    'JBrowse/Store/SeqFeature/Coverage',
    'GCCoverage/Store/SeqFeature/GCContent'
],
function (
    declare,
    array,
    lang,
    Color,
    on,
    YScaleMixin,
    WiggleBase,
    Scale,
    Util,
    CoverageStore,
    GCContent
) {
    return declare([WiggleBase, YScaleMixin], {

        constructor: function (args) {
            var thisB = this;
            this.store = new CoverageStore({
                store: this.store,
                browser: this.browser
            });
            this.browser.getStore('refseqs', dojo.hitch(this, function(refSeqStore){
                console.log('here')
                
                thisB.gcStore = new GCContent({
                    store: refSeqStore,
                    browser: thisB.browser,
                    windowSize: thisB.config.windowSize,
                    windowDelta: thisB.config.windowDelta
                });
            }));
        },
        _defaultConfig: function() {
            return Util.deepUpdate(
                dojo.clone( this.inherited(arguments) ),
                {
                    autoscale: 'local'
                }
            );
        }

    });
});

