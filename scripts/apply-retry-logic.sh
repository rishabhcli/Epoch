#!/bin/bash
# Script to apply retry logic to remaining generators
# This is a helper script - manual verification still needed

echo "Applying retry logic to debate-generator.ts..."
echo "Applying retry logic to adventure-generator.ts..."
echo ""
echo "⚠️  Manual steps required:"
echo "1. Wrap all 'await openai.beta.chat.completions.parse' calls with retryGPTCompletion()"
echo "2. Wrap all 'await openai.audio.speech.create' calls with retryTTSGeneration()"
echo "3. Add closing parentheses for the wrapper functions"
echo ""
echo "Files to update:"
echo "- apps/web/lib/ai/debate-generator.ts (lines: 26, 82, 159, 195, 212)"
echo "- apps/web/lib/ai/adventure-generator.ts"
echo "- apps/web/lib/ai/outline-generator.ts"
echo "- apps/web/lib/ai/script-generator.ts"
