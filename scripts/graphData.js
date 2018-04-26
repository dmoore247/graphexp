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

	// return graphio version of node
	function graphNode(id) {
		var v = node(id);
		return {
			id: v.id,
			label: v.group,
			properties: v.properties
		};
	}

	function edge(id) {
		// return edge by id
		return _edges.get(id);
	}

	function data() {
		return { nodes: _nodes, edges: _edges };
	}

	// take in graph data, convert to visjs.Network data structure
	function refresh_data(d) {
		const label_property = "name";
		const label_property2 = "type";
		const text_property = "text";

		console.log('refresh_data', d);
		_nodes.update(d.nodes.map(v => ({
			id: v.id,      	// vertex id
			group: v.label, // vertex shape or icon
			// text label
			label: (v.properties[label_property]) ? v.properties[label_property][0].value : v.properties[label_property2][0].value,
			properties: v.properties
		})));
		_edges.update(d.edges.map(e => ({ id: e.id, from: e.source, to: e.target, properties: e.properties, arrows: 'to', label: e.label })));
	}

	// Last one in wins?
	function subscribe(fun) {
		//console.log('subscribe', fun);
		_edges.on('*', fun);
	}

	return {
		init: init, 	// initialize collections
		clear: clear, 	// clear the data set
		update: update, // accept { nodes: Array(), edges: Array() }
		refresh_data: refresh_data, // accept graph data
		data: data, 	// return { nodes: Array(), edges: Array() }
		node: node,		// return { <node object> }
		graphNode: graphNode,  // return graphio version of node
		edge: edge,		// return { <edge object> }
		subscribe: subscribe // subscribe to data updates
	};

})();
