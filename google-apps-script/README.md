# wish board storage (Google Sheet)

1. Create a new Google Sheet, e.g. "graduation wishes".
2. **Extensions → Apps Script**. Delete what's there, paste `wishes.gs`, save.
3. **Deploy → New deployment** → type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   → Deploy → allow the permissions → copy the **Web app URL** (ends in `/exec`).
4. Paste it into `_data/graduation.yml`:
   ```yaml
   wishes_api: https://script.google.com/macros/s/XXXX/exec
   ```
5. Push. The board now loads and saves real wishes; the sample notes disappear.

## moderating
- Wishes land in the `wishes` tab: time | name | text | color | hidden.
- Hide one: type `TRUE` in its **hidden** cell. Remove one: delete the row.
- Changes show on the site at the next page load.

## if you edit the script later
Deploy → **Manage deployments** → edit (pencil) → Version: **New version** → Deploy.
This keeps the same URL. ("New deployment" would give a new URL.)
