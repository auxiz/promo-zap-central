
import { useState, useEffect } from 'react';

interface OnboardingState {
  isCompleted: boolean;
  isSkipped: boolean;
  currentStep: number;
  completedSteps: string[];
  showOnboarding: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isCompleted: false,
    isSkipped: false,
    currentStep: 0,
    completedSteps: [],
    showOnboarding: false
  });

  useEffect(() => {
    const savedState = localStorage.getItem('onboarding-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(parsed);
      } catch (error) {
        console.warn('Failed to parse onboarding state:', error);
      }
    } else {
      // Show onboarding for new users
      setState(prev => ({ ...prev, showOnboarding: true }));
    }
  }, []);

  const saveState = (newState: OnboardingState) => {
    localStorage.setItem('onboarding-state', JSON.stringify(newState));
    setState(newState);
  };

  const completeOnboarding = () => {
    const newState = {
      ...state,
      isCompleted: true,
      showOnboarding: false
    };
    saveState(newState);
  };

  const skipOnboarding = () => {
    const newState = {
      ...state,
      isSkipped: true,
      showOnboarding: false
    };
    saveState(newState);
  };

  const resetOnboarding = () => {
    const newState = {
      isCompleted: false,
      isSkipped: false,
      currentStep: 0,
      completedSteps: [],
      showOnboarding: true
    };
    saveState(newState);
  };

  const shouldShowOnboarding = () => {
    return state.showOnboarding && !state.isCompleted && !state.isSkipped;
  };

  return {
    state,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    shouldShowOnboarding
  };
}
