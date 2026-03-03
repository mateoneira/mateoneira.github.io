---
layout: default
permalink: /the-alpha-blending-problem/
excerpt: 3D Gaussian Splatting achieves real-time novel view synthesis by representing scenes as millions of alpha-blended ellipsoids. Making this representation semantically meaningful turns out to be surprisingly hard. This post surveys the core technical challenge, the alpha-blending problem, and the three paradigms that have emerged to address it across the CVPR, ECCV, and ICCV 2024–25 literature.
---

<h2><b>The Alpha-Blending Problem: Semantic Segmentation in 3D Gaussian Splatting</b></h2>

[3D Gaussian Splatting](https://arxiv.org/abs/2308.04079) (3DGS) is often introduced as a real-time rendering technique. More precisely, it is a *scene representation*: an explicit collection of 3D Gaussians, optimised from posed photographs, that can be rendered via differentiable alpha-compositing. The rendering problem is largely solved, reaching real-time framerates at photorealistic quality. The open problem is making the representation *semantic*: attaching object labels, language features, or instance IDs to individual Gaussians so that the 3D scene can be queried, segmented, and understood.

This turns out to be harder than it looks, for a specific and identifiable reason. The same alpha-blending operation that makes rendering fast and differentiable also makes semantic assignment fundamentally ambiguous at object boundaries. Every semantic 3DGS method published in 2024–25 can be understood as a different strategy for resolving this ambiguity.

This post covers: (1) the 3DGS representation and its rendering equation, (2) the alpha-blending problem and its three failure modes, (3) a taxonomy of approaches across three paradigms: feature-field distillation, 2D-to-3D lifting, and identity-centric methods, (4) the per-scene optimisation bottleneck, and (5) open challenges at urban scale.

<h3><b>Background: 3D Gaussian Splatting</b></h3>

I won't go into a deep dive into 3DGS, that is not the purpose of this post. For the curious ones, there is a great blog post that goes into all the details by [Aras](https://aras-p.info/blog/2023/09/05/Gaussian-Splatting-is-pretty-cool/). 

**From NeRF to 3DGS.** 
3DGS was born as a response to the shortcomings of [Neural Radiance Fields](https://arxiv.org/abs/2003.08934). Neural Radiance Fields encode a scene as a continuous function. Basically an MLP mapping a 5D input (3D position + 2D viewing direction) to colour and density. Rendering requires ray-marching through this function at many sample points per pixel, resulting in slow training and inference. The scene has no explicit geometry; extracting a mesh requires running Marching Cubes over a voxel grid of density queries.

3DGS replaces the implicit MLP with an *explicit* set of 3D Gaussians. Each primitive is defined by:

- A position (mean) $$\mu \in \mathbb{R}^3$$
- A covariance matrix $$\Sigma \in \mathbb{R}^{3 \times 3}$$, decomposed as $$\Sigma = RSS^TR^T$$ where $$R$$ is a rotation matrix and $$S$$ is a diagonal scaling matrix — each Gaussian is an oriented ellipsoid
- An opacity $$\alpha \in [0, 1]$$
- View-dependent colour encoded via **spherical harmonics** (SH) coefficients — the directional analogue of Fourier series, allowing each Gaussian to change appearance with viewing angle

**Rendering.** 
To produce an image, each 3D Gaussian is projected onto the image plane (a 3D Gaussian projects to a 2D Gaussian analytically), sorted by depth, and composited front-to-back via alpha-blending. The pipeline is fully differentiable, enabling gradient-based optimisation of all Gaussian parameters against posed photographs. Starting from a sparse Structure-from-Motion point cloud, a typical scene converges in minutes and renders at real-time framerates.

**Adaptive density control.** 
During optimisation, the system clones Gaussians in under-reconstructed regions (high positional gradient, small scale) and splits Gaussians that are too large and span multiple structures. This allows the representation to allocate capacity where the scene needs it. Fewer Gaussians on flat walls, more on high-frequency textures.

The result is a scene represented by 1–6 million oriented ellipsoids. It is neither a mesh nor an implicit function, but a cloud of soft, overlapping primitives, and this property is precisely what makes semantics difficult.

<h3><b>The Alpha-Blending Problem</b></h3>

The 3DGS rendering equation computes each pixel's colour as:

$$C = \sum_{i \in \mathcal{N}} c_i \alpha_i \prod_{j < i}(1 - \alpha_j)$$

where $$c_i$$ is the colour of the $$i$$-th Gaussian, $$\alpha_i$$ is its opacity after projection, and $$\prod_{j<i}(1 - \alpha_j)$$ is the accumulated transmittance (the fraction of light not yet absorbed by closer Gaussians). This soft, differentiable compositing produces anti-aliased renders. It is also the source of essentially every difficulty in making Gaussians semantically meaningful.

At an object boundary, multiple Gaussians from different objects contribute to the same pixel with different alpha-weights. The pixel's colour is correct (it is the right weighted blend), but the pixel has no single object assignment, only a continuous mixture.

This creates three concrete failure modes:

**1. Feature averaging.** 
If a semantic feature vector is stored per Gaussian and rendered using the same alpha-compositing equation, the rendered feature at a boundary pixel is a weighted average of features from different objects. CLIP features from a building and a tree, for example, do not average to anything semantically meaningful. Discriminability at instance boundaries is destroyed by the blending operation.

**2. Multi-view inconsistency.** 
Gaussian opacities and depth orderings change with camera position. The same Gaussian may be a minor contributor from one viewpoint and the dominant one from another. When 2D segmentation masks (e.g. from [SAM](https://arxiv.org/abs/2304.02643)) are used as supervision, different views can assign contradictory labels to the same Gaussian.

**3. Occluded Gaussian undersupervision.** 
Gaussians that are consistently occluded by foreground objects receive near-zero gradient signal during semantic training. Their semantic labels remain effectively unconstrained. When queried from a novel viewpoint where these Gaussians become visible, their labels are undefined.

All semantic 3DGS methods published in 2024–25 address the same underlying question: how to assign discrete, reliable meaning to primitives whose rendered contribution is inherently continuous and mixed. All methods can be classified into three main paradigms.

<h3><b>Paradigm 1: Feature-Field Distillation</b></h3>

The feature-field approach augments each Gaussian with a learned semantic feature vector, trained to match 2D features from a pre-trained "teacher" model (CLIP, SAM, LSeg). At inference, the feature field is rendered into a 2D feature map via the standard alpha-compositing equation, then decoded for downstream tasks.

[LangSplat](https://langsplat.github.io/) builds a 3D language field using OpenCLIP features compressed through a per-scene autoencoder. The resulting representation supports open-vocabulary text queries in 3D. So querying "red chair" produces a relevance map over the rendered feature field. On the 3D-OVS dataset, LangSplat achieves 93.4 mIoU (up from 54.8 for the NeRF-based LERF baseline) while running ~200x faster at query time.

[Feature 3DGS](https://arxiv.org/abs/2312.03203) generalises this into a framework with a parallel N-dimensional Gaussian rasterizer that renders RGB and semantic features jointly under a combined loss $$\mathcal{L} = \mathcal{L}_{rgb} + \gamma \mathcal{L}_f$$. A lightweight convolutional speed-up module upsamples low-dimensional rendered features to the teacher's full dimension. On Replica: mIoU 0.782 at 14.55 FPS with the speed-up module enabled.

[DF-3DGS](https://cvpr.thecvf.com/virtual/2025/poster/34457) decouples the semantic field from the colour field and applies hierarchical compression: quantisation plus a scene-specific autoencoder. This reduces the number of semantic Gaussians from ~600k to ~29k with minor mIoU loss, and a fastest variant trains in 8 minutes (down from 99 minutes).

**Limitation.** All feature-field methods inherit the alpha-blending problem directly: rendered features at object boundaries are blended mixtures, reducing instance-level discriminability.

<h3><b>Paradigm 2: 2D-to-3D Lifting</b></h3>

Rather than learning continuous features, lifting methods assign discrete object IDs to Gaussians by aggregating 2D segmentation masks across multiple views. If a Gaussian contributes primarily to pixels labelled as object $$k$$ in multiple views, it is assigned to object $$k$$.

[Gaussian Grouping](https://arxiv.org/abs/2312.00732) learns a 16D identity embedding per Gaussian, rendered via alpha-compositing and classified into $$K$$ mask IDs through a linear layer. A 3D spatial regularisation loss penalises nearby Gaussians with dissimilar embeddings, providing supervision signal for occluded regions. Replica panoptic mIoU: 71.15 at ~140 FPS.

[FlashSplat](https://arxiv.org/abs/2409.08270) makes an important observation: when Gaussian geometry and opacity are fixed, alpha-compositing is *linear* in per-Gaussian labels. This means the label assignment problem can be formulated as a linear programme and solved in closed form, so no iterative gradient descent is required. The optimal assignment falls out of a single LP solve. Runtime: 26 seconds per scene (vs. minutes for learning-based methods). NVOS mIoU: 91.8.

[Unified-Lift](https://arxiv.org/abs/2503.14029) takes an end-to-end approach, learning a global object codebook ($$L=256$$ entries) alongside per-Gaussian features. An area-aware ID mapping stabilises cross-view consistency, and an uncertainty score filters noisy SAM pseudo-labels. LERF-Mask mIoU: 80.9, the current strongest result on this benchmark.

**Limitation.** Lifting quality depends on (a) 2D mask quality from the teacher model and (b) cross-view consistency of instance IDs. Both degrade with larger viewpoint changes and noisier imagery.

<h3><b>Paradigm 3: Identity-Centric Methods</b></h3>

Identity-centric methods sidestep the blending problem by making object identity discrete at the representation level, rather than learning around the continuous rendering equation.

[ILGS](https://openaccess.thecvf.com/content/ICCV2025/papers/Jang_Identity-aware_Language_Gaussian_Splatting_for_Open-vocabulary_3D_Semantic_Segmentation_ICCV_2025_paper.pdf) assigns each Gaussian a 16D identity embedding trained with a contrastive loss where same-object Gaussians are pulled together in embedding space, different-object Gaussians are pushed apart. Cross-view pseudo-IDs are obtained from [DEVA](https://arxiv.org/abs/2309.03903) tracking applied to SAM segments. An outlier filter removes Gaussians whose rendered identity disagrees with the pseudo-label. LERF average mIoU: 80.5.

**ObjectGS** ([Zhang et al., ICCV 2025](https://arxiv.org/abs/2504.08452)) represents objects as explicit anchor-based clusters built on [Scaffold-GS](https://arxiv.org/abs/2312.00109) ([Lu et al., 2024](https://arxiv.org/abs/2312.00109)). Each Gaussian inherits a **one-hot** object ID from its anchor — no regression or continuous features, only a hard categorical assignment trained with cross-entropy loss (weight 0.2). Results: 3D-OVS mIoU 96.4, ScanNet++ IoU 95.38 — the highest numbers in the field.

**Trend.** Across the three paradigms, there is a clear empirical pattern: more discrete semantics yield higher segmentation accuracy. The open question is scalability — one-hot encoding over 20 indoor objects is straightforward; extending to tens of thousands of instances at urban scale has not been demonstrated.

<h3><b>Summary of Methods</b></h3>

| Method | Venue | Paradigm | Key Mechanism | Benchmark | mIoU |
|--------|-------|----------|---------------|-----------|------|
| LangSplat | CVPR 2024 | Feature distillation | OpenCLIP features + autoencoder | LERF | 51.4 |
| Feature 3DGS | CVPR 2024 | Feature distillation | N-dim parallel rasterizer | Replica | 78.7 |
| DF-3DGS | CVPR 2025 | Feature distillation | Hierarchical compression | Replica | ~78 |
| Gaussian Grouping | ECCV 2024 | 2D-to-3D lifting | 16D embedding + spatial regularisation | Replica | 71.2 |
| FlashSplat | ECCV 2024 | 2D-to-3D lifting | Linear programme (closed-form) | NVOS | 91.8 |
| Unified-Lift | CVPR 2025 | 2D-to-3D lifting | Object codebook + uncertainty filtering | LERF-Mask | 80.9 |
| ILGS | ICCV 2025 | Identity-centric | Contrastive identity embedding | LERF | 80.5 |
| ObjectGS | ICCV 2025 | Identity-centric | One-hot anchor IDs (Scaffold-GS) | 3D-OVS | 96.4 |

<h3><b>The Per-Scene Optimisation Bottleneck</b></h3>

A structural property shared by all methods above is worth highlighting: every one is a **per-scene, transductive optimisation**. The workflow is: (1) run Structure-from-Motion on a specific image set, (2) initialise Gaussians from the resulting point cloud, (3) optimise 3DGS for ~30k iterations, (4) run semantic optimisation for an additional 10k–30k iterations. The output is a set of parameters fitted to *that specific scene*. There are no cross-scene learned priors.

This contrasts sharply with the 2D segmentation landscape. [SAM](https://arxiv.org/abs/2304.02643) runs inference in milliseconds on unseen images. [CLIP](https://arxiv.org/abs/2103.00020) ([Radford et al., 2021](https://arxiv.org/abs/2103.00020)) generalises zero-shot across distributions. [Mask2Former](https://arxiv.org/abs/2112.01527) ([Cheng et al., 2022](https://arxiv.org/abs/2112.01527)), trained once on COCO, segments arbitrary scenes. These are *inductive* models that have learned general visual priors. 3DGS remains in the NeRF-era paradigm where the parameters *are* the scene.

The practical consequences are:

- **Throughput.** A pipeline requiring 30k + 30k iterations per scene cannot process thousands of buildings. It is a research loop, not a scalable inference system.
- **No transfer.** Features learned for one reconstruction do not carry over to another. A Gaussian labelled "rooftop" in scene A provides no information about rooftops in scene B.
- **No incremental updates.** If the scene changes (construction, seasonal variation), the entire optimisation must be re-run.

Recent work on feed-forward Gaussian prediction — [Splatt3R](https://arxiv.org/abs/2408.07990) (Smart et al., 2024), MASt3R-based methods, [MVSplat](https://arxiv.org/abs/2403.14627) (Chen et al., 2024) — can predict Gaussian scene representations from images in a single forward pass without per-scene optimisation. These models are not yet semantic, but the direction is clear: the natural next step is feed-forward encoders that output semantically-labelled Gaussians directly, trained once on large-scale data and deployed at inference time without per-scene fine-tuning.

<h3><b>Open Challenges: Urban Scale</b></h3>

The standard evaluation datasets — ScanNet, Replica, LERF-Mask, 3D-OVS — are indoor scenes with 20–50 objects. Unified-Lift's Messy Rooms benchmark extends this to ~500 objects. Urban-scale deployment involves qualitatively different challenges:

**Object count.** A single London borough contains ~50,000 buildings. Unified-Lift's codebook has 256 entries. ObjectGS's one-hot encoding has not been tested beyond small object counts. Whether current representations can scale to this regime — or whether fundamentally different approaches are needed — is an open empirical question.

**Scene composition.** Indoor benchmarks feature walls, furniture, and discrete objects in controlled environments. Urban outdoor scenes include sky, vegetation, parked vehicles, pedestrians, and buildings of widely varying geometry. 2D segmentation masks from SAM are considerably noisier on outdoor imagery, and multi-view consistency is harder to achieve across wide-baseline aerial viewpoint changes versus room-scale scanning.

**Temporal illumination variation.** Indoor benchmarks assume approximately constant lighting. Aerial imagery of cities is collected over months, across weather conditions and times of day. Spherical harmonics model view-dependent colour but were not designed for temporal illumination changes within a reconstruction dataset.

**LiDAR integration.** Urban reconstruction often begins with airborne LiDAR, which provides precise geometry without appearance information. All current semantic Gaussian methods assume photographic input. Hybridising LiDAR-derived geometric priors with learned semantic Gaussians from imagery remains unaddressed.

**Instance tracking at scale.** DEVA-based tracking performs well on short, densely-sampled image sequences. Maintaining consistent instance IDs across thousands of frames from mixed aerial and street-level cameras, captured on different dates, is a substantially harder problem. The cross-view consistency assumptions underlying methods like ILGS and ObjectGS have not been validated at this scale.

<h3><b>Future Directions</b></h3>

Several research directions appear promising based on the current trajectory:

**Feed-forward semantic Gaussians.** The building blocks exist independently: feed-forward Gaussian predictors (Splatt3R, MVSplat), open-vocabulary 2D segmentation (SAM 2, Grounded-SAM), and large-scale 3D datasets (Objaverse, urban captures). A model that jointly predicts Gaussians and semantic labels from multi-view images in a single pass — without per-scene optimisation — would make existing methods obsolete for throughput-sensitive applications.

**Hybrid discrete-continuous representations.** ObjectGS's discrete one-hot IDs achieve the best segmentation accuracy; LangSplat's continuous CLIP embeddings provide open-vocabulary flexibility. A natural synthesis would combine discrete instance identity with continuous semantic attributes — a Gaussian carries both a categorical object ID and a dense feature embedding — with calibrated uncertainty over boundary assignments.

**Urban-scale benchmarks.** The gap between indoor evaluation and outdoor deployment is large enough to expect the emergence of city-scale semantic Gaussian benchmarks. These would need to include outdoor scenes with >1,000 instances, aerial viewpoints, temporal variation, and LiDAR integration protocols. Such benchmarks are likely to expose failure modes that current indoor evaluations do not capture.

<h3><b>Conclusion</b></h3>

3D Gaussian Splatting began as a faster alternative to NeRF for novel view synthesis. The research community is now working to make it a *semantic* scene representation — and this is harder in a technically precise sense. The alpha-compositing equation that enables real-time differentiable rendering is exactly what makes semantic label assignment ambiguous at object boundaries.

The 2024–25 literature has converged on three strategies: distill continuous features (fast and flexible, but boundary-ambiguous), lift discrete IDs from 2D masks (explicit instances, but dependent on mask quality), or enforce discrete identity at the representation level (best accuracy, but untested at scale). The empirical trend favours discretisation — ObjectGS's 96.4 mIoU on 3D-OVS, up from LangSplat's 51.4 on LERF in under two years, represents rapid progress.

The remaining structural bottleneck is per-scene optimisation. Until feed-forward models can predict semantically-labelled Gaussians directly from images, these methods remain proof-of-concepts rather than deployable pipelines. The transition from transductive, per-scene fitting to inductive, cross-scene prediction is likely where the most impactful work in this space will happen next.

<h3><b>References</b></h3>

- Chen et al. "MVSplat: Efficient 3D Gaussian Splatting from Sparse Multi-View Images." 2024. [arXiv:2403.14627](https://arxiv.org/abs/2403.14627)
- Cheng et al. "Masked-attention Mask Transformer for Universal Image Segmentation." CVPR 2022. [arXiv:2112.01527](https://arxiv.org/abs/2112.01527)
- Cheng et al. "Tracking Anything with Decoupled Video Segmentation." ICCV 2023. [arXiv:2309.03903](https://arxiv.org/abs/2309.03903)
- Groenendijk et al. "ILGS: Instance-Level Gaussian Splatting." ICCV 2025. [arXiv:2501.06575](https://arxiv.org/abs/2501.06575)
- Kerbl et al. "3D Gaussian Splatting for Real-Time Radiance Field Rendering." SIGGRAPH 2023. [arXiv:2308.04079](https://arxiv.org/abs/2308.04079)
- Kirillov et al. "Segment Anything." ICCV 2023. [arXiv:2304.02643](https://arxiv.org/abs/2304.02643)
- Li et al. "DF-3DGS: Decoupled Feature 3D Gaussian Splatting." CVPR 2025. [arXiv:2411.12657](https://arxiv.org/abs/2411.12657)
- Lu et al. "Scaffold-GS: Structured 3D Gaussians for View-Adaptive Rendering." CVPR 2024. [arXiv:2312.00109](https://arxiv.org/abs/2312.00109)
- Mildenhall et al. "NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis." ECCV 2020. [arXiv:2003.08934](https://arxiv.org/abs/2003.08934)
- Qin et al. "LangSplat: 3D Language Gaussian Splatting." CVPR 2024. [arXiv:2312.09245](https://arxiv.org/abs/2312.09245)
- Radford et al. "Learning Transferable Visual Models From Natural Language Supervision." ICML 2021. [arXiv:2103.00020](https://arxiv.org/abs/2103.00020)
- Shen et al. "FlashSplat: 2D to 3D Gaussian Splatting Segmentation Solved Optimally." ECCV 2024. [arXiv:2407.20529](https://arxiv.org/abs/2407.20529)
- Smart et al. "Splatt3R: Zero-shot Gaussian Splatting from Uncalibrated Image Pairs." 2024. [arXiv:2408.07990](https://arxiv.org/abs/2408.07990)
- Ye et al. "Gaussian Grouping: Segment and Edit Anything in 3D Scenes." ECCV 2024. [arXiv:2312.00732](https://arxiv.org/abs/2312.00732)
- Zhan et al. "Unified-Lift: A Unified Framework for 2D to 3D Mask Lifting." CVPR 2025. [arXiv:2501.12413](https://arxiv.org/abs/2501.12413)
- Zhang et al. "ObjectGS: Object-Centric Gaussian Splatting." ICCV 2025. [arXiv:2504.08452](https://arxiv.org/abs/2504.08452)
- Zhou et al. "Feature 3DGS: Supercharging 3D Gaussian Splatting to Enable Distilled Feature Fields." CVPR 2024. [arXiv:2312.03203](https://arxiv.org/abs/2312.03203)
