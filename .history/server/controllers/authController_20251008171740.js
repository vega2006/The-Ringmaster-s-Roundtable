// This imports the new Gemini LLM
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// This imports the mechanism that helps create the messages
// called `prompts` we send to the LLM
import { PromptTemplate } from "langchain/prompts";

// This imports the tool called `chains` that helps combine 
// the model and prompts so we can communicate with the LLM
import { LLMChain } from "langchain/chains";

// This helps connect to our .env file
import * as dotenv from "dotenv";
dotenv.config();