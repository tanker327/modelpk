# Proposal: Add Lazy Model Results

## Why
Currently, when users add a new model to the comparison after results are already displayed, they must click the "Submit" button again to trigger requests for all models, including those already showing results. This creates unnecessary friction and network overhead. Users should be able to incrementally add models and fetch their results individually.

## What Changes
- When results are already displayed and a user selects a new model, automatically add a result box with "Not fetched yet" status
- Display a refresh button on the new result box that fetches only that specific model's result
- Preserve existing results when new models are added
- No change to the initial Submit flow (all selected models are fetched together)

## Impact
- Affected specs: `comparison-ui` (new spec)
- Affected code:
  - `src/pages/ComparisonPage.tsx` (model selection and response handling logic)
  - `src/components/comparison/ResponsePanel.tsx` (may need status indicator updates)
