/*
Copyright 2017 Benjamin RICAUD

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

var graph_viz = (function () {
	"use strict";

	var _label = ''; 	// DOM location for visual.
	var _netvisual = {}; // for visjs.org
	var _menu = [];		// contextMenu.js

	function init(label) {
		_label = label;
	}

	///////////////////////////////////////
	// Remove force layout and data
	function clear() {
		if (_netvisual && _netvisual != {} && _netvisual.destroy) {
			_netvisual.destroy();
			_netvisual = {};
			$('.menuContainer').contextMenu('destroy');
			_menu = [];
		}
	}

	function status(message) {
		$('#messageArea').html("<h3>" + message + "</h3>");
	}

	// install context menu
	function init_context_menus() {
		_menu.push( { name: 'Show Neighbors', fun: function() {showNeighbors(_netvisual.getSelectedNodes())}});
		_menu.push( { name: 'Show Full Lineage', fun: function() {showLineage(_netvisual.getSelectedNodes())}});
		_menu.push( { name: 'Show Decendents', fun: function() {showDecendents(_netvisual.getSelectedNodes())}});
		_menu.push( { name: 'Show Ancestors', fun: function() {showAncestors(_netvisual.getSelectedNodes())}});
		_menu.push( { name: 'Cluster Node', fun: function() {clusterByNodeId(_netvisual.getSelectedNodes())}});
		_menu.push( { name: 'UnCluster Node', fun: function() {unClusterByNodeId(_netvisual.getSelectedNodes())}});
		$('.menuContainer').contextMenu(_menu, { triggerOn: 'contextmenu' });
	}

	function showNeighbors(nodes) {
		console.log("Show Neighbors");
		if (nodes.length > 0) {
			_netvisual.storePositions();
			graphioGremlin.neighbors_query({ id: nodes[0] });
		}
	}

	function showLineage(nodes) {
		console.log("Show Lineage");
		if (nodes.length > 0) {
			_netvisual.storePositions();
			graphioGremlin.lineage_query({ id: nodes[0] });
		}
	}

	function showDecendents(nodes) {
		console.log("Show Decendents");
		if (nodes.length > 0) {
			_netvisual.storePositions();
			graphioGremlin.decendents_query({ id: nodes[0] });
		}
	}

	function showAncestors(nodes) {
		console.log("Show Ancestors");
		if (nodes.length > 0) {
			_netvisual.storePositions();
			graphioGremlin.ancestors_query({ id: nodes[0] });
		}
	}
	// cluster entire network
	function cluster() {
		if (_netvisual) {
			_netvisual.clusterByHubsize();
			_netvisual.clusterOutliers();
		}
	}

	function clusterByNodeId(nodes) {
		console.log("Cluster");
		if (nodes.length > 0) {
			_netvisual.clusterByConnection(nodes[0]);
		}
	}

	function unClusterByNodeId(nodes) {
		console.log("unCluster");
		if (nodes.length > 0) {
			_netvisual.openCluster(nodes[0]);
		}
	}

	function refresh_data(d, query_type) {

		status("redrawing");
		var label_property = "name";
		var label_property2 = "type";
		const text_property = "text";

		// console.log(d);
		graph_data.update({
			nodes: d.nodes.map(v => ({
				id: v.id,      	// vertex id
				group: v.label, // vertex shape or icon
				// text label
				label: (v.properties[label_property]) ? v.properties[label_property][0].value : v.properties[label_property2][0].value,
				properties: v.properties
			})),
			edges: d.edges.map(e => ({ id: e.id, from: e.source, to: e.target, properties: e.properties, arrows: 'to', label: e.label }))
		});

		// map graph data set edges to internal edges.
		var dataIO = graph_data.data();
		var containerIO = document.getElementById(_label);
		if (jQuery.isEmptyObject(_netvisual)) {
			status("New drawing");
			init_context_menus();
			_netvisual = new vis.Network(containerIO, dataIO, graph_options);
			_netvisual.on("selectNode", function (params) {
				if (params.nodes.length > 0 && params.nodes[0] && !_netvisual.isCluster(params.nodes[0])) {
					infobox.display_info(graph_data.node(params.nodes[0]));
				}
			});
			/*
			// removing this makes nodes more selectable with larger 
			_netvisual.on("selectEdge", function (params) {
				infobox.display_info(graph_data.edge(params.edges[0]));
			});
			*/
			_netvisual.on("doubleClick", function (params) {
				showNeighbors(params.nodes);
			});
			_netvisual.on("startStabilizing", function (params) {
				//console.log("startStabilizing");
			});
			_netvisual.stabilize(50);
			_netvisual.startSimulation();
		} else {
			status("redrawing");
			_netvisual.setData(dataIO);
			status("");
		}
	}

	return {
		init: init,
		clear: clear,
		status: status,
		refresh_data: refresh_data,
		cluster: cluster
	};

})();
