# MindCare English intent model

This educational chatbot uses a **trained multinomial Naive Bayes intent classifier with authored response templates**. It is not a generative language model, neural-network fine-tune, therapist, diagnosis system, or emergency service. No API key, GPU, Python process, or model-provider subscription is required to run it.

An optional OpenAI Responses API integration now generates new replies when a backend API key is configured and local mode is not selected. The statements and accuracy metrics below describe the **local classifier only**; they do not evaluate or claim fine-tuning of the pretrained OpenAI model. See `backend/CHATBOT_LLM_SETUP.md`. Cloud generation is not clinically validated either.

## Data and training

- `backend/data/chatbot-dataset.json`: 120 synthetic English messages across 12 intents, plus authored responses and follow-up templates. No real user conversations are included. These examples have not received qualified clinical review.
- Deterministic split within each intent: examples 1–8 train, example 9 validation, example 10 test. Total: **96 train / 12 validation / 12 test**. Split files include stable example IDs.
- Features: normalized English word counts and adjacent content-word bigrams. Contractions are normalized; negated words have separate unigram features, such as `not_happy`.
- Vocabulary, class priors, and smoothed conditional word probabilities are learned **only from the training split**. Response text is not used to fit the classifier.
- Smoothing is selected from `0.25`, `0.5`, and `1` by validation accuracy, then validation macro-F1. The largest alpha breaks ties. Training does not use the test split to select alpha.
- `intent-model.json` contains the learned parameters and the exact dataset SHA-256. The server refuses to load a model whose dataset hash does not match.
- Inference rejects low scores, small top-two score margins, or insufficient vocabulary coverage and asks for clarification. These conservative demo thresholds are heuristics, not calibrated confidence or clinical probabilities.

Retrain and check, from `backend`:

```sh
npm run train:chatbot
npm test
```

The training script prints measured results and writes `evaluation.json`, including validation results, per-class precision/recall/F1, a confusion matrix, every held-out prediction, and runtime test routing after the fallback and safeguard logic. Repeating training on identical data produces identical output files.

## Measured result for this version

The 12-example validation split has **11/12 correct (91.7%)**. The 12-example test split has **12/12 correct (100%)**, macro-F1 **1.0**; runtime routing also returns the expected intent for all 12 test examples with no fallback.

These are tiny synthetic sets with similar wording to training. They are not independent clinical data, and 100% on 12 messages does not imply real-world accuracy, safe counseling, or reliable crisis detection. Automated checks exercise a finite set of safety phrases and UI behaviors; they do not certify clinical safety. Clinical review and substantially broader, independently authored evaluation are outstanding.

## Application behavior

The existing React page posts to authenticated `POST /api/chat`. Express loads the model locally, predicts an intent, and selects an authored response. It uses up to six messages supplied by the page for brief follow-ups, not persistent long-term memory. The API returns internal navigation actions, which the frontend filters against allowed routes. Actions open pages; they do not book appointments or modify saved records.

`GET /api/chat/model` is also authenticated and returns basic model metadata. The API validates message/history lengths, sets `Cache-Control: no-store`, and limits ordinary requests to 60 per minute per authenticated account in each Node process. This is a demonstration limit, not a distributed production rate limiter.

Separate safety patterns provide urgent-support responses for the tested crisis and acute-medical phrases and refuse diagnosis/prescription requests. Patterns and a small classifier can miss indirect wording, spelling variations, mixed intentions, and non-English messages. Emergency links remain available on the chat page, including during API errors. The bot cannot call emergency services or monitor whether a user is safe.

Chat text is sent to this application's API but is not written to MongoDB or logged by the chat route. It exists in React state while this page is open and is cleared when the page is left or New chat is selected. Deployment-level request logging must also be configured appropriately by the operator.

## Viva explanation

“I trained a supervised multinomial Naive Bayes classifier on synthetic English intent examples. The learned parameters classify messages into support topics. The chatbot uses authored response templates, a clarification fallback, separate safety rules, and existing app navigation links. I evaluated a held-out synthetic test split and tested API and frontend interactions. This is not an LLM fine-tune or a clinically validated assistant.”

Algorithm reference: [Naive Bayes documentation](https://scikit-learn.org/stable/modules/naive_bayes.html). The implementation here is dependency-free JavaScript using the multinomial likelihood calculation; it does not import scikit-learn.
