# Agent Panel UI Update Plan
Date: 2025-07-08
Author: GitHub Copilot

## Current State Analysis

Based on the screenshot shared, the current UI implementation of the agent pipeline has the following issues:

1. **Incorrect agent names**:
   - "Data Agent" instead of "File Upload Agent"
   - "Cleaner Agent" instead of "Data Profile Agent"
   - "Chart Agent" emoji appears as a placeholder (�) instead of 📊

2. **Incorrect agent order**:
   - The current order does not match structure/11.txt
   - There's an extra "Query Agent" that should be removed
   - The Debate Agent appears in the wrong position

3. **Technical issues**:
   - Some imports are missing or not found
   - Some emoji characters aren't displaying properly

## Update Plan

### 1. Agent Naming & Order Standardization

The correct agent order and names should be:
1. File Upload Agent (was Data Agent)
2. Data Profile Agent (was Cleaner Agent)
3. Planning Agent (unchanged)
4. Insight Agent (position changed)
5. Viz Agent (was Chart Agent)
6. Critique Agent (position changed)
7. Debate Agent (position changed)
8. Report Agent (unchanged)

### 2. Required Code Changes

a. **Update imports**:
   - Remove unused imports (QuestionIcon, SqlIcon, NarrativeIcon)
   - Fix any missing icon imports

b. **Update agent names**:
   - Change "Data Agent" to "File Upload Agent"
   - Change "Cleaner Agent" to "Data Profile Agent"
   - Fix the Viz Agent emoji (📊)

c. **Update agent order**:
   - Remove the "Query Agent" component
   - Reorder the agents to match the structure/11.txt specification

d. **Fix dependencies**:
   - Update dependency references (e.g., "Cleaner Agent" to "Data Profile Agent")
   - Ensure the dependency chain reflects the correct agent order

### 3. Implementation Steps

1. Fix imports in page.tsx to remove unused ones
2. Update agent names and emojis
3. Remove the Query Agent component
4. Reorder the agent components to match the specification
5. Update all dependency references

### 4. Testing & Verification

After implementation:
1. Verify all 8 agents appear in the correct order
2. Ensure all agent names match the specification
3. Check that dependencies are correctly referenced
4. Verify all icons display properly

## Long-term Solutions

To prevent future inconsistencies:
1. Create a shared constants file with the official agent names and order
2. Implement a configuration-driven approach for the agent pipeline
3. Add visual indicators of agent order (e.g., numbers)
4. Consider generating the agent UI from a central configuration
