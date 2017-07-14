---
layout: default
permalink: /transport_networks/

---

<h2><b>Network Properties of Transport Systems</b></h2>

{% include network.html %} 


<h3><b>Understanding Systems Through Networks</b></h3>
Different characteristic of complex systems arise as a result of the interactions between its constituent elements. The interactions, connections, dynamics, and processes within a system are the subject of network science, providing a system-level representation which can be based on logical relations. observed correlations, physical connections, etc. Modelling systems in temrs of their network structure cam help understand, predict, and optimize their real-world behaviour.

Network science builds upon graph theory, a branch of discrete mathematics. A graph is an abstract representation of a set of elements and the connection between them. Elements are represented by a vertices (nodes) and edges (links), such that $$ G = (V,E) $$, which can be encoded in a adjacency matrix $$A$$, such that:
<div style="text-align: center;">
<small>
$$
\begin{align*}
	A_{ij} = \begin{cases}
	1 & \quad \text{if nodes } i \text{ and } j \text{ are connected} \\
	0 & \quad \text{if nodes } i \text{ and } j \text{ are not connected} \\
	\end{cases}
\end{align*}
$$
</small>
</div>

Graphs can be weighted, meaning that their edges have a weight attribute to quantify some value, such as importance or impedance, between connected nodes. The weighted distance between two nodes is the sum of the weights of the path's edges. 

Network science is the study of typically real-world graphs, such as social networks, the internet, protein interactions, power grids, among many more. A great place to start is Newman's book: [Networks: An Introduction](http://www-personal.umich.edu/~mejn/networks-an-introduction/){:target="_pageblank"}. 

There are a number of measures that can be calculated from a network, such as the diameter (longest shortest path), average path length, density (connectance), centrality measures, communities, etc. Here we will only focus on three measures of centrality, as this can give us key measures of the topological properties of our system.
<div style="text-align: center;">
<small>
<b>Degree:</b> measures the number of links attached to a node.
</small>
<br>
<small>
<b>Closeness centrality:</b> how close if a node to all other nodes in the system.
</small>
<br>
<small>
<b>Betweenness centrality:</b> how many shortest paths pass through a node. 
</small>
</div>



<h3><b>Transport Systems as Networks</b></h3>
Networks that are constrained by some geometry and are embedded in two-or three dimensional space can be thought of as spatial networks. The constraints that space imposes can have important effects on their topological properties and in the processes which take place on them.

Urban Transport systems are temporal, spatial, and multilayered, and have a long history in network analysis. 

Critical nodes in these systems are those that not only bridge two clusters in the newtork, but also alo rapid flow between physically distant areas of the system.  

<h3><b>Constructing a Graph from GTFS data</b></h3>

General Transit Feed Specification [GTFS](https://developers.google.com/transit/gtfs/){:target="_blank"} is a standard format to desseminate transit geospatial and timetable data. It was developed by the Tri-County Metropolitan Transportation District of Oregon and Google. A GTFS feed is composed of a series of text files relating to stops, routes, trips, and in some cases fare information. These files are stored together in a ZIP file.

The GTFS for the cities visualized here were retrieved from [transitland](https://transit.land){:target="_blank"}. To construct the metro networks a python script was developed that takes advantage of the functions provided by [urbanaccess tool](https://udst.github.io/urbanaccess/index.html){:target="_blank"} and [networkx](http://networkx.readthedocs.io/en/latest/){:target="_blank"} to read all GTFS feeds as a dataframe and create a travel time weight graph and run different centrality measures. The travel time weighted graphs were saved as a graphml file and can be access [here]({{site.url}}/assets/graphml){:target="_blank"}.

The results were exported to a geojson file and visualized using javascript and [leaflet](http://leafletjs.com/){:target="_blank"}

<h3><b>Measuring Robustness</b></h3>
Robustenss refers to the ability of a system to maintain its stability despite disruption at a local level. 


<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>