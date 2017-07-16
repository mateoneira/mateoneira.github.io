---
layout: default
permalink: /transport_networks/
excerpt: Networks that are constrained by some geometry and are embedded in two-or three dimensional space can be thought of as spatial networks. The constraints that space imposes can have important effects on their topological properties and in the processes which take place on them. Here we explore centrality measures of the metro systems of London, New York, Chicago, and Santiago de Chile. The time-weighted graphs were constructed using publicly available GTFS data and visualized using javascript. 

---

<h2><b>Network Properties of Transport Systems</b></h2>

{% include network.html %} 


<h3><b>Understanding Systems Through Networks</b></h3>
Different characteristic of complex systems arise as a result of the interactions between its constituent elements. Network science studies these interactions and their connections, dynamics, and processes providing a system-level representation which can be based on logical relations, observed correlations, physical connections, etc. Modelling systems in terms of their network structure can help understand, predict, and optimize their real-world behaviour.

Network science builds upon graph theory, a branch of discrete mathematics. A graph is an abstract representation of a set of elements and the connection between them. Elements are represented by a vertices ($$v$$), also called nodes, and edges ($$e$$), also refered to as links. A graph, $$ G = (V,E) $$, can be encoded in a adjacency matrix $$A$$, such that:
<div style="text-align: center;">
<small>
$$
\begin{align*}
	A_{ij} = \begin{cases}
	1 & \quad \text{if there's a connection from } j \text{ to } i \\
	0 & \quad \text{if there is no connection between } j \text{ to } i\\
	\end{cases}
\end{align*}
$$
</small>
</div>

Graphs can be weighted, meaning that their edges have a weight attribute to quantify some value, such as importance or impedance, between connected vertices. The weighted distance between two vertices is the sum of the weights of the path's edges. 

Network science is the study of typically real-world graphs, such as social networks, the internet, protein interactions, power grids, among many more. The connection topology of networks can lie between completely random or completely regular, but many social, technological, and biological networks lie somewhere in between these two extremes, exhibiting 'small-world' properties. 

There are a number of measures that can be calculated from a network, such as the diameter (longest shortest path), average path length, density (connectance), centrality measures, communities, etc. Here we will only focus on three measures of centrality, as this can give us key measures of the topological properties of our system. These are:
<ul>
	<li><small><b>Degree:</b> measures the number of links attached to a node.
	</small></li>
	<li><small><b>Closeness centrality:</b> how close if a node to all other nodes in the system.
	</small></li>
	<li><small><b>Betweenness centrality:</b> how many shortest paths pass through a node.
	</small></li>
</ul>

For a more indepth view of networks and their applications check out: [Networks: An Introduction](http://www-personal.umich.edu/~mejn/networks-an-introduction/){:target="_pageblank"}. by Mark Newman.

<h3><b>Transport Systems as Networks</b></h3>
Networks that are constrained by some geometry and are embedded in two-or three dimensional space can be thought of as spatial networks. The constraints that space imposes can have important effects on their topological properties and in the processes which take place on them.

Urban Transport systems are temporal, spatial, and multilayered, and have a long history in network analysis. One of the simplest abstractions of these systems is representing stops as nodes and physical links between then as edges, called the primal graph. There are other ways of representing such systems, such as L and P-spaces, or Dual-graphs. Here we will be representing the metro systems as primal graphs weighted by travel time between stations.

One of the advantages of using this network representation is that it allows us to define critical nodes in these systems. Critical nodes are those that not only bridge two clusters in the newtork, but also allow rapid flow between physically distant areas. 

<h3><b>Constructing a Graph from GTFS data</b></h3>

General Transit Feed Specification [GTFS](https://developers.google.com/transit/gtfs/){:target="_blank"} is a standard format to desseminate transit geospatial and timetable data. It was developed by the Tri-County Metropolitan Transportation District of Oregon and Google. A GTFS feed is composed of a series of comma-seperated text files relating to stops, routes, trips, and in some cases fare information. These files are stored together in a ZIP file.

The GTFS for the cities visualized here were retrieved from [transitland](https://transit.land){:target="_blank"}. To construct the networks a python script was developed that takes advantage of the functions provided by [urbanaccess tool](https://udst.github.io/urbanaccess/index.html){:target="_blank"} and [networkx](http://networkx.readthedocs.io/en/latest/){:target="_blank"}. The GTFS feeds were read, converted into a time-weighted graph based on the time-tables provided in the feeds, and the three network properties (degree, closeness, and betweenness) were derived. The edges and nodes along with their attributes were saved as geoJSON files to be visualized using [leaflet](http://leafletjs.com/){:target="_blank"}. 

The travel time weighted graphs can be accessed [here]({{site.url}}/assets/graphml){:target="_blank"} as graphml files.

For an other similar project, check out [Tyler Green's transit app](https://gtfs-graph.herokuapp.com/rank/boston/){:target="_blank"}


<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>