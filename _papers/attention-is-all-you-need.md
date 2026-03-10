---
layout: paper
title: "Attention Is All You Need"
authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin"
year: 2017
venue: "NeurIPS"
paper_url: "https://arxiv.org/abs/1706.03762"
tags: [deep-learning, transformers, attention, nlp]
excerpt: "Introduced the Transformer — an architecture relying entirely on self-attention, without recurrence or convolutions, that became the foundation of modern large language models."
---

## Key Findings

- **Self-attention replaces recurrence entirely.** The model processes all tokens in parallel using scaled dot-product attention rather than sequentially like RNNs/LSTMs. This removes the sequential bottleneck that limited parallelisation during training.

- **Multi-head attention captures diverse relationships.** Running $h$ attention heads in parallel lets the model jointly attend to information from different representational subspaces at different positions. Concretely, each head computes:

$$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

  and the outputs are concatenated and projected: $\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h)\,W^O$.

- **Positional encodings inject sequence order.** Since there is no recurrence to carry order information, sinusoidal encodings are added to token embeddings. Using $\sin$ and $\cos$ at different frequencies means the model can generalise to sequence lengths unseen during training.

- **Encoder–decoder with cross-attention.** The encoder builds contextual representations of the input; the decoder attends over these via cross-attention while autoregressively generating the output. This clean separation proved highly reusable.

- **Strong empirical results at the time.** Achieved 28.4 BLEU on WMT 2014 English-to-German translation, surpassing all prior single-model results, at a fraction of the training cost of recurrent baselines.

## Why It Matters

This paper is arguably the single most consequential architecture paper of the 2010s. Virtually every large language model (BERT, GPT, T5, and beyond) is built on the Transformer backbone introduced here. The insight that sequence modelling can be done entirely through learned pairwise interactions — without any inductive bias towards locality or order — turned out to generalise far beyond NLP, reaching vision (ViT), protein folding (AlphaFold 2), and even 3D scene representations.

The scaling behaviour of attention — $O(n^2)$ in sequence length — became the central engineering challenge of the subsequent decade, spawning a large literature on efficient attention variants (Linformer, Performer, Flash Attention, etc.).

## Notes

- The "scaled" in scaled dot-product attention ($1/\sqrt{d_k}$) is easy to overlook but important: without it, large $d_k$ pushes the dot products into regions where softmax gradients vanish.
- Positional encodings are often swapped for learned absolute or relative position schemes in later work (RoPE, ALiBi). The sinusoidal choice here was motivated by its extrapolation properties, but in practice learned embeddings worked just as well within training distribution.
- The paper's framing around machine translation is somewhat limiting in retrospect — the architecture's generality only became apparent once BERT showed that the encoder alone, pre-trained with masked language modelling, transferred broadly across tasks.
- Connection to my own work: the cross-attention mechanism is structurally similar to how semantic features are lifted from 2D into 3D in several of the Gaussian Splatting methods I've been looking at — the 2D features act as keys/values, and the 3D Gaussian queries attend over them.
