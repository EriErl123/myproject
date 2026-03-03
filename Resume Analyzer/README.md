# AI Resume Analyzer

Simple webpage for resume analysis with:
- NLP-based writing feedback
- Keyword matching against a job description
- AI mode scoring (Balanced, Strict ATS, Creative Coach)
- Weighted ATS-style score breakdown with semantic fit
- Priority gap suggestions with severity
- Resume upload support (.txt and .pdf)
- Advanced AI insights (semantic similarity + section coverage)
- ATS risk flags and tailored bullet rewrite suggestions

## Run

Open `index.html` in your browser.

## How it works

1. Upload your resume (.txt/.pdf) or paste resume text.
2. Paste a job description.
3. (Optional) Set analysis mode, target role, and experience level.
3. Click **Analyze Resume**.
4. Review:
   - AI resume score + mode-based weighted breakdown
   - Action verbs, quantified results, readability, semantic fit
   - Matched vs missing keywords
   - Priority gaps with severity labels
   - AI coach feedback + AI insights
   - Tailored bullet rewrite suggestions
   - ATS risk flags

## Extras

- **Load Sample** button to test the analyzer quickly
- **Clear** button to reset all inputs/results
- **Upload Resume** supports `.txt` and `.pdf` files

## Notes

- This is a lightweight client-side analyzer (no server required).
- Results are heuristic and intended as guidance.
