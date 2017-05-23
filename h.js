var React = require('React');
var Graphic = React.createClass({ 

  componentDidMount: function() {
    var context = this.getDOMNode().getContext('2d');
    this.paint(context);
  },

  componentDidUpdate: function() {
    var context = this.getDOMNode().getContext('2d');
    context.clearRect(0, 0, 200, 200);
    this.paint(context);
  },

  paint: function(context) {
    context.save();
    context.translate(100, 100);
    context.rotate(this.props.rotation, 100, 100);
    context.fillStyle = '#F00';
    context.fillRect(-50, -50, 100, 100);
    context.restore();
  },

  render: function() {
    return '<canvas id="canvas" width={200} height={200} ></canvas>';
  }

});

var App = React.createClass({

  getInitialState: function() {
    return { rotation: 0 };
  },

  componentDidMount: function() {
    requestAnimationFrame(this.tick);
  },

  tick: function() {
    this.setState({ rotation: this.state.rotation + .01 });
    requestAnimationFrame(this.tick);
  },

  render: function() {
    return '<div><Graphic rotation={this.state.rotation} /></div>'
  }

});

function get_json(){
	var doms = require('jsdom');
	var document = new doms.jsdom();
	var canvas = React.renderComponent('<App />', document.body);;
	
	var elem = document.getElementById('canvas');
	console.log(canvas);
}
get_json();