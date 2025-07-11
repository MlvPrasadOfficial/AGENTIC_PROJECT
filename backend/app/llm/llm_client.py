# LLM Client
# File: llm_client.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Enhanced client for interacting with Ollama locally and other LLM models

import os
import time
import json
from typing import Dict, Any, Optional, List, Union
import requests
import httpx
from pydantic import BaseModel

from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

from app.core.config import settings
from app.utils.logger import setup_logger

# Setup logger
logger = setup_logger(__name__)

class LLMRequest(BaseModel):
    """Request model for LLM calls"""
    prompt: str
    system_message: Optional[str] = None
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000
    stop: Optional[List[str]] = None
    stream: bool = False

class LLMResponse(BaseModel):
    """Response model for LLM calls"""
    text: str
    finish_reason: Optional[str] = None
    model: str
    usage: Dict[str, int]
    processing_time: float

class LLMClient:
    """
    Enhanced client for interacting with Ollama locally and other LLM models.
    Supports both local Ollama models and remote API models with better connection handling.
    """
    
    def __init__(self):
        """Initialize the enhanced LLM client"""
        self.model = settings.OLLAMA_MODEL
        self.api_key = settings.LLM_API_KEY
        self.use_local = settings.USE_LOCAL_LLM
        self.local_url = settings.OLLAMA_BASE_URL
        self.api_url = settings.LLM_API_URL
        self.cache = {}  # Simple in-memory cache
        self.cache_ttl = settings.LLM_CACHE_TTL
        
        # Initialize LangChain Ollama client for better local integration
        try:
            self.ollama_llm = OllamaLLM(
                model=self.model,
                base_url=self.local_url,
                temperature=settings.OLLAMA_TEMPERATURE,
                timeout=settings.OLLAMA_TIMEOUT
            )
            logger.info(f"Initialized LangChain Ollama client with model: {self.model}")
        except Exception as e:
            logger.error(f"Failed to initialize Ollama client: {e}")
            self.ollama_llm = None
        
        logger.info(f"Initialized enhanced LLM client with model: {self.model}, local: {self.use_local}")
    
    async def check_ollama_connection(self) -> bool:
        """
        Check if Ollama server is running and accessible.
        
        Returns:
            True if Ollama is accessible, False otherwise
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.local_url}/api/tags",
                    timeout=5.0
                )
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    available_models = [model["name"] for model in models]
                    logger.info(f"Ollama server accessible. Available models: {available_models}")
                    
                    # Check if our model is available
                    if not any(self.model in model_name for model_name in available_models):
                        logger.warning(f"Model {self.model} not found in available models: {available_models}")
                        return False
                    
                    return True
                else:
                    logger.error(f"Ollama server returned status: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to connect to Ollama server at {self.local_url}: {e}")
            return False
    
    async def pull_model_if_needed(self) -> bool:
        """
        Pull the model if it's not available locally.
        
        Returns:
            True if model is available, False otherwise
        """
        try:
            # Check if model is already available
            if await self.check_ollama_connection():
                return True
            
            logger.info(f"Pulling model {self.model} from Ollama...")
            
            # Pull the model
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.local_url}/api/pull",
                    json={"name": self.model},
                    timeout=300.0  # 5 minutes for model download
                )
                
                if response.status_code == 200:
                    logger.info(f"Successfully pulled model {self.model}")
                    return True
                else:
                    logger.error(f"Failed to pull model: {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error pulling model: {e}")
            return False
    
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """
        Generate text from the LLM based on the request.
        
        Args:
            request: The LLM request containing prompt and parameters
            
        Returns:
            LLM response with generated text
        """
        start_time = time.time()
        
        # Check cache first if enabled
        if settings.LLM_USE_CACHE:
            cache_key = self._get_cache_key(request)
            cached_response = self._get_from_cache(cache_key)
            if cached_response:
                logger.info(f"Cache hit for prompt: {request.prompt[:30]}...")
                cached_response.processing_time = time.time() - start_time
                return cached_response
        
        # Generate text based on configuration
        try:
            if self.use_local:
                # Check Ollama connection first
                if not await self.check_ollama_connection():
                    # Try to pull model if needed
                    if not await self.pull_model_if_needed():
                        raise Exception("Ollama server not accessible and model pull failed")
                
                response = await self._generate_local_enhanced(request)
            else:
                response = await self._generate_api(request)
                
            # Add to cache if enabled
            if settings.LLM_USE_CACHE:
                self._add_to_cache(cache_key, response)
                
            return response
            
        except Exception as e:
            logger.error(f"Error generating text from LLM: {str(e)}")
            # Return fallback response
            return LLMResponse(
                text="I'm sorry, I encountered an error and couldn't process your request. Please ensure Ollama is running locally with the required model.",
                finish_reason="error",
                model=self.model,
                usage={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
                processing_time=time.time() - start_time
            )
    
    async def _generate_local_enhanced(self, request: LLMRequest) -> LLMResponse:
        """
        Generate text using enhanced local Ollama integration with LangChain.
        
        Args:
            request: The LLM request
            
        Returns:
            LLM response with generated text
        """
        start_time = time.time()
        
        try:
            # Use LangChain Ollama client if available
            if self.ollama_llm:
                # Prepare prompt with system message
                full_prompt = request.prompt
                if request.system_message:
                    full_prompt = f"System: {request.system_message}\n\nUser: {request.prompt}"
                
                # Generate response
                response_text = await self.ollama_llm.ainvoke(full_prompt)
                
                # Estimate token usage (rough approximation)
                prompt_tokens = len(request.prompt.split()) + (len(request.system_message.split()) if request.system_message else 0)
                completion_tokens = len(response_text.split())
                
                return LLMResponse(
                    text=response_text,
                    finish_reason="stop",
                    model=self.model,
                    usage={
                        "prompt_tokens": prompt_tokens,
                        "completion_tokens": completion_tokens,
                        "total_tokens": prompt_tokens + completion_tokens
                    },
                    processing_time=time.time() - start_time
                )
            else:
                # Fallback to direct HTTP API
                return await self._generate_local(request)
                
        except Exception as e:
            logger.error(f"Error in enhanced local generation: {e}")
            # Fallback to original method
            return await self._generate_local(request)
    
    async def _generate_local(self, request: LLMRequest) -> LLMResponse:
        """
        Generate text using local LLaMA model via Ollama.
        
        Args:
            request: The LLM request
            
        Returns:
            LLM response with generated text
        """
        start_time = time.time()
        
        # Prepare request for Ollama API
        ollama_request = {
            "model": self.model,
            "prompt": request.prompt,
            "system": request.system_message or settings.DEFAULT_SYSTEM_MESSAGE,
            "options": {
                "temperature": request.temperature or 0.7,
                "num_predict": request.max_tokens or 1000,
            },
            "stream": False
        }
        
        if request.stop:
            ollama_request["options"]["stop"] = request.stop
            
        # Make request to Ollama
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.local_url}/api/generate",
                json=ollama_request,
                timeout=settings.OLLAMA_TIMEOUT
            )
            
            if response.status_code != 200:
                logger.error(f"Error from Ollama API: {response.text}")
                raise Exception(f"Ollama API error: {response.status_code}")
                
            result = response.json()
            
            # Parse Ollama response
            return LLMResponse(
                text=result.get("response", ""),
                finish_reason="stop",
                model=self.model,
                usage={
                    "prompt_tokens": result.get("prompt_eval_count", 0),
                    "completion_tokens": result.get("eval_count", 0),
                    "total_tokens": result.get("prompt_eval_count", 0) + result.get("eval_count", 0)
                },
                processing_time=time.time() - start_time
            )
    
    async def _generate_api(self, request: LLMRequest) -> LLMResponse:
        """
        Generate text using remote LLM API (like OpenAI).
        
        Args:
            request: The LLM request
            
        Returns:
            LLM response with generated text
        """
        start_time = time.time()
        
        # Prepare request for API
        api_request = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": request.system_message or settings.DEFAULT_SYSTEM_MESSAGE},
                {"role": "user", "content": request.prompt}
            ],
            "temperature": request.temperature or 0.7,
            "max_tokens": request.max_tokens or 1000,
            "stream": False
        }
        
        if request.stop:
            api_request["stop"] = request.stop
            
        # Set API headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
            
        # Make request to API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.api_url,
                json=api_request,
                headers=headers,
                timeout=settings.LLM_REQUEST_TIMEOUT
            )
            
            if response.status_code != 200:
                logger.error(f"Error from LLM API: {response.text}")
                raise Exception(f"LLM API error: {response.status_code}")
                
            result = response.json()
            
            # Parse API response
            return LLMResponse(
                text=result["choices"][0]["message"]["content"],
                finish_reason=result["choices"][0]["finish_reason"],
                model=result["model"],
                usage=result["usage"],
                processing_time=time.time() - start_time
            )
    
    def _get_cache_key(self, request: LLMRequest) -> str:
        """
        Generate a cache key for the request.
        
        Args:
            request: The LLM request
            
        Returns:
            Cache key string
        """
        # Create a cache key based on relevant request parameters
        key_dict = {
            "prompt": request.prompt,
            "system_message": request.system_message,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
            "model": self.model
        }
        return json.dumps(key_dict)
    
    def _get_from_cache(self, cache_key: str) -> Optional[LLMResponse]:
        """
        Get a response from the cache if it exists and is not expired.
        
        Args:
            cache_key: The cache key
            
        Returns:
            Cached LLM response or None if not found or expired
        """
        if cache_key not in self.cache:
            return None
            
        cache_entry = self.cache[cache_key]
        
        # Check if entry has expired
        if time.time() - cache_entry["timestamp"] > self.cache_ttl:
            # Remove expired entry
            del self.cache[cache_key]
            return None
            
        return cache_entry["response"]
    
    def _add_to_cache(self, cache_key: str, response: LLMResponse) -> None:
        """
        Add a response to the cache.
        
        Args:
            cache_key: The cache key
            response: The LLM response to cache
        """
        # Create cache entry with timestamp
        self.cache[cache_key] = {
            "response": response,
            "timestamp": time.time()
        }
        
        # Simple cache size management
        if len(self.cache) > settings.LLM_CACHE_MAX_ENTRIES:
            # Remove oldest entry
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]["timestamp"])
            del self.cache[oldest_key]

# Create a singleton instance
llm_client = LLMClient()
