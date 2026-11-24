# UCL Market Place

A student-led prototype for trading and giving away items within the UCL community. The aim is to keep usable items in circulation, especially when students move out of halls or leave the UK.

## Publish on GitHub Pages

1. Extract the ZIP and open the extracted folder.
2. In a new GitHub repository, add the contents of that folder to the repository root. Keep `index.html`, `app.js`, `style.css`, and the `data/` folder at the same level. Commit to `main`.
3. Go to **Settings → Pages**. Choose **Deploy from a branch**, select **main** and **/(root)**, then click **Save**.
4. Open the site URL shown in Pages settings after deployment. Use fictional data for the public demo.

[GitHub Pages publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Run locally

From the extracted directory run `python3 -m http.server 8000` and visit [http://localhost:8000](http://localhost:8000). The data files are loaded over HTTP, so use the local server when testing.

## Demo walkthrough

1. Browse sample items. Try searching for “desk lamp”, selecting **Free stuff**, and turning on **Anonymous posts only**.
2. Choose **Post a listing** and select **Demo student** or **Demo staff member**. Enter fictional item details and choose a campus meeting point, accommodation reception, or locker example.
3. Check **Post anonymously after moderator approval** to send the listing for review. In the account menu, switch to **Demo moderator** and open the moderation queue. Approve it and check that it appears under **Anonymous posts only** with the seller name hidden from the listing.
4. Open a sample listing and leave feedback from a demo account. View the updated seller rating.
5. Scroll to **On campus** for the proposed pop-up launch and future reuse events.

## Editable data

| File | Contents |
| --- | --- |
| `data/categories.json` | Listing categories, labels and icons |
| `data/pickup-points.json` | Example locations, collection methods and access notes |
| `data/listings.json` | Fictional listings with prices, seller IDs, pickup IDs and sample feedback |
| `data/events.json` | Proposed launch and recurring events |

Use unique listing IDs and reference existing category and pickup IDs. Prices are numbers in pounds. A price of 0 appears as Free, including when the item also belongs to a subject category.

Demo changes stay in the current browser. Clear site data to reset the demo. A live UCL-only service needs UCL Microsoft sign-in, shared data, server-side permissions and approved pickup arrangements. See [the handover](README-HANDOVER.md).
