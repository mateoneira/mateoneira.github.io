---
layout: home
---

Hi, I’m Mateo.

<h1>I build ML systems</h1>

I hold a **PhD in Network Science** from [UCL](https://www.ucl.ac.uk/bartlett/casa/) and the [Alan Turing Institute](https://www.turing.ac.uk/), where I studied how graph structure and information propagation shape human behaviour. My research sits at the intersection of **graph theory, statistical modelling, and large-scale computation**.

I’m currently a **Senior Machine Learning Engineer** at [Vu.City](https://www.vu.city/), building ML systems for 3D city-scale reconstruction and semantic understanding. Previously, I spent 8 years at [Foster + Partners](https://www.fosterandpartners.com/) as an **Associate Partner**, leading data science and deploying ML pipelines that operated at an urban scale. Before that, I developed transport optimisation algorithms at [SignalBox](https://www.signalbox.io/).

Across research and industry, my work has centred on taking mathematically grounded ideas and turning them into **production systems that function under real-world constraints**: noisy data, long feedback loops, and high-stakes decisions. I operate end-to-end: from formulation and prototyping through to engineering, deployment, and stakeholder alignment.

I’m interested in problems that demand both mathematical depth and engineering rigour:
- graph-structured and high-dimensional data
- probabilistic modelling and inference
- systems where model decisions carry real consequences

<div class="writing-section">
<h2 class="writing-heading">WRITING</h2>

<div class="post-card">
<h3 class="post-card-title"><a href="{{site.url}}/the-alpha-blending-problem/">The Alpha-Blending Problem: Semantic Segmentation in 3D Gaussian Splatting</a></h3>
<p class="post-card-description">A survey of why making 3D Gaussian Splatting semantically meaningful is harder than it looks. Covers the core technical challenge — alpha-blending ambiguity at object boundaries — and the three paradigms that have emerged across the CVPR, ECCV, and ICCV 2024–25 literature: feature-field distillation, 2D-to-3D lifting, and identity-centric methods.</p>
</div>

<div class="post-card">
<h3 class="post-card-title"><a href="{{site.url}}/spatial-interaction-models/">Spatial Interaction Models</a></h3>
<p class="post-card-description">An in-depth exploration of spatial interaction models with interactive visualizations, covering their theoretical foundations, mathematical formulation, and practical applications in urban planning.</p>
</div>

<div class="post-card">
<h3 class="post-card-title"><a href="{{site.url}}/transport_networks/">Transport Networks</a></h3>
<p class="post-card-description">Interactive exploration of centrality measures of the metro systems of London, New York, Chicago, and Santiago de Chile. Time-weighted graphs constructed from publicly available GTFS data.</p>
</div>

</div>

<div class="papers-section">
<h2 class="writing-heading">PAPER NOTES</h2>

{% assign sorted_papers = site.papers | sort: "year" | reverse %}
{% for paper in sorted_papers limit:3 %}
<div class="paper-card">
<div class="paper-meta">{{ paper.authors | truncate: 60 }} &middot; {{ paper.year }} &middot; <em>{{ paper.venue }}</em></div>
<h3 class="post-card-title"><a href="{{ paper.url | relative_url }}">{{ paper.title }}</a></h3>
<p class="post-card-description">{{ paper.excerpt }}</p>
</div>
{% endfor %}

<p class="section-all-link"><a href="{{ site.url }}/papers/">All paper notes &rarr;</a></p>
</div>
