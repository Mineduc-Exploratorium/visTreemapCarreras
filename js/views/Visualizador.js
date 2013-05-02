// visTreemapCarreras
define([
	'underscore',
	'backbone',
	'jquery',
	'd3',
	'sankey',
	'VistaTooltip',
	'VistaEjesXY',
	'views/LayoutCarreras'
	], function(_, Backbone,$, d3,d3sankey, VistaTooltip, VistaEjesXY, LayoutCarreras){


	var Visualizador = Backbone.View.extend(
		/** @lends Visualizador.prototype */
		{

		/**
		* @class VistaPrincipal vista que despliega visualizacion de ingresos vs costos de carreras
		*
		* @augments Backbone.View
		* @constructs
		*
		* @param {object} options parametros de incializacion
		* @param {array} options.data arreglo con datos (cada dato es un objeto con atributos)
		* @param {d3.select()} options.svg elemento SVG utilizado como contenedor del gráfico
		* @param {Backbone.View} options.tooltip vista utilizada como tooltip
		* Visualizador Inicia parametros de configuración y llamada a datos
		*/
		initialize: function() {
			this.data = this.options && this.options.data ? this.options.data : [];

			// Binding de this (esta vista) al contexto de las funciones indicadas
			_.bindAll(this,"render", "tootipMessage")

			// Alias a this para ser utilizado en callback functions
			var self = this; 
			
			// Configuración de espacio de despliegue de contenido en pantalla
			this.margin = {top: 20, right: 20, bottom: 30, left: 20},
	    	this.width = 1000 - this.margin.left - this.margin.right,
	    	this.height = 400 - this.margin.top - this.margin.bottom;

	   		this.color = d3.scale.category20c();

			// Vista con tooltip para mostrar datos del item respectivo
			//this.tooltip = new VistaTooltip();
			this.tooltip = new VistaTooltip();
			this.tooltip.message = this.tootipMessage;


			this.render();
	 
		},

		/**
		* Reescribe función generador de mensajes utilizado en herramienta de tooltip
		* tooltip.tooltipMessage(data) 	
		*
		* @param {object} data objeto con atributos (Ej: {nombre: "Juan", Edad: 18}) utilizados en la creación del mensaje a desplegar por tooltip
		* @returns {string} Mensaje (html) a ser utilizado por tooltip
		*/
		tootipMessage : function(d) {
			// Atributos
			// CODIGO_UNICO	TIPO_INSTITUCION	INSTITUCION	SEDE	REGION	CARRERA	HORARIO	NOTAS_EM	PRUEBA_LENGUAJE	PRUEBA_MATEMATICAS	PRUEBA_HISTORIA	PRUEBA_CIENCIAS	OTROS	VACANTES_PRIMER_SEMESTRE	VACANTES_SEGUNDO_SEMESTRE	VALOR_MATRICULA	VALOR_ARANCEL	DURACION_SEMESTRES	AREA	ACREDITACION_CARRERA
			var msg = "<strong>"+d["TIPO_INSTITUCION"]+"</strong>";
			msg += "<br>"+d["INSTITUCION"];
		 	msg += "<br> <span class='text-info'>"+d["CARRERA"]+"</span>";
			msg += "<br>"+"<span class='muted'>"+d.SEDE+"</span>";
			msg += "<br>"+"<span class='muted'>"+d.HORARIO+"</span>";
			msg += "<br>"+"<span class='muted'>Matriculados: "+d["TOTAL_MATRICULADOS"]+"</span>";
			msg += "<br>"+"<span class='muted'>Acreditación: "+d["ACREDITACION_CARRERA"]+"</span>";

			return msg;
		}, 

		/**
		* Despliegue inicial de elementos gráficos.
		*/
		render : function() {
			var self = this;

			var treeCarreras = LayoutCarreras()
				.size([this.width, this.height])

			// Total de nodos con información de x, y, dx, dy
			var nodes = treeCarreras.nodes(this.data);

			// Títulos de grupos [{title: "CFT", width:56}, ... ]
			var titles = treeCarreras.titles();

			var color = d3.scale.ordinal()
				.range(["blue", "red"]);

			var legendPlaceHolder = d3.select(this.el).append("div")
			    .style("position", "relative")
			    .style("width", (self.width + self.margin.left + self.margin.right) + "px")
			    //.style("height", 40 + "px")
			    .style("left", self.margin.left + "px")
			    .style("top", self.margin.top + "px")
			    .style("margin", 10 + "px");

			// Div principal
			var mainDiv = d3.select(this.el).append("div")
			    .style("position", "relative")
			    .style("width", (self.width + self.margin.left + self.margin.right) + "px")
			    .style("height", (self.height + self.margin.top + self.margin.bottom) + "px")
			    .style("left", self.margin.left + "px")
			    .style("top", self.margin.top + "px");

			formatNumber = d3.format(",d");



			// Barra con Títulos de cada grupo
			mainDiv.append("div")
				.style("position", "relative")
			    .style("width", self.width + "px")
			    .style("height", 40 + "px")
			    .style("left", 0 + "px")
			    .style("top", 0 + "px")
			    .selectAll("div")
			    .data(titles)
			    .enter()
			    	.append("div")
			    	.style("float", "left")
			    	.style("position", "relative")
			    	.style("width", function(d) {return d.width+"px"})
			    	.append("div")
			    	//.style("height", 40 + "px")
			    		.attr("class", "etiqueta")
			    		.html(function(d) {return d.title +"<br>"+formatNumber(d.size) + " estudiantes"});


			// Despliegue de los nodos de carreras
			mainDiv.selectAll(".node")
				.data(nodes)
				.enter()
					.append("div")
			  		.attr("class", function(d) {
			  			// Si son carreras
					  	if (d.depth == 1) {
					  		return d.ACREDITACION_CARRERA == "Acreditada" ? "node leaf acreditada" : "node leaf noacreditada"
					  	} else  {
					  		return "node notleaf"
					  	}
			  		})
					.call(position)
					.style("background", function(d) { return (!d.values && d.depth==1) ? color(d.ACREDITACION_CARRERA) : null; })
					.text(function(d) { return d.children ? null : d.key; })
					.on("mouseenter", function(d) {
							self.tooltip.show(d)}
							)
						.on("mouseleave", function(d) {self.tooltip.hide()})
					
			//var legendView = new legendHTML({el:legendPlaceHolder[0][0], scale : color})


			function position() {
			  this.style("left", function(d) { return d.x + "px"; })
			      .style("top", function(d) { return d.y +40 + "px"; })
			      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
			      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
			}
			
		},


	});
  
  return Visualizador;
});

