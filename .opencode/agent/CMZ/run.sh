#!/bin/bash
# CMZ Agent - Master Loop
# Coordinates the Self-Healing, Self-Learning, and Self-Evolving capabilities of the CMZ agent.

echo "🤖 [CMZ Agent] Initializing master coordination cycle..."

# Set execute permissions
chmod +x .opencode/agent/CMZ/self_heal.sh
chmod +x .opencode/agent/CMZ/self_learning.sh
chmod +x .opencode/agent/CMZ/self_evolve.sh

# Run Self-Evolve
.opencode/agent/CMZ/self_evolve.sh
if [ $? -ne 0 ]; then
  echo "❌ [CMZ Agent] Evolve cycle encountered errors."
fi

# Run Self-Learning
.opencode/agent/CMZ/self_learning.sh
if [ $? -ne 0 ]; then
  echo "❌ [CMZ Agent] Learning cycle encountered errors."
fi

# Run Self-Heal
.opencode/agent/CMZ/self_heal.sh
if [ $? -ne 0 ]; then
  echo "❌ [CMZ Agent] Healing cycle encountered errors."
fi

echo "🤖 [CMZ Agent] Master coordination cycle complete!"
exit 0
