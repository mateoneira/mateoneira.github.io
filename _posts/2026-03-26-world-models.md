---
layout: default
permalink: /world-models/
excerpt: "World models are everywhere in 2026. Every lab has one. But what exactly is a world model, where did the idea come from, how are different groups approaching the problem, and why should anyone care? I mapped out the landscape from the papers and identified ten distinct paradigms."
---

<h2><b>So What Exactly Is a World Model?</b></h2>

World models seem to be all the rage right now. Every time I go on X, every other post is about how someone cracked the world model problem. Many of the big labs have some version of a World Model. DeepMind, for example, has Genie 3. Meta has V-JEPA 2. World Labs has Marble. Verses AI has Axiom (this last one is interesting because they depart from traditional approaches, I'll touch on this later).

So what exactly is a world model? How did they come about? How are different people and labs approaching them? And why are they important?

The last few months I've been deep in the weeds in generative AI for 3D generation, mostly looking at feed-forward Gaussian Splatting and semantic segmentation (see [my previous post](/the-alpha-blending-problem/) if that's your thing). I started following a lot of people on X who are pushing what is possible in this space, and as a result started getting a lot of content on world models. So I did what I always do when something catches my interest. I dove deep into the papers and tried to understand the current landscape: what we mean when we talk about "world models", what different approaches are being tried, what seems to work, and where we are likely to see progress.

<h3><b>The simple definition</b></h3>

A world model is a system that learns an internal representation of an environment and can predict how that environment will change given some set of actions or conditions.

That is the core idea. The system builds a model of its world, then uses that model to run "what if" scenarios, simulating possible futures before deciding what to do. 

Our own brains build a world model to be able to function in the world. As Max Bennet succintly puts in in his book "A Brief History of Intelligence" our neocortex evolved to actively predict what's happening and update those predictions with incoming signals. 

To understand why this is necessary let's look only at visual information for a moment. Raw sensory signals take time to travel and be processed by our brain. For the visual cortex the time it takes is in the order of ~100ms. This means that the "raw feed" our brains are getting is always slightly in the past. If we were to act on this information it would be nearly impossible to act/react to the world efficiently. Our brains compensates for this by simulating slightly ahead of the present. Essentially, our concious experience is a rendered prediction of the current moment. 

This feature of the brain also let's us plan/simulate possible futures. Even when we try not to, our minds are constantly playing out scenarios (the ones we don't like we usually call intrusive thoughts). 

The difference is that we are trying to get machines to do this from data, at scale, with enough fidelity to be useful.

**To be more precise**: a world model is a learned function $$f$$ that takes a state $$s_t$$ and an action $$a_t$$ and predicts the next state $$s_{t+1} = f(s_t, a_t)$$. Where current approaches diverge is mostly in what they consider a "state" to be. For some it is raw pixels. For others it is a latent vector, or a set of 3D Gaussians, or a probability distribution. The prediction mechanism varies too: autoregressive, diffusion-based, Bayesian. And then there is the question of whether you can actually see the output or whether it lives entirely in some compressed internal space.

<h3><b>We Already Have Rudimentary World Models</b></h3>

We already see glimpses of this in large language models. We train a very large transformer model to predict the next token given some previous text, and in the process the model seems to build some internal representation of the world. 

Here is an extract from Ilya Sutskever in a Fireside chat with Jensen Huang at NVIDIA's GTC conference in 2023 - where he makes the point very clearly. 

>"when we train a large neural network to accurately predict the next word in lots of different texts from the internet, what we are doing is that we are learning a world model. It looks like we are learning that it may look on the surface, that we are just learning statistical correlations in text. But it turns out that to just learn the statistical correlations in text to compress them really well. What the neural network learns is some representation of the process that produced the text. This text is actually a projection of the world."

We are only starting to scratch the surface of our understanding here, but mechanistic interpretability is uncovering interesting structure: these models appear to hold spatial, temporal, and causal knowledge just through the process of next-token prediction. (I am oversimplifying, and not taking into account all the post-training work using reinforcement learning, chain-of-thought reasoning, and all the state-of-the-art tricks in LLM training. My point is that LLMs are already a very rudimentary world model.) 

**So what do they lack?** For one, they operate in language space, not in the physical world. They can describe what might happen if you push a ball off a table, but they have no grounded understanding of gravity, mass, or friction. They hallucinate confidently about spatial relationships. They have no internal mechanism for simulating state transitions. When embedded in an agentic scaffolding, they can act in and observe an environment, but the environment is doing the simulations, not the model.

Yann LeCun has been one of the most vocal critics on this point. His argument, broadly, is that autoregressive token prediction is fundamentally the wrong paradigm for building systems that understand the physical world. Too much capacity gets spent modelling the surface form of language rather than the underlying structure of physical reality. He left Meta in late 2025 and founded AMI Labs, an independent startup that raised over $1 billion, to pursue his own approach. More on that in a moment.

<h3><b>Two Types, One Name</b></h3>

Before we get into the paradigms, it is worth noting that the field uses "world model" for two fundamentally different things:

**Predictive models** forecast what happens next from history and actions. Meta's V-JEPA 2 is the clearest example. It predicts in latent space and gets state-of-the-art results on visual understanding and zero-shot robot control. However, it cannot produce an image. Or a mesh. Or anything you can look at. It has clearly learned something deep about how scenes work, but cannot render that scene itself.

**Generative models** go the other direction: they synthesize scenes you can actually see. Genie 3 gives you a navigable 3D world at 720p/24fps. Cosmos generates video where the 3D structure is consistent enough that you can recover camera poses from the output about 63% of the time (which is a super surprising result).

An interesting recent finding is that this dichotomy may be dissolving. Both Var-JEPA and VJEPA (early 2026) independently showed that predictive and generative approaches can be unified under probabilistic theory. The divide is less fundamental than previously thought; it is a choice along a spectrum of how much information the model is asked to reconstruct.

Let's imagine two ways to learn about a room. A *generative* model learns to draw the room from memory with impressive levels of detail. It learns everything because it has to reproduce everything. A *predictive* model (like JEPA) learns to *recognize* the room. It builds an internal summary and can tell you if two photos are of the same room, but it cannot draw the room itself. The question is: are these fundamentally different skills, or different levels of the same skill?

Var-JEPA showed they are the same skill at different levels. The "internal summary" that JEPA builds turns out to closely mirror something called a *variational posterior*, a compressed probabilistic description of the data. And JEPA's predictor, which forecasts one summary from another, closely mirrors a *learned conditional prior*, a model of what summaries are likely given what you have already seen. If you see the connection to Variational Autoencoders (VAE), it's because there are the two exact components you need for them.


**In more technical terms:** In standard JEPA, an encoder *f* maps an observation *x* to a representation *z = f(x)*, and a predictor *g* maps context representation *z_ctx* to a predicted target representation *z&#770;_tgt = g(z_ctx)*. An EMA teacher *f&#772;* provides the target *z&#772;_tgt = f&#772;(x_tgt)*. The training loss minimizes distance between *z&#770;_tgt* and *z&#772;_tgt* in latent space.

Var-JEPA reinterprets this setup probabilistically:
- The encoder *f* is a variational posterior *q(z&#124;x)* -- it approximates the true distribution of latent representations given data
- The predictor *g* is a learned conditional prior *p(z_tgt&#124;z_ctx)* -- it models the distribution of target representations given context
- The EMA teacher provides a target distribution rather than a point estimate

Under this reinterpretation, JEPA's training loss is a special case of the Evidence Lower Bound (ELBO), the same objective used in VAEs. The ELBO decomposes into a reconstruction term (how well can you decode *z* back to *x*?) and a KL divergence term (how close is your encoder's posterior to the prior?). Standard JEPA drops the reconstruction term entirely, keeping only the KL alignment between encoder and predictor. To make JEPA generative, you add the reconstruction term back by attaching a decoder that maps *z* to *x* and train it jointly. The result is a VAE where the prior is not a fixed Gaussian (as in standard VAEs) but the *learned predictor* from JEPA training.

This means the predictive/generative divide is not architectural but a single objective (ELBO) with a tunable dial. Turn reconstruction weight to zero: you get pure JEPA (efficient, non-generative). Turn it up: you get a generative model that can produce images, with a prior informed by JEPA's temporal prediction. Theoretically you can smoothly interpolate between understanding and generation.

<h3><b>The Three Architectural Choices</b></h3>

Every world model makes three core decisions that determine what it can and cannot do.

**State representation: what does the model think in?**

This is the most consequential choice. It determines what information survives compression, what errors accumulate, and what can be extracted from the model.

| Representation | Examples | Preserves geometry? | Extractable 3D? |
|---|---|---|---|
| Continuous latent vector | DreamerV3 RSSM, TD-MPC2, JEPA | Implicitly, maybe | No |
| Discrete tokens (VQ-VAE) | GAIA-1, IRIS | Poorly -- quantization discards spatial details | No |
| Continuous latent (diffusion) | Cosmos, GAIA-2, DIAMOND | Better than tokens | Partially (62.6% pose recovery) |
| Per-object slots | SlotFormer, SOLD, DINOSAUR | Appearance yes, geometry no | No |
| Occupancy voxels | OccWorld, OccSora, SparseWorld | Yes, at voxel resolution | Yes, by design |
| 3D Gaussians | GaussianDWM, Street Gaussians | Yes, explicitly | Yes, by design |
| Mixture model components | AXIOM | Object structure yes, geometry untested | No |
| Pixels (raw video) | Genie 3 | Surface appearance only | Emergent, not extractable |

A note on "object-centric" and "slots": most world models encode an entire scene into a single monolithic representation ... one latent vector, one token sequence, one voxel grid. Object-centric models do something different: they decompose a scene into a fixed set of *slots*, where each slot is a separate vector (typically 64-256 dimensions) that binds to one object in the scene. Think of it like giving the model a tray of empty cups and asking it to sort the scene's contents -- one object per cup. The model learns to do this without labels, purely through a competitive attention mechanism where slots fight over image patches. The result is a structured representation: instead of "the scene is [one big vector]", you get "object 1 is [vector], object 2 is [vector], object 3 is [vector]...". This makes it easy to reason about individual objects, track them across frames, and predict their interactions -- but the slots capture appearance and motion, not 3D geometry. A slot can tell you "there is a red car moving left" but not "the car is 4.2 meters long and 12 meters away."

The trend line is clear: representations are diverging into two camps. One camp compresses aggressively into latent spaces optimized for downstream tasks (JEPA, Dreamer, slots). The other preserves explicit 3D structure (occupancy, Gaussians). The question for 3D reconstruction is whether the latent camp's compression discards geometric information that cannot be recovered.

**Prediction mechanism: how does the model step forward?**

| Mechanism | Examples | Strengths | Weaknesses |
|---|---|---|---|
| Autoregressive (next-token) | GAIA-1, IRIS, OccWorld, SlotFormer | Simple, scalable with transformers | Compounding errors, slow sequential generation |
| Diffusion (iterative denoising) | Cosmos, DIAMOND, OccSora, GAIA-2 | High fidelity, parallel generation | Computationally expensive per step |
| Recurrent dynamics (RSSM) | DreamerV3, SOLD | Fast single-step, good for imagination | Single-step errors compound over long horizons |
| Online trajectory optimization (MPPI) | TD-MPC2, DC-MPC | Adaptive, scales compute at test time | Expensive per decision, no learned policy |
| Mixture model updates | AXIOM | No backprop, principled uncertainty | Untested at scale |

The autoregressive-to-diffusion transition is the dominant trend, and it cuts across paradigms. Within RL world models, IRIS (autoregressive) was succeeded by DIAMOND (diffusion) by the same authors. Within driving, GAIA-1 (autoregressive) evolved to GAIA-2 (diffusion). Within occupancy, OccWorld (autoregressive) was followed by OccSora (diffusion). The pattern is consistent: diffusion models preserve more information than discrete token prediction, at the cost of higher compute per step.

**Action conditioning: how does the model respond to control?**

Some world models are passive observers -- they predict what happens next in a video stream. Others are action-conditioned -- they predict what happens *given a specific action*. This distinction matters enormously for 3D reconstruction, because action conditioning is what you need for view planning: "if I move the camera here, what will I see?"

| Model | Action type | Conditioning |
|---|---|---|
| Cosmos | Text prompts, camera poses | Text encoder + multi-view camera control |
| Genie 3 | Latent actions (learned, not specified) | Latent action model inferred from video |
| DreamerV3 | Explicit RL actions | Concatenated with latent state |
| TD-MPC2 | Continuous control actions | Trajectory optimization in latent space |
| SOLD | Explicit RL actions | Slot-level imagination |
| GAIA-1 | Driving actions (speed, steering) | Tokenized action tokens |
| OccSora | Trajectory prompts | Trajectory-conditioned DiT |
| UniSim | Diverse (camera, object, agent) | Action-conditioned video diffusion |
| AXIOM | Active inference (uncertainty reduction) | Free energy minimization |

UniSim is notable for supporting the broadest range of action types -- camera movement, object manipulation, agent actions -- via a unified 5.6B-parameter action-conditioned video diffusion model. For reconstruction, the interesting models are those that accept camera pose as an action, enabling "if I photograph from this angle, what do I get?"

<h3><b>Ten Paradigms</b></h3>

From reading the papers and mapping out the startups in this space, I count at least ten distinct paradigms that have emerged by early 2026. Each one makes different trade-offs about representation, prediction, and output.

<h3><b>1. JEPA (Meta / AMI Labs)</b></h3>

This is LeCun's approach. JEPA (Joint-Embedding Predictive Architecture) predicts in a learned latent space rather than in pixel space. The idea is that by operating at a higher level of abstraction, the model can focus on learning meaningful dynamics while ignoring unpredictable surface-level noise (exact textures, lighting variations, pixel-level detail that does not matter for understanding what is happening in a scene).

V-JEPA 2, the latest version, was trained on over 1 million hours of video with a 1B+ parameter Vision Transformer. Progressive resolution training -- starting at 16 frames / 256px and scaling to 64 frames / 384px -- reduces GPU time by 8.4x compared to training at full resolution throughout. The action-conditioned variant (V-JEPA 2-AC) enables zero-shot robot manipulation from just 62 hours of unlabeled robot video. That last number is striking: the representations are general enough that a small amount of embodied data goes a very long way.

VL-JEPA extends JEPA to vision-language via non-autoregressive continuous "thought vectors" -- achieving SOTA on the WorldPrediction-WM benchmark with 50% fewer parameters than standard VLMs. This shows JEPA's efficiency advantage extends beyond vision-only tasks.

<h3><b>2. Interactive Generation (Google DeepMind / Genie)</b></h3>

Genie 3 is a large autoregressive transformer that generates navigable 3D worlds in real time, conditioned on user actions. You give it a prompt (an image, a description), and it produces a stream of video frames that respond to your input. No explicit 3D representation exists -- actions are not specified but discovered via self-supervised learning from temporal patterns. Consistency is emergent from autoregressive prediction over 200K hours of gaming video. (DeepMind has not published a technical paper for Genie 3, so details like exact parameter count remain undisclosed.)

The consistency is good, lasting several minutes before degrading (Genie 2 was typically 10-20 seconds, with a best case of about a minute). Physics is learned from data, not simulated, which means you occasionally get artifacts: backward-walking people, unrealistic water, objects that phase through each other.

The key distinction from Sora/Veo-style video generation is interactivity. Genie produces branching experiences via its latent action model, not fixed video sequences. This makes it a true environment simulator, not just a video generator.


<h3><b>3. Diffusion-Based Foundation Models (NVIDIA / Cosmos)</b></h3>

Cosmos takes the brute-force approach. Trained on 9,000 trillion tokens from 20 million hours of video (100x Genie 3's data, drawn from autonomous driving, robotics, and synthetic environments), it generates video with measurable 3D structure. The Cosmos Tokenizer uses Haar wavelet transforms for causal temporal compression, achieving 2048x total video compression at 12x speed over SOTA tokenizers. Three model families: Predict (video generation), Transfer (structural conditioning), and Reason (physical reasoning VLM).

What makes Cosmos interesting from a reconstruction perspective is Cosmos Transfer 2.5, which accepts structural inputs: depth maps, segmentation masks, edge control signals. This enables 3D-to-photoreal pipelines with 60% improvement in control adherence over prior models. The text encoder is itself a physics-reasoning vision-language model (Cosmos Reason 1), which grounds generation in physical common sense and reduces hallucinations compared to generic text encoders. Predict 2.5 supports explicit camera control and multi-view synchronized generation -- directly relevant to multi-view reconstruction workflows.

The critical number: 62.6% camera pose estimation success from generated video (vs 4.4% baseline). This means Cosmos-generated frames contain enough geometric consistency for structure-from-motion to partially work on synthetic output.


<h3><b>4. Spatial Intelligence (World Labs / Marble)</b></h3>

World Labs was co-founded by Ben Mildenhall (co-inventor of NeRF), Fei-Fei Li, Justin Johnson, and Christoph Lassner. The institutional lineage is the most direct bridge between 3D reconstruction and world models: the people who created modern neural scene representations are now building world models that explicitly target 3D geometry reasoning.

Marble has launched commercially, but technical details remain limited. The bet here is that if you want a world model that understands 3D space, you should build the team from people who spent the last decade figuring out how to represent 3D space.


<h3><b>5. Gaussian-Based (GaussianDWM, Street Gaussians)</b></h3>

This is the paradigm closest to my own recent work. These are among the most prominent world models that use explicit 3D reconstruction primitives.

GaussianDWM unifies 3D Gaussian Splatting with driving world model capabilities, achieving state-of-the-art on the NuInteract and OmniDrive benchmarks. Street Gaussians represents dynamic urban streets using point clouds with semantic logits and 3D Gaussians, rendering at 135 FPS.

These bridge reconstruction and world modelling directly. Same primitives, different objectives. The reconstruction community builds static scenes from 3D Gaussians. The world model community uses those same Gaussians to model dynamics.

**The open question** is whether static 3DGS reconstructions can serve as backbones for dynamic world model generation. Nobody has built this unified two-stage pipeline yet. Static reconstruction as the stage, world model dynamics as the actors. It seems like an obvious next step, and I would not be surprised if multiple groups are working on it right now.

<h3><b>6. Tokenized Autoregressive (GAIA, IRIS, UniSim)</b></h3>

GAIA-1 (Wayve, 2023) pioneered next-token prediction over VQ-VAE visual tokens -- a 6.5B-parameter autoregressive transformer conditioned on image, text, and action tokens. IRIS (ICLR 2023) demonstrated sample-efficient RL world models via autoregressive transformers over discrete tokens -- achieving strong Atari results with 100K environment steps by learning a discrete world model and planning within it.

But discrete tokens have two fundamental problems. First, geometric prediction compounds errors irreversibly -- because geometry is non-differentiable, small spatial errors in one frame create progressively larger distortions in subsequent frames, unlike appearance errors which can partially self-correct through temporal consistency. Second, token expressiveness hits a ceiling -- VQ-VAE codebooks can represent rigid objects in static environments but fail for deformable objects, liquids, or complex multi-object interactions because the fixed codebook cannot capture the combinatorial space of geometric configurations.

DIAMOND showed the cost directly: 1.46 vs 1.046 human-normalized on Atari 100k, created by a team including the original IRIS authors. The specific failure modes are telling: enemies become rewards between frames before reverting, and brick/score displays show inter-frame inconsistencies. These are exactly the kind of spatial details that VQ-VAE quantization discards and that 3D reconstruction absolutely requires.

The response? Evolution away from discrete tokens. GAIA-2 switched to latent diffusion, encoding entire video sequences into continuous latent space, eliminating the temporal discontinuities of frame-by-frame token generation. GAIA-3 (15B params) shifted to evaluation-focused generation -- structured repeatable driving scenarios with synthetic-test rejection rates reduced fivefold. UniSim (ICLR 2024 Outstanding Paper, 5.6B params) demonstrated sim-to-real transfer via action-conditioned video diffusion trained on diverse internet and robotics data -- the first model where policies trained purely in a learned world model generalize to real robot settings.


<h3><b>7. Occupancy-Based (OccWorld, OccSora, Drive-OccWorld)</b></h3>

OccWorld (ECCV 2024) established the baseline -- a GPT-like spatial-temporal generative transformer autoregressively predicting future 3D occupancy from tokenized voxels. Its scene tokenizer reduces the voxel grid to a manageable token sequence; the transformer then predicts future tokens autoregressively. Achieves IoU 26.63 and mIoU 17.13 on nuScenes Occ3D without any instance or map annotations -- the first time an occupancy-only model supported end-to-end planning.

The paradigm evolved fast along three axes:

**Generation architecture:** OccSora replaced autoregressive generation with Diffusion Transformers (DiT), generating 16-second trajectory-conditioned sequences. Its 4D scene tokenizer achieves 32x better compression than OccWorld while maintaining over half the reconstruction accuracy -- the compression-fidelity tradeoff that enables longer-horizon generation.

**Planning integration:** Drive-OccWorld closed the perception-to-planning loop by defining a cost function directly on predicted occupancy grids, evaluating candidate trajectories by their collision risk and goal alignment in the forecasted 3D scene. It supports action conditioning via velocity, steering angle, trajectory, and command -- multi-channel control over the forecasted scene.

**Scalability:** SparseWorld moved from dense voxels to sparse dynamic queries, achieving SOTA across perception, forecasting, and planning while addressing the computational wall that dense voxels hit at higher resolutions. OccLLaMA unified vision-language-action through occupancy tokens, outperforming OccWorld on longer-term prediction. OccTENS introduced next-scale prediction for controllable long-term generation, improving OccWorld IoU from 29.17 to 31.03.

The architectural evolution mirrors video generation -- autoregressive to diffusion to hybrid. And the representation evolution mirrors NeRF-to-3DGS -- dense to sparse, driven by deployment compute budgets.

Evaluation is uniquely mature: Occ3D-nuScenes provides a genuine standard with geometric IoU and semantic mIoU at 1-3 second horizons. UniOcc (ICCV 2025) further standardizes cross-dataset comparison. This is what benchmarking *should* look like -- and it only exists in this one paradigm.


<h3><b>8. Structured Bayesian (VERSES AI / AXIOM)</b></h3>

And then there is the weird one. AXIOM does not use neural networks at all. It uses mixture models -- four specialized modules: Slot Mixture Model (pixel to per-object slots), Identity Mixture Model (cross-frame object tracking), Transition Mixture Model (piecewise linear trajectory forecasting), Recurrent Mixture Model (causal reasoning across interactions). Total: 0.3-1.6M parameters depending on the environment, compared to Dreamer V3's ~400 million. No backpropagation. All learning via probabilistic inference. Instead of maximizing reward, it picks actions that reduce uncertainty about what is going on. This comes from Karl Friston's free energy principle, which I will not pretend to fully understand, but the basic intuition is that the agent acts in order to confirm or refine its beliefs about the world.

The numbers are frankly a bit shocking: 60% better than Dreamer V3 on the Gameworld 10K benchmark, using 39x less compute and 7.6x fewer learning steps. I had to read that twice.

The model grows and shrinks dynamically: online structure expansion grows mixture components from single events, then Bayesian model reduction prunes unnecessary components to induce generalization. This is architecturally analogous to 3DGS densification (add Gaussians where gradient is high, prune where opacity is low) -- but with principled Bayesian criteria instead of heuristic thresholds.

<h3><b>9. Latent Dynamics / RL (DreamerV3, TD-MPC2)</b></h3>

DreamerV3 learns a compact latent dynamics model and trains policies entirely "in imagination" -- generating thousands of imagined trajectories without ever touching the real environment. The architecture is the Recurrent State-Space Model (RSSM): a deterministic recurrent component (Block GRU) combined with a stochastic component (32 categorical distributions x 32 classes = 1024 discrete latent dimensions total). During training, an encoder computes posterior stochastic state from real observations. During imagination, the dynamics predictor generates prior state from deterministic history alone -- no environment interaction required.

A single hyperparameter configuration works across 150+ tasks (Nature 2025). The robustness techniques are specific and important: symlog observation normalization (compresses large value ranges), KL balancing with free bits (prevents latent collapse while allowing information flow), 1% unimix for categoricals (maintains exploration in latent space), percentile return normalization (adapts value scale to reward distribution), and symexp two-hot loss for reward/value heads. Together these enable the same config to work on Atari, DMC, Minecraft, DMLab, and 150+ other tasks.

The landmark result: first to collect diamonds in Minecraft from scratch -- sparse rewards, vast exploration space, 20+ minute episodes, no human data or curricula. This demonstrated that latent imagination can handle extremely long-horizon planning when robustness techniques are right.

**The V1 to V3 evolution is instructive.** V1 (ICLR 2020) used continuous Gaussian latents, limited to smooth continuous control. V2 (ICLR 2021) switched to discrete categoricals -- 32 distributions x 32 classes, with straight-through gradient estimation. This proved critical: discrete representations capture abrupt state transitions (score changes, enemy spawns) that Gaussians smooth over. V2 became the first model-based agent to reach human-level on Atari-55. V3 kept V2's architecture but added the robustness stack.

TD-MPC2 takes the parallel approach: no decoder -- representations learned via temporal difference consistency loss. Continuous latent space with SimNorm (softmax-based simplex projection). Plans via Model Predictive Path Integral (MPPI) control: samples candidate action sequences, evaluates them through the learned dynamics model, selects the best trajectory. Scales to 317M parameters, 104 continuous control tasks, single hyperparameter set. Competitive with DreamerV3 on continuous control; DreamerV3 dominates on visual tasks.

The fundamental distinction: DreamerV3 *amortizes* planning into a learned policy (fast inference, fixed computation per step). TD-MPC2 *re-plans* every step (adaptive, scales compute at test time, more expensive). This is the same amortized-vs-search tradeoff seen in AlphaGo (policy network vs MCTS): amortized is faster, search is more flexible.

**The decoder-free revolution (2022-2026).** Four independent approaches converged on removing pixel reconstruction:

- **DreamerPro** (ICML 2022): prototypical representation learning -- learned prototypes from recurrent states, distilling temporal structure without pixel prediction.
- **R2-Dreamer** (ICLR 2026): Barlow Twins redundancy-reduction -- encourages uncorrelated, informative latent dimensions without collapse. Trains 1.59x faster than DreamerV3, no data augmentation needed. Biggest gains on DMC-Subtle (tiny task-relevant objects in visually complex scenes).
- **NE-Dreamer** (2026): next-embedding prediction via causal temporal transformer. Aligns predicted next encoder embedding to actual using Barlow Twins. Biggest gains on DMLab tasks requiring memory and spatial reasoning -- directly relevant to 3D.
- **Dreamer-CDP** (Zenke Lab, March 2026): adds JEPA-style abstract state prediction to Dreamer. Predicts next abstract state rather than next frame. This is the concrete convergence point between JEPA (paradigm 1) and RL world models (paradigm 9) -- the paradigm boundaries are porous.


<h3><b>10. Object-Centric / Slot-Based (SlotFormer, SOLD, DINOSAUR)</b></h3>

Slot Attention (Locatello et al., NeurIPS 2020) introduced competitive iterative attention where slots compete for image patches, discovering objects without supervision. The lineage runs through SAVi (video extension with GRU temporal updates), SAVi++ (first real-world scaling, Waymo Open, via sparse LiDAR depth as self-supervision), STEVE (key insight: decoder capacity matters more than encoder capacity -- replacing spatial broadcast with autoregressive transformer decoder enabled naturalistic video), and SlotFormer (ICLR 2023) -- Transformer autoregressive dynamics over pre-trained slots, with residual connections for temporal consistency.

SlotFormer's significance is architectural: by modeling dynamics at the slot level, each object's trajectory is predicted independently with sparse inter-object attention. Errors in one object's prediction do not corrupt others -- unlike pixel-level models where errors propagate globally. 49.42 mIoU on CLEVRER, and unsupervised slot dynamics transfer to improve supervised downstream tasks (VQA, goal-conditioned planning).

**The dynamics architecture question:** Multiple options exist for predicting how slots evolve. SlotFormer uses a Transformer. SSWM uses a graph neural network -- slots become graph nodes with learned edges representing pairwise interactions, explicitly modeling inter-object dynamics. Can disentangle duplicate objects (two identical balls) that feedforward encoders cannot. SlotSSMs use state space models -- parallelizable training (unlike RNN), memory-efficient long-range reasoning (unlike Transformer quadratic attention). Per-slot state transitions with sparse cross-slot Slot Mixer.

**The real-world scaling breakthrough** came from changing what slots reconstruct. DINOSAUR (ICLR 2023) replaced pixel reconstruction with DINO ViT feature reconstruction. Because DINO features already encode semantic object boundaries, they provide a much stronger training signal than raw pixels -- the slot attention module is effectively guided by a frozen foundation model's object understanding. Works on COCO and PASCAL VOC without any depth supervision. By 2024-2025 this became the dominant paradigm -- frozen DINO/DINOv2 features as reconstruction targets.

**The RL result that matters:** SOLD (ICML 2025) outperforms DreamerV3 and TD-MPC2 on relational robotic manipulation -- pick-and-place, stacking, multi-object rearrangement. It trains an actor-critic on imagined sequences of slot-based latent states (same imagination-as-training paradigm as DreamerV3, but compositional slots instead of monolithic RSSM). This confirms that object-centric structure provides concrete advantages over monolithic latent dynamics when tasks involve object relationships -- not just an inductive bias for perception, but a performance advantage for planning.

**The hard limits:** the slot count must be pre-specified. All K slots are always used -- when there are fewer objects than slots, objects get split; when more, they merge. In video, occlusions cause slot-to-object reassignment across frames. AdaSlot (CVPR 2024) partially addresses this with dynamic slot numbers. Slots are blind to geometric structures -- they bind to objects by appearance and motion saliency, not spatial geometry. Walls, ground planes, and building boundaries have no object identity in the slot framework. And most dynamics results are on simple synthetic benchmarks -- CLEVRER, OBJ3D, Spriteworld. Real-world dynamics prediction at scale is undemonstrated.

<h3><b>The Gap</b></h3>

Here is what none of these systems do yet: combine reconstruction with world model generation into a single pipeline. Reconstruction methods (UrbanGS, CityGaussian, PG-SAG) produce accurate static geometry but actively throw away everything that moves. World models generate dynamics but you cannot pull geometry out of them (except the Gaussian-based and occupancy-based ones, and those are still early-stage or coarse-resolution).

Nobody has closed the loop. The reconstruction people build the static scene. The world model people generate the motion. They are complementary, not competing. Reconstruction captures the stage. World models animate the actors. They need each other but they are not talking enough yet.

The convergence hypothesis is that world models will eventually provide priors for unobserved regions (occluded building facades, unseen interiors) while reconstruction provides ground-truth supervision for training better world models. Cosmos-NuRec is the first concrete implementation of this loop.

<h3><b>Cross-Paradigm Patterns</b></h3>

Several architectural patterns recur across paradigms, suggesting deep structural constraints rather than coincidental design choices.

**The autoregressive-to-diffusion transition.** Within RL: IRIS (autoregressive, ICLR 2023) to DIAMOND (diffusion, NeurIPS 2024). Within driving: GAIA-1 (autoregressive, 2023) to GAIA-2 (diffusion, 2024). Within occupancy: OccWorld (autoregressive, ECCV 2024) to OccSora (diffusion, 2024). The pattern is universal: autoregressive models are simpler to train but accumulate errors frame-by-frame; diffusion models preserve more information at higher compute cost. The shift happens when a paradigm matures enough that fidelity matters more than simplicity.

Why does diffusion preserve more information? Autoregressive world models must tokenize -- convert continuous visual data into a finite vocabulary of discrete symbols (typically via VQ-VAE with 8K-16K codebook entries). Every frame is quantized into this fixed codebook, and the transformer predicts the next token from the previous sequence. The quantization step is lossy by design: a codebook of 8,192 entries cannot represent every possible 64x64 patch. Visual details that fall between codebook entries are silently rounded to the nearest match. Diffusion models sidestep this bottleneck entirely. Instead of discretizing into tokens, a diffusion model works in continuous space: it learns to iteratively denoise a corrupted version of the data, starting from pure noise and progressively recovering the signal. At each denoising step, the model makes a continuous prediction -- no quantization, no codebook, no forced rounding.

There is a second, subtler advantage. Autoregressive models generate tokens left-to-right, conditioning each token on all previous tokens. An error in token 5 propagates to all subsequent tokens -- the model is conditioned on its own mistakes. Diffusion models generate all spatial positions simultaneously in each denoising step. A local error in one region does not condition the generation of other regions -- the denoising process is spatially parallel, not sequential. Errors are local rather than cascading.

The tradeoff is compute: a diffusion model requires 20-100 denoising steps per frame, each requiring a full model forward pass. An autoregressive model generates tokens in a single forward pass per token. This is why autoregressive models dominated early -- they are cheaper per prediction. But as fidelity becomes the binding constraint, diffusion wins.

**The decoder-free convergence.** Across three independent lineages, the field converges on the same insight: pixel-level reconstruction wastes capacity.

- **JEPA** never had a decoder -- predicting in latent space was the founding principle.
- **Dreamer** removed it: DreamerPro (2022), R2-Dreamer (2026), NE-Dreamer (2026), Dreamer-CDP (2026) each replaced pixel reconstruction with self-supervised alternatives.
- **Object-centric** replaced pixel targets with DINO features: DINOSAUR (2023) and successors reconstruct frozen foundation model features instead of pixels.

This raises a critical question for 3D: does removing the reconstruction objective lose geometric information, or does it free the model to learn spatial structure *better*? NE-Dreamer's gains specifically on spatial reasoning tasks suggest the latter -- but nobody has tested this on 3D geometric tasks.

Why might removing reconstruction actually improve spatial learning? It sounds paradoxical, but the answer lies in what reconstruction actually optimizes for. When a world model has a pixel reconstruction objective, the loss function penalizes every pixel equally. A 1-pixel error in a sky region costs the same as a 1-pixel error in a building edge. But sky pixels outnumber building-edge pixels by orders of magnitude, especially in urban aerial imagery. The model allocates its limited representational capacity proportionally to the loss gradient -- and most of that gradient comes from large, texturally complex but spatially simple regions (sky gradients, foliage textures, pavement patterns). The small fraction of pixels that encode geometric structure (edges, corners, depth discontinuities) gets a proportionally small share of the model's capacity.

R2-Dreamer demonstrates this directly: its biggest gains are on DMC-Subtle, a benchmark specifically designed with tiny task-relevant objects in visually rich scenes. With reconstruction, most capacity goes to predicting the complex background; the tiny task-relevant features get drowned out. Without reconstruction, the Barlow Twins objective simply asks: "are your latent dimensions informative and uncorrelated?" The model is free to allocate capacity to whatever is most useful for downstream prediction, which turns out to be spatial and dynamic structure rather than texture.

**The compositional advantage.** When tasks involve reasoning about relationships between objects, compositional representations consistently outperform monolithic ones:

- **SOLD > DreamerV3** on relational manipulation (ICML 2025) -- slot-based imagination beats monolithic RSSM imagination
- **AXIOM > DreamerV3** on Gameworld (60% better, orders of magnitude fewer params) -- mixture model slots beat neural monolithic latent
- **SlotFormer** enables coherent long-horizon rollouts where pixel-level models fail -- per-object prediction isolates errors

The principle: monolithic latent states (RSSM, TD-MPC2 continuous latent) encode all objects into a single vector, making it hard for downstream models to reason about specific object relationships. Slot-based representations make objects explicit. Urban scenes are inherently object-structured: buildings, vehicles, infrastructure, vegetation. The compositional advantage should apply -- but slots are blind to geometric structure, and urban scenes have far more objects (100+) than any benchmark tested.

**The dense-to-sparse evolution.** Occupancy models: OccWorld (dense voxels) to SparseWorld (sparse queries). NeRF: dense volumetric to 3DGS (sparse explicit primitives). The same computational pressure -- real-time deployment requires sub-quadratic memory -- drives both domains toward sparse representations. This suggests that any world model intended for deployment (not just research benchmarks) will need to adopt sparse structures.

<h3><b>The Evaluation Problem</b></h3>

How do you measure whether a world model is any good? WorldScore (ICCV 2025) was one of the first serious attempts, decomposing evaluation into controllability, quality, and dynamics across 20 models. But standardized benchmarking remains fragmented. Every paradigm measures something different:

| Paradigm | Primary metrics | Benchmark |
|---|---|---|
| JEPA | Downstream task accuracy (ImageNet, Kinetics) | Transfer learning benchmarks |
| Genie | Qualitative consistency (no public benchmark) | Internal DeepMind evaluation |
| Cosmos | Camera pose recovery rate (62.6%), FID/FVD | Custom; some RealEstate10K |
| Tokenized AR | Human-normalized RL score | Atari 100k |
| Occupancy | IoU, mIoU at 1-3s horizons | Occ3D-nuScenes, UniOcc |
| AXIOM | Gameplay score, learning steps | Gameworld 10K |
| DreamerV3 | Episode reward across 150+ tasks | DMC, Atari, Minecraft, DMLab |
| TD-MPC2 | Episode reward, 104 tasks | DMC-hard, Meta-World |
| SOLD | Manipulation success rate | Robotic manipulation sim |
| SlotFormer | mIoU, VQA accuracy | CLEVRER, OBJ3D |

Occupancy models are the exception: Occ3D-nuScenes provides a genuine standard with comparable numbers. UniOcc (ICCV 2025) further standardizes within the occupancy domain. This is what benchmarking *should* look like -- and it only exists in this one paradigm.

Genie 2/3 don't even have public papers. Meanwhile, in the structured 3D domain, automated metrics don't reliably predict human quality preferences. The evaluation methodology for world models and for 3D reconstruction are both independently broken, and nobody has bridged them.

<h3><b>Why Does Any of This Matter?</b></h3>

A few reasons.

**Robotics and embodied AI.** If you want a robot that does not break things, it helps if it can imagine what will happen before it moves. That is what world models give you. V-JEPA 2-AC doing zero-shot robot manipulation from just 62 hours of unlabeled video is the most concrete proof point we have so far.

**Grounding language models.** LLMs hallucinate about the physical world because they have never interacted with it. World models are one way to give them that grounding. Cosmos is already doing this -- its text encoder is a physics-reasoning VLM, not a generic language model, and the difference shows.

**3D reconstruction and urban modelling.** This is where my own interest sits. I spent a good part of my life in the spatio-temporal world: quantitative geography, urban science, earth observation, spatio-temporal statistics and ML. I can see a lot of ideas that have emerged in those domains playing an important role here. Spatial autocorrelation as a prior for scene consistency. Spatio-temporal point processes for modelling dynamic urban elements. Uncertainty quantification methods from geostatistics applied to novel view confidence. The flow of ideas between these fields feels like it is just getting started.

<h3><b>Where This Is Heading</b></h3>

The signal from CVPR 2026 is clear: world models and 3D reconstruction are converging. The new "4D World Models: Bridging Generation and Reconstruction" workshop joins USM3D's traditional focus on structured urban reconstruction, and both communities are increasingly talking to each other.

Six trends I am watching:

**1. Generated frames as reconstruction input.** Cosmos's 62.6% pose recovery rate means generated video has enough structure to potentially augment sparse SfM captures. If this works, world models could become a data source for reconstruction, not just a consumer of reconstructed scenes.

**2. Active inference for capture planning.** AXIOM's free-energy-based action selection and TD-MPC2's MPPI trajectory optimization both formalize the "which view should I acquire" question. From different mathematical frameworks. If either transfers from games/manipulation to urban scenes, reconstruction capture could become truly adaptive.

**3. The representation spectrum.** JEPA (latent, no output) to DreamerV3 (latent, imagination only) to object-centric slots (per-object latent, no geometry) to Genie (pixels, no geometry) to tokenized autoregressive (discrete tokens, lossy) to Cosmos (pixels with 3D structure) to OccWorld (discrete 3D voxels) to GaussianDWM (explicit 3DGS) to reconstruction (full geometry). These are not categories -- they are points on a continuum, and the boundaries are becoming porous. Dreamer-CDP imports JEPA into RL. SOLD imports slots into imagination-based RL. Cosmos-NuRec bridges generation and reconstruction. The interesting work in the next year will happen at every boundary.

**4. Occupancy as a bridge representation.** The occupancy paradigm evolved faster than any other in 2024-2025 -- from OccWorld's autoregressive baseline to SparseWorld's real-time sparse queries in under two years. Drive-OccWorld already closes the perception-to-planning loop. The open question is whether any of this transfers beyond driving.

**5. The decoder-free convergence.** Across three independent lineages -- JEPA (never had a decoder), Dreamer (removed it: R2-Dreamer, NE-Dreamer), and object-centric (replaced pixel targets with DINO features: DINOSAUR) -- the field converges on the same insight: pixel-level reconstruction wastes capacity on task-irrelevant details. This matters for 3D because the question becomes: does removing reconstruction lose geometric information, or does it actually free the model to learn spatial structure better? Nobody has tested this yet.

**6. Compositional vs monolithic latent dynamics.** SOLD outperforms DreamerV3 on relational tasks. AXIOM beats it with 442x fewer parameters. The message: when scenes have object structure, object-centric representations win. Urban scenes are inherently object-structured (buildings, vehicles, infrastructure). The question is whether slot-based decomposition can handle urban geometric complexity -- or whether AXIOM's mixture model approach, which naturally adapts its slot count, is the better fit.
