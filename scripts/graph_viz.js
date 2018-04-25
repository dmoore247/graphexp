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

	var _label = ''; // DOM location for visual.
	var _netvisual = {}; // for visjs.org
	var _svg = {};
	var _svg_width = 0;
	var _svg_height = 0;
	var _nodes = {};
	var _edges = {};
	var _Nodes = [];
	var _edges = [];


	function init(label) {
		console.log("Init " + label);
		_label = label;
	}

	///////////////////////////////////////
	// Remove force layout and data
	function clear() {
		if (_netvisual) {
			_netvisual.destroy();
			_netvisual = {};
		}
		layers.clear_old();
	}

	function status(message) {
		$('#messageArea').html("<h3>"+message+"</h3>");
	}

	function cluster() {
		if (_netvisual) {
			_netvisual.clusterByHubsize();
		}
	}


	//////////////////////////////////////////////////////////////
	var layers = (function () {
		// Submodule that handles layers of visualization

		var nb_layers = default_nb_of_layers;
		var old_Nodes = [];
		var old_edges = [];

		function set_nb_layers(nb) {
			nb_layers = nb;
		}

		function depth() {
			return nb_layers;
		}

		function push_layers() {
			// old edges and nodes become older
			// and are moved to the next deeper layer
			for (var k = nb_layers; k > 0; k--) {
				var kp = k - 1;
				_svg.selectAll(".old_edge" + kp).classed("old_edge" + k, true);
				_svg.selectAll(".old_node" + kp).classed("old_node" + k, true);
				_svg.selectAll(".old_edgepath" + kp).classed("old_edgepath" + k, true);
				_svg.selectAll(".old_edgelabel" + kp).classed("old_edgelabel" + k, true);
			};
		}

		function clear_old() {
			old_Nodes = [];
			old_edges = [];
		}

		function update_data(d) {
			// Save the data
			var previous_nodes = _svg.selectAll("g").filter(".active_node");
			var previous_nodes_data = previous_nodes.data();
			old_Nodes = updateAdd(old_Nodes, previous_nodes_data);
			var previous_edges = _svg.selectAll(".active_edge");
			var previous_edges_data = previous_edges.data();
			old_edges = updateAdd(old_edges, previous_edges_data);

			// handle the pinned nodes
			var pinned_Nodes = _svg.selectAll("g").filter(".pinned");
			var pinned_nodes_data = pinned_Nodes.data();
			// get the node data and merge it with the pinned nodes
			_Nodes = d.nodes;
			_Nodes = updateAdd(_Nodes, pinned_nodes_data);
			// add coordinates to the new active nodes that already existed in the previous step
			_Nodes = transfer_coordinates(_Nodes, old_Nodes);
			// retrieve the edges between nodes and pinned nodes
			_edges = d.edges.concat(previous_edges_data); // first gather the edges
			_edges = find_active_edges(_edges, _Nodes); // then find the ones that are between active nodes

		}

		function updateAdd(array1, array2) {
			// Update lines of array1 with the ones of array2 when the elements' id match
			// and add elements of array2 to array1 when they do not exist in array1
			var arraytmp = array2.slice(0);
			var removeValFromIndex = [];
			array1.forEach(function (d, index, thearray) {
				for (var i = 0; i < arraytmp.length; i++) {
					if (d.id == arraytmp[i].id) {
						thearray[index] = arraytmp[i];
						removeValFromIndex.push(i);
					}
				}
			});
			// remove the already updated values (in reverse order, not to mess up the indices)
			removeValFromIndex.sort();
			for (var i = removeValFromIndex.length - 1; i >= 0; i--)
				arraytmp.splice(removeValFromIndex[i], 1);
			return array1.concat(arraytmp);
		}

		function find_active_edges(list_of_edges, active_nodes) {
			// find the edges in the list_of_edges that are between the active nodes and discard the others
			var active_edges = [];
			list_of_edges.forEach(function (row) {
				for (var i = 0; i < active_nodes.length; i++) {
					for (var j = 0; j < active_nodes.length; j++) {
						if (active_nodes[i].id == row.source.id && active_nodes[j].id == row.target.id) {
							var L_data = { source: row.source.id, target: row.target.id, type: row.type, value: row.value, id: row.id };
							var L_data = row;
							L_data['source'] = row.source.id;
							L_data['target'] = row.target.id;
							active_edges = active_edges.concat(L_data);
						}
						else if (active_nodes[i].id == row.source && active_nodes[j].id == row.target) {
							var L_data = row;
							active_edges = active_edges.concat(L_data);
						}
					}
				}
			});
			// the active edges are in active_edges but there can be some duplicates
			// remove duplicates edges
			var dic = {};
			for (var i = 0; i < active_edges.length; i++)
				dic[active_edges[i].id] = active_edges[i]; // this will remove the duplicate edges (with same id)
			var list_of_active_edges = [];
			for (var key in dic)
				list_of_active_edges.push(dic[key]);
			return list_of_active_edges;
		}


		function transfer_coordinates(Nodes, old_Nodes) {
			// Transfer coordinates from old_nodes to the new nodes with the same id
			for (var i = 0; i < old_Nodes.length; i++) {
				var exists = 0;
				for (var j = 0; j < Nodes.length; j++) {
					if (Nodes[j].id == old_Nodes[i].id) {
						Nodes[j].x = old_Nodes[i].x;
						Nodes[j].y = old_Nodes[i].y;
						Nodes[j].fx = old_Nodes[i].x;
						Nodes[j].fy = old_Nodes[i].y;
						Nodes[j].vx = old_Nodes[i].vx;
						Nodes[j].vy = old_Nodes[i].vy;
					}
				}
			}
			return Nodes;
		}

		return {
			set_nb_layers: set_nb_layers,
			depth: depth,
			push_layers: push_layers,
			clear_old: clear_old,
			update_data: update_data
		}
	})();

	function refresh_data(d, center_f, with_active_node) {

		status("redrawing");
		var label_property = "name";
		var label_property2 = "type";
		const text_property = "text";

		console.log(d);
		graph_data.update( {
			nodes: d.nodes.map(v => ({ 
				id: v.id,      	// vertex id
				group: v.label, // vertex shape or icon
				// text label
				label: (v.properties[label_property]) ? v.properties[label_property][0].value : v.properties[label_property2][0].value,
				properties: v.properties
			})),
			edges: d.edges.map(e => ({id: e.id, from:e.source, to:e.target, properties: e.properties, arrows:'to', label:e.label}))
		});

		// map graph data set edges to internal edges.
		var dataIO = graph_data.data();
		var containerIO = document.getElementById(_label);
		console.log("Draw:")
		console.log(_label, containerIO, dataIO, graph_options);
		if (jQuery.isEmptyObject(_netvisual)) {
			status("New drawing");
			_netvisual = new vis.Network(containerIO, dataIO, graph_options);
			_netvisual.on("selectNode", function (params) {
				infobox.display_info(graph_data.node(params.nodes[0]));
			});
			_netvisual.on("selectEdge", function (params) {
				infobox.display_info(graph_data.edge(params.edges[0]));
			});
			_netvisual.on("doubleClick", function (params) {
				_netvisual.storePositions();
				graphioGremlin.click_query({id:params.nodes[0]});
			});
			_netvisual.on("startStabilizing", function (params) {
				console.log("startStabilizing");
			});
			_netvisual.stabilize(50);
			_netvisual.startSimulation();
		} else {
			status("redrawing");
			_netvisual.setData(dataIO);
			status("");
		}
	}

	function get_node_edges(node_id) {
		// Return the in and out edges of node with id 'node_id'
		var connected_edges = d3.selectAll(".edge").filter(
			function (item) {
				if (item.source == node_id || item.source.id == node_id) {
					return item;
				}
				else if (item.target == node_id || item.target.id == node_id) {
					return item;
				}
			});
		return connected_edges;
	}


	var graph_events = (function () {
		//////////////////////////////////
		// Handling mouse events

		function dragstarted(d) {
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d) {
			var connected_edges = get_node_edges(d.id);
			var f_connected_edges = connected_edges.filter("*:not(.active_edge)")
			if (f_connected_edges._groups[0].length == 0) {
				d.fx = d3.event.x;
				d.fy = d3.event.y;
			}
			else {
				f_connected_edges
					.style("stroke-width", function () { return parseInt(d3.select(this).attr("stroke-width")) + 2; })
					.style("stroke-opacity", 1)
					.classed("blocking", true)
			}
		}

		function dragended(d) {
			d3.selectAll(".blocking")
				.style("stroke-width", function () { return d3.select(this).attr("stroke-width"); })
				.style("stroke-opacity", function () { return d3.select(this).attr("stroke-opacity"); })
				.classed("blocking", false)
			// d.fx = null;
			// d.fy = null;
		}

		function clicked(d) {
			var input = document.getElementById("freeze-in");
			var isChecked = input.checked;
			if (isChecked) infobox.display_info(d);
			else {
				// remove the oldest edges and nodes
				var stop_layer = layers.depth() - 1;
				_svg.selectAll(".old_node" + stop_layer).remove();
				_svg.selectAll(".old_edge" + stop_layer).remove();
				_svg.selectAll(".old_edgepath" + stop_layer).remove();
				_svg.selectAll(".old_edgelabel" + stop_layer).remove();
				infobox.display_info(d);
				graphioGremlin.click_query(d);
				console.log('event!!')
			}
		}


		function pin_it(d) {
			d3.event.stopPropagation();
			var node_pin = d3.select(this);
			var pinned_node = d3.select(this.parentNode);
			//console.log('Pinned!')
			//console.log(pinned_node.classed("node"));
			if (pinned_node.classed("active_node")) {
				if (!pinned_node.classed("pinned")) {
					pinned_node.classed("pinned", true);
					console.log('Pinned!');
					node_pin.attr("fill", "#000");
					pinned_node.moveToFront();
				}
				else {
					pinned_node.classed("pinned", false);
					console.log('Unpinned!');
					node_pin.attr("fill", graphShapes.node_color);
				}
			}
		}

		return {
			dragstarted: dragstarted,
			dragged: dragged,
			dragended: dragended,
			clicked: clicked,
			pin_it: pin_it
		}

	})();

	return {
		init: init,
		clear: clear,
		status: status,
		refresh_data: refresh_data,
		layers: layers,
		graph_events: graph_events,
		cluster: cluster
	};

})();
