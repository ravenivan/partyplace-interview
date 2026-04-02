# PartyPlace Venue Search

AI-powered natural language venue search. Describe your event in plain English and get matching venues instantly.

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind
- **Backend:** NestJS, TypeScript
- **AI:** OpenAI GPT-4o-mini

## Getting Started

### Prerequisites
- Node.js (LTS)
- OpenAI API key

### Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```
OPENAI_API_KEY=your_key_here
```
```bash
npm run start:dev
```

Backend runs on `http://localhost:4000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Usage

Enter a natural language query like:
- "Birthday party in Brooklyn for 50 people on a Friday evening"
- "Wedding in Midtown for 100 guests on Saturday with $4000 budget"
- "Small graduation in Chelsea for 20 people on a Wednesday"