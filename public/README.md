The main resume is a static HTML + PDF pair in `public/resume/`, named
`RileyBeenders_Resume_<YY><DDD>` (year + day of year), copied from `.DefaultResume/`
by the `update-main-resume` skill. The home page's Download PDF opens the HTML
(`data/header.json` `resumeHtmlPath`) in a new tab, where its Print / PDF button
saves the file. `/api/resume-pdf` redirects to the PDF (`resumePdfPath`) for older links.
