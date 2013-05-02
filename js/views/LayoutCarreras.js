define([
  'underscore',
  'd3',
	], function(_, d3){

	var LayoutCarreras = function(data) {
		var layout = {};
		var size = [1,1];
		var sizeAttribute = "TOTAL_MATRICULADOS";
		var categoryAttribute = "ACREDITACION_CARRERA";
		var groupAttribute = "TIPO_INSTITUCION";
		var titles = [];


		layout.nodes = function(data) {
			var dataGroups = createDataGroups(data);

			// sizes  : Objeto con los tamaños de cada grupo
			// Ej. sizes = {"CFT": 120340, "IP": 45687, ...}
			var sizes = calculateGroupSizes(dataGroups);

			// totalSize tamaño total de todos los nodos (Ej totalSize = 956875)
			var totalSize = calculateTotalSize(data);

			// ancho y alto del área de despliegue
			var w = size[0];
			var h = size[1];

			// Arreglo con las obicaciones de cada nodo
			var nodes = []

			var nextX = 0;  // Position of next group Node
			_.each(d3.keys(sizes), function(key) {
				var groupNode = {};
				groupNode.dx = w*sizes[key]/totalSize;
				groupNode.dy = h;
				groupNode.x = nextX;
				nextX = nextX + groupNode.dx;
				groupNode.y = 0;
				groupNode.depth = 0
				nodes.push(groupNode);

				var groupNodes = createGroupNodes(dataGroups[key], groupNode.x, groupNode.y, groupNode.dx, groupNode.dy, sizes[key]);
				nodes = nodes.concat(groupNodes);

			})

			// Genera un arreglo con texto y ancho de cada titulo
			titles = createTitles(sizes, totalSize);

			return nodes;
		};

		layout.size = function(_) {
		    if (!arguments.length) return size;
		    size = _;
		    return layout;
		}

		layout.titles = function() {
			return titles;
		}

		createTitles = function(sizes, totalSize) {
			var titles = [];

			_.each(d3.keys(sizes), function(key) {
				var w = size[0];

				var title = {}
				title.title = key;
				title.width = w*sizes[key]/totalSize;
				title.size = sizes[key];

				titles.push(title);
			});

			return titles;
		}

		createDataGroups = function(data) {
			// Agrupar datos según agrupaciones
			dataGroups = _.groupBy(data, function(d) {return d[groupAttribute]});

			return dataGroups;
		}

		calculateGroupSizes = function(dataGroups) {

			// Objeto con los tamaños de cada grupo
			var sizes = {};

			_.each(d3.keys(dataGroups), function(key) {
				sizes[key] = _.reduce(dataGroups[key], function(memo, d) {
					return +d[sizeAttribute] + memo;
				}, 0);
			})
			return sizes;
		}

		calculateTotalSize = function(data) {
			var totalSize =  _.reduce(data, function(memo, d) {
					return +d[sizeAttribute] + memo;
				}, 0);
			return totalSize;
		}

		createGroupNodes = function(groupData, left, top, width, height, groupSize) {
			// Groups: CFT, IP, ...
			// Categories : Acredidata, No Acreditada

			var withinGroupCategories = _.groupBy(groupData, function(d) {
				return d[categoryAttribute];
			});

			var categories = _.sortBy(d3.keys(withinGroupCategories), function(d) {
				return d;
			});

			nodes = [];

			var nextY = 0
			_.each(categories, function(category) {
				var categorySize = _.reduce(withinGroupCategories[category], function(memo, d) {
					return +d[sizeAttribute] + memo;
				}, 0);

				
				var categoryNode = {};
				categoryNode.dx = width;
				categoryNode.dy = height*categorySize/groupSize;
				categoryNode.x = left;
				categoryNode.y = nextY;
				nextY = nextY + categoryNode.dy;
				
				categoryNode.depth = 0
				nodes.push(categoryNode);

				var nestedData = d3.nest()
					.key(function(d) {return category})
					.entries(withinGroupCategories[category]);
						 
				var treemap = d3.layout.treemap()
					.size([categoryNode.dx, categoryNode.dy])
					.sticky(true)
					.children(function(d) {return d.values })
					.value(function(d) { return d[sizeAttribute]; });

				var mapNodes = treemap.nodes(nestedData[0]);

				// Trasladar la posición de cada nodo en función del origen left, top
				mapNodes = _.map(mapNodes, function(d) {
					d.x = d.x+left;
					d.y = d.y+top+categoryNode.y;
					return d
				})

				nodes = nodes.concat(mapNodes);

			});




			return nodes;
		}

		return layout
	}



  
  return LayoutCarreras;
});

