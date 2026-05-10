# TravelWise Frontend

TravelWise is an all-in-one travel planning platform that helps travelers discover destinations, save favorite places, read and write reviews, and build organized day-by-day trip itineraries from one simple application.

Instead of switching between many tools for searching, saving, reviewing, and planning, TravelWise keeps the full travel journey connected in one place. The platform is designed to make trip planning easier, faster, and more efficient for travelers.

## Platform Overview

Travel planning can quickly become messy when information is spread across websites, notes, maps, and different apps. TravelWise solves this by combining the most important travel tools into one connected experience.

With TravelWise, users can move smoothly from inspiration to action:

1. Discover destinations and places.
2. Filter places by category, country, and rating.
3. View destination details and reviews.
4. Save favorite places for later.
5. Create personal trips.
6. Build a day-by-day itinerary.
7. Track trips, favorites, reviews, and upcoming plans from the dashboard.

The goal is to give travelers everything they need to plan confidently without losing time switching between platforms.

## Why TravelWise?

TravelWise is built around one simple idea: a traveler should not need five different apps to plan one trip.

The platform brings discovery, decision-making, and itinerary planning together. Users can search for places, compare options, save what they like, and turn those ideas into a structured travel plan.

This makes the experience more efficient because travelers do not need to copy place names into notes, remember which destinations they liked, or rebuild their itinerary manually. Everything stays connected to the user account.

## Traveler Experience

The homepage gives travelers a quick starting point with search, featured destinations, and travel categories.

The explore page helps users narrow down options using filters like destination category, country, and rating.

Place detail pages give travelers more information about each destination, including ratings and reviews, so they can make better decisions.

Favorites let users collect interesting places before deciding which ones belong in a trip.

The planner turns saved ideas into a real itinerary. Users can create a trip, choose travel dates, add a destination, include a description and cover image, and organize activities by day.

The dashboard gives each user a personal overview of their travel activity, including total trips, favorites, reviews, and upcoming plans.

## Main Benefits

- **All-in-one planning**: discovery, favorites, reviews, trips, and itinerary planning are connected.
- **Efficient workflow**: users can move from browsing places to building a trip without switching tools.
- **Personal organization**: every user has their own profile, dashboard, favorites, and trips.
- **Better travel decisions**: ratings and reviews help users choose places with more confidence.
- **Clear itinerary structure**: trips are organized by dates, days, and activities.
- **Simple user experience**: the app is built with clear navigation and protected user routes.
- **Modern interface**: responsive design with light and dark theme support.

## Features

- Browse and search travel destinations
- Filter destinations by category, country, and rating
- View detailed destination pages
- Register and log in
- Save and manage favorite places
- Write and manage reviews
- Create trips with destination, dates, description, and cover image
- Build day-by-day itineraries
- Add places to itinerary days
- Edit trip day hours and activities
- View user dashboard statistics
- Manage user profile
- Use light and dark mode

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Lucide React icons
- ESLint

## Getting Started

### Prerequisites

Install Node.js and npm.

You can check your installed versions with:

```bash
node -v
npm -v
```

### Installation

Install the project dependencies:

```bash
npm install
```

### Environment Variables

Create or update a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:4000
```

For a deployed backend, replace the value with your production API URL:

```env
VITE_API_BASE_URL=https://your-backend-url.com
```

## Running the Project

Start the development server:

```bash
npm run dev
```

The app will run on the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Available Scripts

### Development

```bash
npm run dev
```

Starts the Vite development server.

### Build

```bash
npm run build
```

Builds the app for production.

### Preview

```bash
npm run preview
```

Previews the production build locally.

### Lint

```bash
npm run lint
```

Runs ESLint checks.

## Main Routes

- `/` - Home page
- `/explore` - Browse and filter destinations
- `/places/:id` - Destination details and reviews
- `/login` - User login
- `/register` - User registration
- `/favorites` - Saved favorite places
- `/planner` - Create a new trip itinerary
- `/planner/:id` - Edit or view an existing trip itinerary
- `/trips` - User trips list
- `/trips/:id` - Trip planner view
- `/dashboard` - User dashboard
- `/profile` - User profile

Protected routes require the user to be logged in.

## Project Structure

```text
src/
  components/
    layout/       App layout, navbar, footer, protected routes
    places/       Place cards
    planner/      Trip planner UI components
    ui/           Shared UI components
  contexts/       Auth and theme providers
  hooks/          Data hooks for places, favorites, reviews, and trips
  lib/            API client and normalizers
  pages/          Route pages
  utils/          Date and planner helpers
```

## API Configuration

The frontend reads the backend URL from:

```env
VITE_API_BASE_URL
```

The API client is defined in:

```text
src/lib/api.js
```

Authentication uses a token stored in local storage under:

```text
travelwise_token
```

The frontend expects backend endpoints such as:

- `/users/register`
- `/users/login`
- `/users/me`
- `/places`
- `/categories`
- `/favorites`
- `/reviews`
- `/trips`

## Production Build

Create a production build:

```bash
npm run build
```

The output will be generated in:

```text
dist/
```

## Notes

- Make sure the backend server is running before using API-dependent pages.
- If using the local backend, keep `.env` set to `http://localhost:4000`.
- If routes show empty data, check the browser console and confirm that `VITE_API_BASE_URL` is correct.
