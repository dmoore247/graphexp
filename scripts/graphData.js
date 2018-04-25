/*
Copyright 2018 Douglas Moore

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Main module. Handle the viualization, display data and layers.

var graph_data = (function () {
	"use strict";
	
	var options = {};
	var _nodes = {};
	var _edges = {};

	function init() {
		// initialize data set
		_nodes = new vis.DataSet(options);
		_edges = new vis.DataSet(options);
	}

	function clear() {
		// clear data set
		_nodes.clear();
		_edges.clear();
	}

	function add(d) {
		_nodes.add(d.nodes);
		_edges.add(d.edges);
	}

	function update(d) {
		_nodes.update(d.nodes);
		_edges.update(d.edges);
	}

	function node(id) {
		return _nodes.get(id);
	}

	function edge(id) {
		// return edge by id
		return _edges.get(id);
	}

	function data() {
		return { nodes: _nodes, edges: _edges };
	}

	return {
		init: init, 	// initialize collections
		clear: clear, 	// clear the data set
		update: update, // accept { nodes: Array(), edges: Array() }
		data: data, 	// return { nodes: Array(), edges: Array() }
		node: node,		// return { <node object> }
		edge: edge,		// return { <edge object> }
	};

})();
