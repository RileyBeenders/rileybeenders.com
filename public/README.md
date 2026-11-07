The Download PDF button serves the main resume, a static PDF in `public/resume/`
printed from `ResumeBuilder/main-resume/main-resume.html` by the
`update-main-resume` skill. `data/header.json` `resumePdfPath` names the file, and
its basename is what a visitor's download is saved as. `/api/resume-pdf`
redirects to that file for older links.
