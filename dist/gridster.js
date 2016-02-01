/**

demo of gridster-js, hoping for a diablo- or wow-style inventory. http://gridster.net/
gridster doesn't really do swapping; rearranges automatically. https://github.com/ducksboard/gridster.js/issues/347

alternatives:
* gridly - squares only; also autorearranges. https://ksylvest.github.io/jquery-gridly/
* fork of gridster supports swapping, supposedly. not in bower. https://github.com/dustmoo/gridster.js

dedicated inventory systems - these are MUCH better!
* https://www.codersclan.net/ticket/430
* https://jsfiddle.net/GQUy6/73/

*/

console.log('hi');

$(function(){ //DOM Ready

    $(".gridster ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [140, 140]
    });

});
