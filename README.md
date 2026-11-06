# Tastes of Africa

A multi-page website celebrating Africa's culinary traditions: its dishes, spices, regions and the stories behind them. Visitors can explore recipes from five countries, learn about the food culture of three regions, save favourite dishes, scale recipes for any number of servings, and switch between dark and light themes.

**Live site:** https://aimelive.github.io/taste_of_africa_website_project/

---

## Features

- **Recipe filter**: filter dishes by region (West, East, North, Southern Africa) without reloading the page.
- **Favourites**: save recipes with the ❤️ button; favourites are stored in `localStorage` and restored on every visit.
- **Ingredient scaler**: change the number of servings and every ingredient quantity recalculates.
- **Dark/light theme**: theme choice is remembered and applied before the page renders, so there's no flash.
- **Contact form validation**: clear inline errors, a minimum 20-character message, and a personalised thank-you message on success.
- **Newsletter signup**: validated email field with instant feedback.
- **Responsive design**: works on phones, tablets and desktops, with a mobile navigation menu.
- **Scroll animations**: sections fade in gently as you scroll.
- **Embedded media**: YouTube videos on the home, recipe and region pages, and Google Maps for each dish's country of origin.

## Pages

| Page | Content |
|---|---|
| **Home** | Hero with intro video, mission, featured dishes, regions, food trends, newsletter |
| **Recipes** | All dishes with filters and favourites |
| **Recipe pages** | Jollof Rice (Nigeria), Lamb Tagine (Morocco), Injera (Ethiopia), Isombe (Rwanda), Bunny Chow (South Africa): cultural background, ingredients, step-by-step instructions, nutrition facts, tutorial video and map |
| **Regions** | West, North and East Africa: food culture, staples, cooking techniques, video and example dishes |
| **About** | Mission, a short history of African cuisine and its global influence, and a map of Kimironko Market, Kigali |
| **Contact** | Accessible contact form with validation |

## Tech stack

- **HTML5**: semantic structure (`header`, `nav`, `main`, `section`, `article`, `figure`, `details`, `mark`, `footer`)
- **CSS3**: custom properties for theming, Flexbox and Grid layouts, responsive units (`rem`, `%`, `clamp()`)
- **Vanilla JavaScript**: DOM manipulation, event listeners, `localStorage`, `IntersectionObserver`
- **Google Fonts**: Bebas Neue (headings), DM Sans (body), IBM Plex Mono (labels)

No frameworks, libraries or build tools.

## Design

A dark, editorial look inspired by African spices: a deep coffee-brown background, warm cream text and a single saffron accent. Large condensed headings, thin divider lines and generous spacing keep each page clean and easy to read. A light theme is also available.

## Project structure

```
taste_of_africa_website_project/
├── index.html          # Home page
├── recipes.html        # All recipes with filters
├── about.html          # Mission, history and map
├── contact.html        # Contact form
├── recipes/            # Individual recipe pages
├── regions/            # Culinary region pages
├── css/
│   └── styles.css      # All styles, grouped by section
├── js/
│   └── script.js       # All interactive features
└── images/             # Food and region photos
```

## How to run

1. Clone the repository:
   ```
   git clone https://github.com/aimelive/taste_of_africa_website_project.git
   cd taste_of_africa_website_project
   ```
2. Serve the folder with a local server (needed for the YouTube videos to play):
   - **VS Code:** right-click `index.html` → **Open with Live Server**, or
   - **Python:** run `python -m http.server` and open http://localhost:8000

Or visit the live site linked above.

## Accessibility

- Every image has descriptive alt text and every form field has a label
- One `h1` per page with a logical heading order
- Keyboard-friendly navigation with visible focus states
- Colour contrast meets WCAG AA in both themes
- Animations are reduced for users who prefer reduced motion

## Credits

- Food and region photos: free-to-use stock images; credit belongs to their original photographers
- Videos: embedded from YouTube; all rights belong to their respective channels
- Maps: Google Maps
- Fonts: Google Fonts

## Author

**Ndayambaje Aime**
