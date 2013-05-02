define([
	'underscore',
	'backbone',
	'jquery',
	'd3',
	'sankey',
	'VistaToolTip',
	'VistaEjesXY'
	], function(_, Backbone,$, d3,d3sankey, VistaToolTip, VistaEjesXY){

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
			this.svg = this.options && this.options.svg ? this.options.svg : document.createElementNS('http://www.w3.org/2000/svg', "g");
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
			//this.tooltip = new VistaToolTip();
			this.tooltip = new VistaToolTip();
			this.tooltip.message = this.tootipMessage;

			this.color = d3.scale.category20();

			// append the svg canvas to the page
			this.svg
			    .attr("width", this.width + this.margin.left + this.margin.right)
			    .attr("height", this.height + this.margin.top + this.margin.bottom)
			  .append("g")
			    .attr("transform", 
			          "translate(" + this.margin.left + "," + this.margin.top + ")");


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
			var formatNumber = d3.format(",.0f");

			var msg = d.key + " - "  + d.value;

			return msg;

		}, 

		/**
		* Despliegue inicial de elementos gráficos.
		*/
		render: function() {
			var self = this; // Auxiliar para referirse a this en funciones callback
			self = this; // Para hacer referencia a "this" en callback functions


			this.nodes = this.svg.selectAll("rect")
				.data(this.data)
				.enter()
				.append("rect")
					.attr("x", 0)
					.attr("y", function(d,i) {return i*30})
					.attr("width", this.width)
					.attr("height", 25)
					.attr("fill", function(d,i) {return self.color(i)})
					.on("mouseenter", function(d) {
						self.tooltip.show(d)
					})
					.on("mouseout", function(d) {
						self.tooltip.hide()
					})


		}

	});
  
  return Visualizador;
});

