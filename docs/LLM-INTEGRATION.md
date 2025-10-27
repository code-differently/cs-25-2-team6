# LLM Integration for RAG System

This section describes the integration of OpenAI's LLM (Large Language Model) with our RAG (Retrieval-Augmented Generation) system for attendance data analysis.

## Overview

The LLM integration enables the application to:
- Process natural language queries about attendance data
- Generate contextually relevant responses
- Suggest relevant actions based on the query and data
- Provide confidence scores for responses

## Setup

1. Copy `.env.local.sample` to `.env.local`:
   ```
   cp .env.local.sample .env.local
   ```

2. Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Test the environment setup:
   ```
   npm run test:env
   ```

5. Test the RAG-LLM integration:
   ```
   npm run test:rag
   ```

## Architecture

The integration follows a layered architecture:

1. **UI Layer**: `RAGQueryBox.tsx` - React component for user input and displaying responses
2. **API Layer**: `app/api/ai/query/route.ts` - Next.js API endpoint that processes queries
3. **Service Layer**:
   - `RAGService.ts` - Orchestrates the query processing workflow
   - `LLMService.ts` - Handles OpenAI API interactions
   - `QueryProcessor.ts` - Classifies queries and extracts entities

## Key Components

### LLMService

The LLMService is implemented as a singleton that manages interactions with the OpenAI API. Key features:

- Conversation context management
- Structured JSON responses
- Error handling and graceful degradation
- Token usage optimization

### RAGService

The RAGService orchestrates the entire query processing workflow:

1. Query intent classification
2. Filter generation based on intent
3. Data retrieval based on filters
4. Response generation using LLM

### Integration Flow

```
User Query → RAGQueryBox → API Route → RAGService → 
  → QueryProcessor (intent classification) → 
  → Data Retrieval → 
  → LLMService (OpenAI interaction) → 
  → Response formatting → 
  → UI display
```

## Customization

You can customize the LLM behavior by modifying the following in your `.env.local` file:

- `OPENAI_MODEL`: Choose between different OpenAI models (default: gpt-3.5-turbo)
- `RAG_SYSTEM_PROMPT`: Change the system prompt that guides the LLM's behavior
- `DEBUG_MODE`: Enable detailed logging for debugging

## Testing

Run the test script to verify the integration:

```
npm run test:rag
```

This will run a sample query through the entire RAG-LLM pipeline and display the results.
