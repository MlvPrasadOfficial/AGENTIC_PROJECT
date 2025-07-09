"""
Debate Agent for the Enterprise Insights Copilot.

The Debate Agent is responsible for exploring multiple perspectives on analysis results,
challenging assumptions, and providing alternative viewpoints to enhance the robustness
of insights and recommendations.
"""

import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

from ..agents.base import BaseAgent
from ..llm.llm_client import LLMClient
from ..schemas.file import DataProfile, AnalysisResult
from ..utils.prompts import DEBATE_PROMPTS
from ..utils.logger import get_logger

logger = get_logger(__name__)


class DebateAgent(BaseAgent):
    """
    Agent that debates and challenges analysis results to provide multiple perspectives.
    
    This agent takes insights and recommendations from previous agents and:
    1. Challenges assumptions made in the analysis
    2. Provides alternative interpretations of data
    3. Identifies potential biases or limitations
    4. Generates counter-arguments and alternative perspectives
    5. Evaluates the strength of evidence for conclusions
    """

    def __init__(self, llm_client: LLMClient):
        """
        Initialize the Debate Agent.
        
        Args:
            llm_client: LLM client for generating debate arguments
        """
        super().__init__(llm_client)
        self.name = "debate_agent"
        self.description = "Debates and challenges analysis results to provide multiple perspectives"
        
    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run the debate agent to challenge and provide alternatives to analysis results.
        
        Args:
            state: Current workflow state containing analysis results
            
        Returns:
            Updated state with debate results and alternative perspectives
        """
        try:
            logger.info(f"Starting {self.name} execution")
            
            # Extract required data from state
            analysis_results = state.get("analysis_results", {})
            insights = state.get("insights", [])
            data_profile = state.get("data_profile", {})
            
            if not analysis_results and not insights:
                logger.warning("No analysis results or insights found in state")
                return state
                
            # Generate debate arguments
            debate_results = await self._generate_debate_arguments(
                analysis_results, insights, data_profile
            )
            
            # Challenge key assumptions
            challenged_assumptions = await self._challenge_assumptions(
                analysis_results, insights
            )
            
            # Provide alternative interpretations
            alternative_perspectives = await self._generate_alternative_perspectives(
                analysis_results, insights, data_profile
            )
            
            # Evaluate evidence strength
            evidence_evaluation = await self._evaluate_evidence_strength(
                analysis_results, insights
            )
            
            # Compile debate results
            debate_summary = {
                "debate_arguments": debate_results,
                "challenged_assumptions": challenged_assumptions,
                "alternative_perspectives": alternative_perspectives,
                "evidence_evaluation": evidence_evaluation,
                "debate_timestamp": datetime.now().isoformat(),
                "agent_name": self.name
            }
            
            # Update state
            state["debate_results"] = debate_summary
            state["last_agent"] = self.name
            
            logger.info(f"Completed {self.name} execution successfully")
            return state
            
        except Exception as e:
            logger.error(f"Error in {self.name}: {str(e)}")
            state["errors"] = state.get("errors", []) + [f"Debate Agent error: {str(e)}"]
            return state
    
    async def _generate_debate_arguments(
        self, 
        analysis_results: Dict[str, Any], 
        insights: List[Dict[str, Any]],
        data_profile: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate debate arguments challenging the analysis results.
        
        Args:
            analysis_results: Results from previous analysis
            insights: Generated insights
            data_profile: Data profile information
            
        Returns:
            List of debate arguments with counter-points
        """
        try:
            # Prepare context for debate generation
            context = {
                "analysis_results": analysis_results,
                "insights": insights,
                "data_profile": data_profile,
                "dataset_info": {
                    "columns": data_profile.get("columns", []),
                    "row_count": data_profile.get("row_count", 0),
                    "data_types": data_profile.get("column_types", {}),
                    "missing_values": data_profile.get("missing_values", {})
                }
            }
            
            # Generate debate arguments using LLM
            prompt = DEBATE_PROMPTS["generate_arguments"].format(
                context=json.dumps(context, indent=2)
            )
            
            response = await self.llm_client.generate_response(prompt)
            
            # Parse and structure debate arguments
            debate_arguments = await self._parse_debate_arguments(response)
            
            logger.info(f"Generated {len(debate_arguments)} debate arguments")
            return debate_arguments
            
        except Exception as e:
            logger.error(f"Error generating debate arguments: {str(e)}")
            return []
    
    async def _challenge_assumptions(
        self, 
        analysis_results: Dict[str, Any], 
        insights: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Challenge key assumptions made in the analysis.
        
        Args:
            analysis_results: Results from previous analysis
            insights: Generated insights
            
        Returns:
            List of challenged assumptions with alternative explanations
        """
        try:
            # Extract assumptions from insights and analysis
            assumptions = []
            
            # Look for implicit assumptions in insights
            for insight in insights:
                if "assumptions" in insight:
                    assumptions.extend(insight["assumptions"])
                    
            # Generate challenges using LLM
            prompt = DEBATE_PROMPTS["challenge_assumptions"].format(
                assumptions=json.dumps(assumptions, indent=2),
                analysis_results=json.dumps(analysis_results, indent=2)
            )
            
            response = await self.llm_client.generate_response(prompt)
            
            # Parse challenged assumptions
            challenged_assumptions = await self._parse_challenged_assumptions(response)
            
            logger.info(f"Challenged {len(challenged_assumptions)} assumptions")
            return challenged_assumptions
            
        except Exception as e:
            logger.error(f"Error challenging assumptions: {str(e)}")
            return []
    
    async def _generate_alternative_perspectives(
        self, 
        analysis_results: Dict[str, Any], 
        insights: List[Dict[str, Any]],
        data_profile: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate alternative perspectives and interpretations.
        
        Args:
            analysis_results: Results from previous analysis
            insights: Generated insights
            data_profile: Data profile information
            
        Returns:
            List of alternative perspectives
        """
        try:
            # Prepare context for alternative perspectives
            context = {
                "analysis_results": analysis_results,
                "insights": insights,
                "data_profile": data_profile
            }
            
            # Generate alternative perspectives using LLM
            prompt = DEBATE_PROMPTS["alternative_perspectives"].format(
                context=json.dumps(context, indent=2)
            )
            
            response = await self.llm_client.generate_response(prompt)
            
            # Parse alternative perspectives
            alternatives = await self._parse_alternative_perspectives(response)
            
            logger.info(f"Generated {len(alternatives)} alternative perspectives")
            return alternatives
            
        except Exception as e:
            logger.error(f"Error generating alternative perspectives: {str(e)}")
            return []
    
    async def _evaluate_evidence_strength(
        self, 
        analysis_results: Dict[str, Any], 
        insights: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluate the strength of evidence supporting conclusions.
        
        Args:
            analysis_results: Results from previous analysis
            insights: Generated insights
            
        Returns:
            Evidence evaluation with strength ratings
        """
        try:
            # Prepare evidence for evaluation
            evidence_items = []
            
            # Extract evidence from insights
            for insight in insights:
                if "evidence" in insight:
                    evidence_items.extend(insight["evidence"])
                    
            # Evaluate evidence strength using LLM
            prompt = DEBATE_PROMPTS["evaluate_evidence"].format(
                evidence=json.dumps(evidence_items, indent=2),
                analysis_results=json.dumps(analysis_results, indent=2)
            )
            
            response = await self.llm_client.generate_response(prompt)
            
            # Parse evidence evaluation
            evaluation = await self._parse_evidence_evaluation(response)
            
            logger.info("Completed evidence strength evaluation")
            return evaluation
            
        except Exception as e:
            logger.error(f"Error evaluating evidence strength: {str(e)}")
            return {}
    
    async def _parse_debate_arguments(self, response: str) -> List[Dict[str, Any]]:
        """Parse LLM response into structured debate arguments."""
        try:
            # Try to parse as JSON first
            if response.strip().startswith('[') or response.strip().startswith('{'):
                return json.loads(response)
            
            # If not JSON, parse as text and structure
            lines = response.strip().split('\n')
            arguments = []
            current_argument = {}
            
            for line in lines:
                line = line.strip()
                if line.startswith('Argument:'):
                    if current_argument:
                        arguments.append(current_argument)
                    current_argument = {"argument": line[9:].strip()}
                elif line.startswith('Counter-point:'):
                    current_argument["counter_point"] = line[13:].strip()
                elif line.startswith('Evidence:'):
                    current_argument["evidence"] = line[9:].strip()
                elif line.startswith('Strength:'):
                    current_argument["strength"] = line[9:].strip()
            
            if current_argument:
                arguments.append(current_argument)
                
            return arguments
            
        except Exception as e:
            logger.error(f"Error parsing debate arguments: {str(e)}")
            return []
    
    async def _parse_challenged_assumptions(self, response: str) -> List[Dict[str, Any]]:
        """Parse LLM response into structured challenged assumptions."""
        try:
            # Try to parse as JSON first
            if response.strip().startswith('[') or response.strip().startswith('{'):
                return json.loads(response)
            
            # If not JSON, parse as text and structure
            lines = response.strip().split('\n')
            challenges = []
            current_challenge = {}
            
            for line in lines:
                line = line.strip()
                if line.startswith('Assumption:'):
                    if current_challenge:
                        challenges.append(current_challenge)
                    current_challenge = {"assumption": line[11:].strip()}
                elif line.startswith('Challenge:'):
                    current_challenge["challenge"] = line[10:].strip()
                elif line.startswith('Alternative:'):
                    current_challenge["alternative"] = line[12:].strip()
                elif line.startswith('Risk:'):
                    current_challenge["risk"] = line[5:].strip()
            
            if current_challenge:
                challenges.append(current_challenge)
                
            return challenges
            
        except Exception as e:
            logger.error(f"Error parsing challenged assumptions: {str(e)}")
            return []
    
    async def _parse_alternative_perspectives(self, response: str) -> List[Dict[str, Any]]:
        """Parse LLM response into structured alternative perspectives."""
        try:
            # Try to parse as JSON first
            if response.strip().startswith('[') or response.strip().startswith('{'):
                return json.loads(response)
            
            # If not JSON, parse as text and structure
            lines = response.strip().split('\n')
            perspectives = []
            current_perspective = {}
            
            for line in lines:
                line = line.strip()
                if line.startswith('Perspective:'):
                    if current_perspective:
                        perspectives.append(current_perspective)
                    current_perspective = {"perspective": line[12:].strip()}
                elif line.startswith('Rationale:'):
                    current_perspective["rationale"] = line[10:].strip()
                elif line.startswith('Implications:'):
                    current_perspective["implications"] = line[13:].strip()
                elif line.startswith('Confidence:'):
                    current_perspective["confidence"] = line[11:].strip()
            
            if current_perspective:
                perspectives.append(current_perspective)
                
            return perspectives
            
        except Exception as e:
            logger.error(f"Error parsing alternative perspectives: {str(e)}")
            return []
    
    async def _parse_evidence_evaluation(self, response: str) -> Dict[str, Any]:
        """Parse LLM response into structured evidence evaluation."""
        try:
            # Try to parse as JSON first
            if response.strip().startswith('{'):
                return json.loads(response)
            
            # If not JSON, parse as text and structure
            lines = response.strip().split('\n')
            evaluation = {
                "overall_strength": "medium",
                "evidence_items": [],
                "weaknesses": [],
                "recommendations": []
            }
            
            current_section = None
            for line in lines:
                line = line.strip()
                if line.startswith('Overall Strength:'):
                    evaluation["overall_strength"] = line[17:].strip().lower()
                elif line.startswith('Evidence Items:'):
                    current_section = "evidence_items"
                elif line.startswith('Weaknesses:'):
                    current_section = "weaknesses"
                elif line.startswith('Recommendations:'):
                    current_section = "recommendations"
                elif line.startswith('-') and current_section:
                    evaluation[current_section].append(line[1:].strip())
            
            return evaluation
            
        except Exception as e:
            logger.error(f"Error parsing evidence evaluation: {str(e)}")
            return {"overall_strength": "unknown", "evidence_items": [], "weaknesses": [], "recommendations": []}
