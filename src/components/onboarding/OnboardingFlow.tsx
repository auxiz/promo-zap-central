
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Settings, 
  MessageSquare, 
  Users, 
  Zap,
  ChevronRight,
  X
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Sistema!',
      description: 'Vamos configurar tudo para você começar a usar todas as funcionalidades.',
      icon: Zap,
      content: (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Este guia rápido vai te ajudar a configurar suas integrações, 
            conectar o WhatsApp e criar suas primeiras automações.
          </p>
        </div>
      )
    },
    {
      id: 'configurations',
      title: 'Configure suas Integrações',
      description: 'Configure suas credenciais da Shopee e outras plataformas de afiliados.',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Integrações Disponíveis</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Shopee (Ativo)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                Amazon (Em Breve)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Magazine Luiza (Em Breve)
              </li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Comece configurando a Shopee para converter links de afiliado automaticamente.
          </p>
        </div>
      ),
      action: {
        label: 'Ir para Configurações',
        onClick: () => window.location.href = '/configuracoes'
      }
    },
    {
      id: 'whatsapp',
      title: 'Conecte o WhatsApp',
      description: 'Configure sua conexão com o WhatsApp para automações.',
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Funcionalidades do WhatsApp</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Monitoramento de grupos
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Envio automatizado de mensagens
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Templates personalizáveis
              </li>
            </ul>
          </div>
        </div>
      ),
      action: {
        label: 'Conectar WhatsApp',
        onClick: () => window.location.href = '/whatsapp-conexao'
      }
    },
    {
      id: 'groups',
      title: 'Configure seus Grupos',
      description: 'Adicione e configure os grupos que você quer monitorar e enviar mensagens.',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <h5 className="font-medium text-sm mb-1">Grupos Monitorados</h5>
              <p className="text-xs text-muted-foreground">
                Monitore atividade e mensagens
              </p>
            </div>
            <div className="border rounded-lg p-3">
              <h5 className="font-medium text-sm mb-1">Grupos de Envio</h5>
              <p className="text-xs text-muted-foreground">
                Envie mensagens automatizadas
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const nextStep = () => {
    markStepCompleted(currentStepData.id);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <currentStepData.icon className="h-5 w-5" />
                <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1} de {steps.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">{currentStepData.description}</p>
            {currentStepData.content}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-3">
              {currentStepData.action && (
                <Button 
                  variant="outline"
                  onClick={currentStepData.action.onClick}
                  className="flex items-center gap-2"
                >
                  {currentStepData.action.label}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              
              <Button onClick={nextStep} className="flex items-center gap-2">
                {isLastStep ? 'Finalizar' : 'Próximo'}
                {!isLastStep && <ArrowRight className="h-4 w-4" />}
                {isLastStep && <Check className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
