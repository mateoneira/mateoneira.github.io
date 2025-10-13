---
layout: default
permalink: /spatial-interaction-models/
excerpt: An in-depth exploration of spatial interaction models, covering their theoretical foundations, mathematical formulation, and practical applications in urban planning. This article includes interactive visualizations to build intuition about how these models predict human mobility patterns in cities.
---

<h2><b>The Art and Science of Estimating Mobility Flows</b></h2>

Predicting how people move, whether through daily routines or large-scale migrations, has been a central part of understanding cities since their inception. At an individual level, movement patterns can be chaotic and unpredictable, however, collectively certain order emerges. For example, the repeated pulse of a city, with people commuting to work roughly at the same time, and commuting back home. Almost like a heart beat. 

Understanding what shapes this order, and how to predict it, is central for answering important questions that help shape the cities of today:
* how many people will use a new rail line?
* Where should buses and trains be allocated during peak hours? 
* How do job centres influence residential patterns? 
* Where might disease spread due to human movement?

<b>Spatial interaction models</b> are among the most elegant frameworks for exploring these questions.

<h3><b>Interactive Exploration: Spatial Interaction Model</b></h3>

Let’s build some intuition with an interactive visualization. You can:
1. Click on blue cells (population centers) to increase their population
2. Click on green cells (job centers) to increase their job count
3. Adjust the distance decay parameter ($$\gamma$$) to see how it affects mobility flows

The intensity of the orange cells represents the predicted flow between origins and destinations based on the gravity model formula: $$T_{ij} = k \cdot O_i^\alpha \cdot D_j^\beta \cdot e^{-\gamma d_{ij}}$$

<div id="spatial-interaction-viz" class="spatial-interaction-container">
  <!-- Viz here -->
</div>

<script src="/assets/js/spatial-interaction.js"></script>

<h3><b> Exploring the Model Parameters </b></h3>

This visualization reveals the three key ingredients of spatial interaction models:

1. **Origin and Destination Masses**: The blue cells represent origin populations (like residential areas), while the green cells represent destination attractions (like job centers). Increasing these values changes total trip volumes.

2. **Distance Decay**: The $\gamma$ parameter controls how quickly the interaction probability falls with distance. Higher values mean distance has a stronger deterrent effect.

3. **Mass Sensitivity**: The $\alpha$ and $\beta$ parameters control how sensitive the model is to origin and destination masses. Higher values give more importance to larger origins or destinations.

As you experiment with the model, notice how:
- Increasing an origin's population creates more trips from that origin to all destinations
- Increasing a destination's attraction creates more trips to that destination from all origins
- Higher distance decay parameters result in more localized trips and fewer long-distance movements
- The model always predicts higher flows between large, nearby zones

This simple model captures the essential dynamics of human mobility, even with its mathematical simplicity.

<h3><b> A Brief History </b></h3>

The first models that help in answering these questions were introduced in the 19th century with Ravenstein's "Laws of Migration,". But it wasn't until the 1960s that Alan Wilson formalised these ideas using entropy-maximising models, treating mobility as a probabilistic process constrained by origins, destinations, and travel costs. Later, statisticians reframed these models as generalised linear models (GLMs) with Poisson or negative binomial links, bridging the theory with modern computational tools.

My own journey with spatial interaction models began around 2015 while researching active mobility in cities. During my Master’s at CASA in 2016, I dove deeper into their mechanics. In recent years, I’ve been experimenting with machine-learning variants, using neural networks to uncover new formulations. Across all this, I noticed a gap: most resources are either too technical (heavy on equations, light on intuition) or too abstract (theory with no guidance for calibration or validation).

This article is the guide I wish I’d had. A bridge between theory, mathematical intuition, and practical implementation.

<h3><b> I. Theoretical foundations: where gravity meets reality </b></h3>

*The elegance of gravity models*

At their core, spatial interaction models borrow from Newton, these models suggest that the flow of people between two places is proportional to the product of their "masses" (usually populations) and inversely proportional to some function of the distance between them. Larger cities pull in more movement, but as the separation increases, the gravitational pull becomes weaker. Historical pioneers like Reilly even extended these ideas to retail, coining notions like "retail gravitation." Yet, despite their mathematical elegance, these models are only as good as the assumptions that underlie them.

*The rise of machine-learned, closed form models*

In recent years, researchers have introduced a new contender: models discovered through machine learning and symbolic regression. These approaches, which extract closed-form equations directly from data, aim to bridge the gap between interpretability and predictive power. 

[Check out this paper, for example.](https://www.nature.com/articles/s41467-025-56495-5) 

Traditional gravity models are simple and interpretable, but can perform poorly on predictive accuracy. On the other end of the spectrum, machine learning / deep learning models have much better predictive power, but are opaque and hard to generalize and interpret. In contrast, these machine-learned closed form models use bayesian symbolic regression to search the space of formulas to discover models that perform as well as random forest or deep learning models. These models generalize better to out-of-sample regions (data not seen in training) but are also interpretable. 

The fact that simple, low-dimensional formulas explain flows across different places suggests that, at aggregated scales, human mobility has universal regularities, and that detailed micro-level heterogeneities average out.

*The uncertain equation*
Every model is an approximation. In our search for simplicity, we risk glossing over the messy, individual idiosyncrasies that define human behavior. Is it possible to capture the full complexity of our movements with a handful of equations? This is where the art comes in: choosing which features to include, which to discard, and knowing when a model's failure is a signal for deeper inquiry. As we'll see, this balance between parsimony and precision is both the challenge and beauty of mobility estimation.

<h3><b> The Poisson Paradigm: A Statistical Foundation</b></h3>
At their core, mobility flows are count data (e.g., trips between zones). The **Poisson distribution** is a natural fit for modelling counts, where the probability of observing $y_{ij}$ trips between origin $i$ and destination $j$ is:

$$
P(y_{ij}) = \frac{\lambda_{ij}^{y_{ij}} e^{-\lambda_{ij}}}{y_{ij}!}
$$

where $ \lambda_{ij} $ is the expected number of trips. This is where the beauty of spatial interaction models lies. Once you frame flows as a Poisson process, you can build models to estimate and predict flows based on a set of parameters, enabling prediction within a rigorous framework.

<h3><b> Spatial Interaction Model Formulation: Connecting Theory and Poisson Distribution </b></h3>
The next step is to define the spatial interaction model in a way that allows us to estimate parameters. To do so, we begin by framing the mobility flow between origin $ i $ and destination $j$ as a Poisson-distributed variable.

An unconstrained gravity model can be expressed as:

$$
\lambda_{ij} = k \cdot O_i^\alpha \cdot D_j^\beta \cdot f(d_{ij})
$$

Where:

- $ O_i $: The "mass" of origin $ i $ (e.g., population of zone $ i $).
- $ D_j $: The "mass" of destination $ j $ (e.g., number of jobs in zone $ j $).
- $ f(d_{ij}) $: A decay function that accounts for distance between zones, often in the form $ e^{-\gamma d_{ij}} $.
- $ k $, $ \alpha $, $ \beta $, and $ \gamma $: Parameters to estimate.

This formulation leads us to a Poisson model, where we treat $ y_{ij} $, the observed flow, as coming from a Poisson distribution with parameter $ \lambda_{ij} $, which is governed by the origin and destination "masses" and the distance decay function.

<h3><b> Deriving the Likelihood Function: From Poisson to Maximum Likelihood Estimation (MLE) </b></h3>
Next, we turn the model into a likelihood function that allows us to estimate the parameters. The likelihood function for observing the set of all flows $ \{ y_{ij} \} $ given the model's parameters can be written as the product of individual Poisson likelihoods for each origin-destination pair:

$$
L(\theta) = \prod_{i,j} \frac{\lambda_{ij}^{y_{ij}} e^{-\lambda_{ij}}}{y_{ij}!}
$$

Where $ \lambda_{ij} $ depends on the parameters $ \theta = \{ k, \alpha, \beta, \gamma \} $. The goal is to maximise this likelihood to obtain the best-fitting parameters. However, it's more practical to work with the log-likelihood, which transforms the product into a sum, making it easier to handle mathematically.

<h3><b> Log-Likelihood: Simplifying the Problem </b></h3>
Taking the natural logarithm of the likelihood function gives us the log-likelihood function:

$$
\log L(\theta) = \sum_{i,j} \left( y_{ij} \log \lambda_{ij} - \lambda_{ij} - \log(y_{ij}!) \right)
$$

Substituting in the expression for $ \lambda_{ij} $ from our gravity model, we get:

$$
\log L(\theta) = \sum_{i,j} \left( y_{ij} \left( \log(k) + \alpha \log O_i + \beta \log D_j - \gamma d_{ij} \right) - k O_i^\alpha D_j^\beta e^{-\gamma d_{ij}} - \log(y_{ij}!) \right)
$$

This function represents the likelihood of observing the data given the parameters $ k $, $ \alpha $, $ \beta $, and $ \gamma $. We now need to maximise this log-likelihood to estimate the parameters.

<h3><b> Maximising the Log-Likelihood via MLE</b></h3>
The next step is to find the values of $ \alpha $, $ \beta $, and $ \gamma $ that maximise the log-likelihood function. This can be done through numerical optimisation methods such as **gradient descent** or **Newton-Raphson**. These algorithms iteratively adjust the parameters to find the set of values that maximise the log-likelihood, which in turn leads to the most likely values for the model's parameters given the observed data.

The optimisation problem is typically solved by iterating over the parameters $ \theta $, adjusting them based on the gradient of the log-likelihood with respect to each parameter. The solution to this problem is the set of parameters that best explains the observed mobility flows.

<b> Why This Matters </b>
Directly working with the log-likelihood clarifies how parameters influence model fit. For example, distance decay parameters explicitly penalise long trips, a concept obscured in traditional GLM workflows. By optimising the parameters through maximum likelihood estimation, we ensure that our model is not only mathematically rigorous but also practically useful for real-world applications.


<h3><b> Conclusion </b></h3>
Spatial interaction models are powerful tools, but their assumptions—like exponential distance decay or mass proportionality—must be tested against data. By grounding theory in statistical principles, we empower planners and researchers to ask better questions, calibrate models more effectively, and improve the design of systems that influence human mobility.