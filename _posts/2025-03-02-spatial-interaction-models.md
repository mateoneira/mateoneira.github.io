---
layout: default
permalink: /spatial-interaction-models/
excerpt: this is a test.
---

**Title: The Art and Science of Estimating Mobility Flows**  
**Subtitle: The Theory, Math, and Practical Insights for Spatial Interaction Models**

Predicting how people move, whether that be in their daily activities, or wider dynamics like migration patterns over longer timespans has been a central part of understanding cities since there inception. At an individual level movement patterns can be chaotic and unpredictible, however, collectively certain order emerges. For example, the repeated pulse of a city, with people commuting to work roughly at the same time, and commuting back home, almost like a heart beat. Understanding what shapes this order, and the ability to predict is central for answering important questions that help shape the cities of today. This like: how many people will use a new rail line? is central to infrastructure planning. Where should Buses and trains be allocated during peak hours? for public transport planning. How do job centres influence residential patterns? for urban economics. Where might diseas spread due to human movement? which was central to creating public policy during the pandemic. 

### Interactive Exploration: Spatial Interaction Model

Let's explore how spatial interaction models work with this interactive visualization. You can:
1. Click on blue cells (population centers) to increase their population
2. Click on green cells (job centers) to increase their job count
3. Adjust the distance decay parameter (γ) to see how it affects mobility flows

The intensity of the orange cells represents the predicted flow between origins and destinations based on the gravity model formula: k × O<sub>i</sub><sup>α</sup> × D<sub>j</sub><sup>β</sup> × e<sup>-γd<sub>ij</sub></sup>

<div id="spatial-interaction-viz" class="spatial-interaction-container">
  <!-- The visualization will be loaded here by the JavaScript -->
</div>

<script src="/assets/js/spatial-interaction.js"></script>

#### Exploring the Model Parameters

This interactive visualization demonstrates the three key components of spatial interaction models:

1. **Origin and Destination Masses**: The blue cells represent origin populations (like residential areas), while the green cells represent destination attractions (like job centers). Try increasing these values to see how they affect flows.

2. **Distance Decay**: The γ parameter controls how quickly the interaction probability falls with distance. Higher values mean distance has a stronger deterrent effect. Try adjusting this to see how it changes the pattern of interactions.

3. **Mass Sensitivity**: The α and β parameters control how sensitive the model is to origin and destination masses. Higher values give more importance to larger origins or destinations.

As you experiment with the model, notice how:
- Increasing an origin's population creates more trips from that origin to all destinations
- Increasing a destination's attraction creates more trips to that destination from all origins
- Higher distance decay parameters result in more localized trips and fewer long-distance movements
- The model always predicts higher flows between large, closely situated zones

This simple model captures the essential dynamics of human mobility, even with its mathematical simplicity.

The first models that help in answering these questions where introduced in The study of spatial interactions dates back to the 19th century with Ravenstein's "Laws of Migration," but it wasn't until the 1960s that Alan Wilson formalised these ideas using entropy-maximising models. Wilson's work framed mobility flows as probabilistic outcomes, balancing constraints on origin/destination totals and travel costs. Later, statisticians reframed these models as generalised linear models (GLMs) with Poisson or negative binomial links, marrying theory with modern computational tools.

My first encounter with spatial interaction models was working on research on active mobility in cities around 2015. I had a chance to dive deeper into how these model works while doing my Master's at CASA. More recently I started pushing the boundary of these - experimenting with creating new models, using machine learning (deep neural nets). Through all this time, I never felt there were good resources for understanding why and how they work. Either the material was too technical—diving straight into the mathmatical equations without context and intuition of why these formulations make sense and work — or too theoretical, skirting the practicalities of parameter estimation and real-world validation. This blog is the guide I wish I'd had: a bridge between theory, mathematical intuition, and implementation. 

### I. Theoretical foundations: where gravity meets reality <<make this title more engaging>>

*First: the elegance of gravity models*

At their core, spatial interaction models are deceptively simple. Borrowing a page from Newton's playbook, these models suggest that the flow of people between two places is proportional to the product of their "masses" (usually populations) and inversely proportional to some function of the distance between them. Like a cosmic dance, larger cities pull in more movement, but as the separation increases, the gravitational pull becomes weaker. Historical pioneers like Reilly even extended these ideas to retail, coining notions like "retail gravitation." Yet, despite their mathematical elegance, these models are only as good as the assumptions that underlie them.

*Second: the rise of machine-learned, closed form models*

In recent years, researchers have introduced a new contender: models discovered through machine learning and symbolic regression. These approaches, which extract closed-form equations directly from data, aim to bridge the gap between interpretability and predictive power. Imagine a chef who, rather than following a rigid recipe, learns to balance salt and sugar on the fly—these models capture the essence of human mobility with fewer ingredients yet astonishing accuracy. They promise not only predictions but also insight into the "why" behind the numbers. I won't go into details on these here, but I might write a seperate blog on them. For now I just want to make you aware that they exist and a lot of research effort is going into how to make these type of models more interpretable. 

*Third: The uncertain equation*
But herein lies the rub: every model is an approximation. In our quest for simplicity, we risk glossing over the messy, individual idiosyncrasies that define human behavior. Is it possible to capture the full complexity of our movements with a handful of equations? This is where the art comes in—choosing which features to include, which to discard, and knowing when a model's failure is a signal for deeper inquiry. As we'll see, this balance between parsimony and precision is both the challenge and the charm of mobility estimation.


### Why Model Mobility Flows?
Mobility flow models answer critical questions:

- **Infrastructure Planning**: How many commuters will use a new highway or rail line?
- **Public Transport**: Where should buses or trains be allocated during peak hours?
- **Urban Economics**: How do job centres influence residential patterns?
- **Pandemic Response**: Where might disease spread accelerate due to human movement?

### Historical Roots
The study of spatial interactions dates back to the 19th century with Ravenstein's "Laws of Migration," but it wasn't until the 1960s that Alan Wilson formalised these ideas using entropy-maximising models. Wilson's work framed mobility flows as probabilistic outcomes, balancing constraints on origin/destination totals and travel costs. Later, statisticians reframed these models as generalised linear models (GLMs) with Poisson or negative binomial links, marrying theory with modern computational tools.

### The Poisson Paradigm: A Statistical Foundation
At their core, mobility flows are count data (e.g., trips between zones). The **Poisson distribution** is a natural fit for modelling counts, where the probability of observing \( y_{ij} \) trips between origin \( i \) and destination \( j \) is:

\[
P(y_{ij}) = \frac{\lambda_{ij}^{y_{ij}} e^{-\lambda_{ij}}}{y_{ij}!}
\]

where \( \lambda_{ij} \) is the expected number of trips. This is where the beauty of spatial interaction models lies—once you frame flows as a Poisson process, you can build models to estimate and predict flows based on a set of parameters.

### Spatial Interaction Model Formulation: Connecting Theory and Poisson Distribution
The next step is to define the spatial interaction model in a way that allows us to estimate parameters. To do so, we begin by framing the mobility flow between origin \( i \) and destination \( j \) as a Poisson-distributed variable.

An unconstrained gravity model can be expressed as:

\[
\lambda_{ij} = k \cdot O_i^\alpha \cdot D_j^\beta \cdot f(d_{ij})
\]

Where:

- \( O_i \): The "mass" of origin \( i \) (e.g., population of zone \( i \)).
- \( D_j \): The "mass" of destination \( j \) (e.g., number of jobs in zone \( j \)).
- \( f(d_{ij}) \): A decay function that accounts for distance between zones, often in the form \( e^{-\gamma d_{ij}} \).
- \( k \), \( \alpha \), \( \beta \), and \( \gamma \): Parameters to estimate.

This formulation leads us to a Poisson model, where we treat \( y_{ij} \), the observed flow, as coming from a Poisson distribution with parameter \( \lambda_{ij} \), which is governed by the origin and destination "masses" and the distance decay function.

### Deriving the Likelihood Function: From Poisson to Maximum Likelihood Estimation (MLE)
Next, we turn the model into a likelihood function that allows us to estimate the parameters. The likelihood function for observing the set of all flows \( \{ y_{ij} \} \) given the model's parameters can be written as the product of individual Poisson likelihoods for each origin-destination pair:

\[
L(\theta) = \prod_{i,j} \frac{\lambda_{ij}^{y_{ij}} e^{-\lambda_{ij}}}{y_{ij}!}
\]

Where \( \lambda_{ij} \) depends on the parameters \( \theta = \{ k, \alpha, \beta, \gamma \} \). The goal is to maximise this likelihood to obtain the best-fitting parameters. However, it's more practical to work with the log-likelihood, which transforms the product into a sum, making it easier to handle mathematically.

### Log-Likelihood: Simplifying the Problem
Taking the natural logarithm of the likelihood function gives us the log-likelihood function:

\[
\log L(\theta) = \sum_{i,j} \left( y_{ij} \log \lambda_{ij} - \lambda_{ij} - \log(y_{ij}!) \right)
\]

Substituting in the expression for \( \lambda_{ij} \) from our gravity model, we get:

\[
\log L(\theta) = \sum_{i,j} \left( y_{ij} \left( \log(k) + \alpha \log O_i + \beta \log D_j - \gamma d_{ij} \right) - k O_i^\alpha D_j^\beta e^{-\gamma d_{ij}} - \log(y_{ij}!) \right)
\]

This function represents the likelihood of observing the data given the parameters \( k \), \( \alpha \), \( \beta \), and \( \gamma \). We now need to maximise this log-likelihood to estimate the parameters.

### Maximising the Log-Likelihood via MLE
The next step is to find the values of \( \alpha \), \( \beta \), and \( \gamma \) that maximise the log-likelihood function. This can be done through numerical optimisation methods such as **gradient descent** or **Newton-Raphson**. These algorithms iteratively adjust the parameters to find the set of values that maximise the log-likelihood, which in turn leads to the most likely values for the model's parameters given the observed data.

The optimisation problem is typically solved by iterating over the parameters \( \theta \), adjusting them based on the gradient of the log-likelihood with respect to each parameter. The solution to this problem is the set of parameters that best explains the observed mobility flows.

### Why This Matters
Directly working with the log-likelihood clarifies how parameters influence model fit. For example, distance decay parameters explicitly penalise long trips, a concept obscured in traditional GLM workflows. By optimising the parameters through maximum likelihood estimation, we ensure that our model is not only mathematically rigorous but also practically useful for real-world applications.

### The Unconstrained Gravity Model: Building Intuition
The simplest spatial interaction model is the **unconstrained gravity model**, inspired by Newton's law of gravitation:

\[
\lambda_{ij} = k \cdot O_i^\alpha \cdot D_j^\beta \cdot f(d_{ij})
\]

Where \( O_i \) is the "mass" of origin \( i \) (e.g., population), \( D_j \) is the "mass" of destination \( j \) (e.g., jobs), and \( f(d_{ij}) \) is the distance decay function (e.g., \( e^{-\gamma d_{ij}} \)).

This formulation is intuitive and easy to understand, as it mimics the gravitational forces between two masses. The distance decay function captures the decreasing likelihood of trips as the distance between the origin and destination increases.

### Parameter Estimation via MLE
Assume \( f(d_{ij}) = e^{-\gamma d_{ij}} \). Substituting this into the gravity model and then into the log-likelihood function, we optimise the parameters \( \alpha \), \( \beta \), and \( \gamma \) using numerical methods. The maximisation yields the set of parameter estimates that best fit the observed mobility flows.

### Case Study: Predicting Commuter Flows
Let's simulate a toy city with 5 zones. Using synthetic data:

- **Origins**: Populations \( O = [100, 200, 150, 300, 250] \)
- **Destinations**: Job counts \( D = [80, 120, 200, 150, 100] \)
- **Distance Matrix**: Randomly generated Euclidean distances between zones.

### Future Directions and Caveats
- **Constrained Models**: Real-world models often fix origin/destination totals (e.g., doubly constrained models where \( \sum_j y_{ij} = O_i \)).
- **Overdispersion**: If variance exceeds the mean, consider negative binomial models, which account for overdispersed count data.
- **Machine Learning**: While neural networks can capture nonlinearities, they sacrifice interpretability, which may be a concern for planners and policymakers who need transparent models.

### Conclusion
Spatial interaction models are powerful tools, but their assumptions—like exponential distance decay or mass proportionality—must be tested against data. By grounding theory in statistical principles, we empower planners and researchers to ask better questions, calibrate models more effectively, and improve the design of systems that influence human mobility.