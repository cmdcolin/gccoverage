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
                    autoscale: 'local',
                    windowSize: 100,
                    windowDelta: 10,
                    style: {
                        gc_color: 'green',
                        pos_color: 'grey'
                    }
                }
            );
        },


        _postDraw: function(scale, leftBase, rightBase, block, canvas, features, featureRects, dataScale) {
            var canvasWidth = this._canvasWidth( block );
            var features = [];
            var thisB = this;
                
            this.gcStore.getFeatures(
                { ref: this.refSeq.name,
                  basesPerSpan: 1/scale,
                  scale: scale,
                  start: leftBase,
                  end: rightBase+1
                },

                function(f) {
                    if( thisB.filterFeature(f) )
                        features.push(f);
                },
                dojo.hitch( this, function(args) {

                    var featureRects = array.map( features, function(f) {
                        return this._featureRect( scale, leftBase, canvasWidth, f );
                    }, this );

                    var pixels = this._calculatePixelScores( this._canvasWidth(block), features, featureRects );
                    thisB._drawGC( scale, leftBase, rightBase, block, canvas, pixels, thisB.scaling);
                }),
                dojo.hitch( this, function(e) {
                    console.error( e.stack || ''+e, e );
                    this._handleError( e, args );
                }));
        },

        _drawGC: function( scale, leftBase, rightBase, block, canvas, pixels, dataScale ) {
            var thisB=this;
             
            var context = canvas.getContext('2d');
            var canvasHeight = canvas.height;

            var ratio = Util.getResolution( context, this.browser.config.highResolutionMode );
            var toY = dojo.hitch( this, function( val ) {
               return canvasHeight * ( 1-dataScale.normalize(val) ) / ratio;
            });
            var originY = toY( dataScale.origin );

            context.fillStyle = thisB.config.style.gc_color;
            dojo.forEach( pixels, function(p,i) {
                if (!p)
                    return;
                var score = p['score'];
                context.fillRect(i, canvasHeight*score/ratio, 1, 5);
            }, this );
        }
    });
});

