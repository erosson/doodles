// Fractal landscape.
// http://gameprogrammer.com/fractal.html
//
//setInterval(function(){location.reload();}, 5000);

function mean(vals) {
  return _.sum(vals) / vals.length;
}
function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function Point(texture, x, y, z) {
  this.texture = texture;
  this.x = x;
  this.y = y;
  this.z = z;
  this.index = this.texture.xyToIndex(x, y);
}
Point.prototype.color = function() {
  if (this.z >= 0.5) {
    // mountaintop
    var w = 0.85 + 0.15*Math.min(5, Math.max(0, this.z - 0.8));
    return 0x010101 * Math.floor(w * 0xFF);
  }
  if (this.z >= 0.02) {
    // grassland
    var g = 0.2 + 0.8*Math.min(1, Math.max(0, this.z));
    return 0x000100 * Math.floor(g * 0xFF);
  }
  if (this.z >= 0) {
    // dirt/shore
    var rg = 0.2 + 0.4*Math.min(0.1, Math.max(0, this.z))/0.1;
    return 0x010100 * Math.floor(rg * 0xFF);
  }
  // water
  var b = 0.8 * (1 - Math.min(1, Math.max(0, -this.z)));
  //console.log(this.z, b);
  return Math.floor(b * 0xFF);
};
Point.prototype.renderZ = function() {
  //return this.z;
  return 3 * Math.max(0, this.z);
};
Point.prototype.midpoint = function(that) {
  var x = mean([this.x, that.x]);
  var y = mean([this.y, that.y]);
  return this.texture.xyToPoint(x, y);
};
Point.prototype.fromMidpoint = function(midpoint) {
  var dx = this.x - midpoint.x;
  var dy = this.y - midpoint.y;
  return this.texture.xyToPoint(midpoint.x + dx, midpoint.y + dy);
};
Point.prototype.setHeightFromSources = function(ps, amp) {
  var meanZ = mean(_.map(_.filter(ps), function(p) { return p.z; }));
  var rand = randRange(-1, 1);
  this.z = meanZ + rand * amp;
  //console.log('setHeight', this, ps, meanZ, rand, this.z);
};

function Texture(segPow) {
  this.segPow = segPow;
  // Segments along one side
  this.numSegments = Math.pow(2, segPow);
  this.numVerts = this.numSegments + 1;
  this.points = [];
  for (var x=0; x < this.numVerts; x++) {
    for (var y=0; y < this.numVerts; y++) {
      var pt = new Point(this, x, y, 0);
      this.points[pt.index] = pt;
    }
  }
}
Texture.prototype.xyToIndex = function(x, y) {
  return x * this.numVerts + y;
};
Texture.prototype.xyToPoint = function(x, y) {
  return this.points[this.xyToIndex(x, y)];
};

// http://gameprogrammer.com/fractal.html
Texture.prototype.runDiamondSquare = function(amp) {
  var length = this.numSegments / 2;
  var level = 0;
  while (length >= 1) {
    // iterate all diamonds
    var diamonds = [];
    for (var x=length; x < this.numVerts; x += length*2) {
      for (var y=length; y < this.numVerts; y += length*2) {
        var pt = this.xyToPoint(x, y);
        diamonds.push(pt);
        pt.setHeightFromSources([
          this.xyToPoint(pt.x - length, pt.y - length),
          this.xyToPoint(pt.x - length, pt.y + length),
          this.xyToPoint(pt.x + length, pt.y - length),
          this.xyToPoint(pt.x + length, pt.y + length),
        ], amp);
      }
    }
    // iterate all squares. a little trickier, needs two iterations
    var squares = [];
    for (var x=length; x < this.numVerts; x += length*2) {
      for (var y=0; y < this.numVerts; y += length*2) {
        squares.push(this.xyToPoint(x, y));
      }
    }
    for (var x=0; x < this.numVerts; x += length*2) {
      for (var y=length; y < this.numVerts; y += length*2) {
        squares.push(this.xyToPoint(x, y));
      }
    }
    _.forEach(squares, function(pt) {
      pt.setHeightFromSources([
        this.xyToPoint(pt.x - length, pt.y),
        this.xyToPoint(pt.x + length, pt.y),
        this.xyToPoint(pt.x, pt.y - length),
        this.xyToPoint(pt.x, pt.y + length),
      ], amp);
    }, this);
    // next iteration
    console.log('runDiamondSquare', level, length, amp, diamonds, diamonds.length, squares, squares.length);
    amp /= 2;
    length /= 2;
    level += 1;
  }
};
// BROKEN - visible seams along quad boundaries
//Texture.prototype.runDiamondSquareRecursive = function(p0, p3, amp) {
//  //             p01x
//  //              |
//  //        p0 - p01 - p1
//  //        |     |    |
//  // p02x - p02 - c -  p13 - p13x 
//  //        |     |    |
//  //        p2 - p23 - p3
//  //              |
//  //             p23x
//  var p1 = this.xyToPoint(p3.x, p0.y);
//  var p2 = this.xyToPoint(p0.x, p3.y);
//  var p01 = p0.midpoint(p1);
//  // terminate recursion
//  if (!p01) {
//    return;
//  }
//  var p02 = p0.midpoint(p2);
//  var p31 = p3.midpoint(p1);
//  var p32 = p3.midpoint(p2);
//  var c = p01.midpoint(p32);
//  var p01x = c.fromMidpoint(p01);
//  var p02x = c.fromMidpoint(p02);
//  var p31x = c.fromMidpoint(p31);
//  var p32x = c.fromMidpoint(p32);
//  // diamond
//  c.setHeightFromSources([p0, p1, p2, p3], amp);
//  // squares
//  p01.setHeightFromSources([p0, p1, c, p01x], amp);
//  p02.setHeightFromSources([p0, p2, c, p02x], amp);
//  p31.setHeightFromSources([p3, p1, c, p31x], amp);
//  p32.setHeightFromSources([p3, p2, c, p32x], amp);
//  // recurse
//  _.forEach([p0, p1, p2, p3], function(p) {
//    this.runDiamondSquare(c, p, amp * 0.5);
//  }, this);
//};
Texture.prototype.corners = function() {
  var ret = [];
  var startend = [0, this.numSegments];
  _.forEach(startend, function(x) {
    _.forEach(startend, function(y) {
      ret.push(this.xyToPoint(x, y));
    }, this);
  }, this);
  return ret;
};
Texture.prototype.generate = function() {
  _.forEach(this.corners(), function(pt) {
    pt.z = randRange(-1, 1);
  });
  return this.runDiamondSquare(0.5);
};


var texture = new Texture(8);
texture.generate();




// http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.shadowMap.enabled = true;
//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

//var geometry = new THREE.BoxGeometry( 1, 1, 1 );


// copy our computed texture to the rendered geometry
var geometry = new THREE.PlaneGeometry( 5, 5, texture.numSegments, texture.numSegments);
geometry.vertexColors = [];
for (var i=0; i < texture.points.length; i++) {
  var pt = texture.points[i];
  geometry.vertices[i].z = pt.renderZ();
  // this would be nice, but nope. have to work with faces instead
  //geometry.vertexColors[i] = new THREE.Color(pt.color());
}
for (var i=0; i < geometry.faces.length; i++) {
  var face = geometry.faces[i];
  var verts = [face.a, face.b, face.c];
  for (var v=0; v < verts.length; v++) {
    var index = verts[v];
    var pt = texture.points[index];
    face.vertexColors.push(new THREE.Color(pt.color()));
  }
}
console.log(texture, geometry);
//var material = new THREE.MeshPhongMaterial( { color: 0x00ff00, shading: THREE.SmoothShading, specular: 0x050505 } );
var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
//var material = new THREE.MeshBasicMaterial( { wireframeLinewidth: 3, wireframe: true, vertexColors: THREE.VertexColors } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

//var light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
//light.position.set(0, 0, 5);
//scene.add(light);

function render() {
  requestAnimationFrame( render );
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render( scene, camera );
}
render();
