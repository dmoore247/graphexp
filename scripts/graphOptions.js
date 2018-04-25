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

// visjs.org Network Graph Visualizaiton options and groups (icons)

var graph_options = {
	edges: {
		arrows: {
			to: {
				scaleFactor: 1
			}
		},
		selectionWidth: 0.1
	},
	layout: {
		randomSeed: 1,
		improvedLayout: false,
		hierarchical: {
			enabled: false,
			levelSeparation: 150,
			nodeSpacing: 200,
			treeSpacing: 400,
			blockShifting: true,
			edgeMinimization: true,
			parentCentralization: true,
			direction: 'LR',        // UD, DU, LR, RL
			sortMethod: 'directed'   // hubsize, directed
		},
	},
	physics: {
		enabled: true,
		barnesHut: {
			gravitationalConstant: -2000,
			centralGravity: 0.3,
			springLength: 95,
			springConstant: 0.04,
			damping: 0.09,
			avoidOverlap: 0
		},
		forceAtlas2Based: {
			gravitationalConstant: -50,
			centralGravity: 0.01,
			springConstant: 0.08,
			springLength: 100,
			damping: 0.4,
			avoidOverlap: 0
		},
		repulsion: {
			centralGravity: 0.2,
			springLength: 200,
			springConstant: 0.05,
			nodeDistance: 100,
			damping: 0.09
		},
		hierarchicalRepulsion: {
			centralGravity: 0.0,
			springLength: 100,
			springConstant: 0.01,
			nodeDistance: 120,
			damping: 0.09
		},
		maxVelocity: 50,
		minVelocity: 0.1,
		solver: 'barnesHut',
		stabilization: {
			enabled: true,
			iterations: 100,
			updateInterval: 100,
			onlyDynamicEdges: false,
			fit: false
		},
		timestep: 0.5,
		adaptiveTimestep: true
	},
	groups: {
		USER: {
			shape: 'icon',
			icon: {
				face: 'FontAwesome',
				code: '\uf007',
				size: 50,
				color: '#aa00ff'
			}
		},
		DATABASE: {
			shape: 'icon',
			icon: {
				face: 'FontAwesome',
				code: '\uf1c0',
				size: 50,
				color: '#aa00ff'
			}
		},
		TABLE: {
			shape: 'icon',
			icon: {
				face: 'FontAwesome',
				code: '\uf0ce',
				size: 50,
				color: '#aa0000'
			}
		},
		SQL: {
			shape: 'icon',
			icon: {
				face: 'FontAwesome',
				code: '\uf1c9',
				size: 50,
				color: '#aa00ff'
			}
		}
	}
};