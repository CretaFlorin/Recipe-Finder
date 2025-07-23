# Recipe Finder

Recipe Finder is an AI-powered app that generates recipes tailored to your preferences.

## Requirements

- [Ollama server](https://ollama.com/) installed and running locally  
- Node.js and npm installed  

## Environment Variables

Create a `.env` file in the backend folder with the following keys (although the app uses local Ollama server, these are NOT required):

```env
OPENAI_API_KEY=''
GEMINI_API_KEY=''
```

## Running the App


### Makefile
```bash
make start-all
```


### Manual

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

Runs on port `3000`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on port `5173`


### Database Setup

Run Prisma migrations to create the SQLite database:

```bash
make migrate
```

or

```bash
cd backend
npx prisma migrate dev --name init
```


## Using Ollama Server

Make sure you have the Ollama server installed and running locally. For installation instructions, visit [https://ollama.com/](https://ollama.com/).

## Usage

1. Enter ingredients or preferences in the frontend.  
2. Click “Generate” to get AI-generated recipes.  
3. View and explore your customized recipes.

---

Enjoy cooking with AI-powered Recipe Finder!
