# huyhoang-site

Retro academic page built with Jekyll.

## edit content (no HTML needed)
- `_data/profile.yml` — name, avatar, birthday, github, email, cv, bio
- `_data/affiliations.yml` — experience: school, labs, jobs (newest first)
- `_data/publications.yml` — papers (your name gets underlined automatically)
- put your photo in `assets/img/`, your CV at `assets/cv.pdf`
- affiliation logos go in `assets/img/logos/` (names set in `affiliations.yml`); missing logos show initials

## run locally
```
bundle install
bundle exec jekyll serve
```
open http://localhost:4000

## publish on GitHub Pages
1. push this folder to a repo named `<username>.github.io` (branch `main`)
2. Settings → Pages → Source: **GitHub Actions**
3. the included workflow (`.github/workflows/pages.yml`) builds and deploys on every push

## use as a template
Settings → General → tick **Template repository**. others click **Use this template**,
then edit `_data/*.yml`, swap `assets/img/avatar.jpg`, logos and `assets/cv.pdf`.
