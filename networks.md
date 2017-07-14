---
layout: default
permalink: /transport_networks/
---
<h2><b>Network Properties of Transport Systems</b></h2>

{% include network.html %} 


<h3><b>Studying system structures through networks</b></h3>
The study of networks has been


<h3><b>Transport Systems as Networks</b></h3>


<h3><b>Constructing a Graph from GTFS data</b></h3>

General Transit Feed Specification [GTFS](https://developers.google.com/transit/gtfs/){:target="_blank"} is a standard format to desseminate transit geospatial and timetable data. It was developed by the Tri-County Metropolitan Transportation District of Oregon and Google. A GTFS feed is composed of a series of text files relating to stops, routes, trips, and in some cases fare information. These files are stored together in a ZIP file.

The GTFS for the cities visualized here were retrieved from [transitland](https://transit.land){:target="_blank"}. To construct the metro networks a python script was developed that takes advantage of the functions provided by [urbanaccess tool](https://udst.github.io/urbanaccess/index.html){:target="_blank"} and [networkx](http://networkx.readthedocs.io/en/latest/){:target="_blank"} to read all GTFS feeds as a dataframe and create a travel time weight graph and run different centrality measures. 

The results were then exported to a geojson file and a 


<h3><b>Measuring Robustness</b></h3>
Robustenss refers to the ability of a system to maintain its stability despite disruption at a local level. 

[get the PDF]({{ site.url }}/assets/mydoc.pdf)


