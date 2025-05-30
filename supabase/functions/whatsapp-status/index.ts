
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mock WhatsApp state for development
const whatsappState = new Map<string, {
  status: string;
  qrCode: string | null;
  device: string | null;
  connectedSince: number | null;
  disconnectedAt: number | null;
}>()

// Initialize default instance
whatsappState.set('default', {
  status: 'DISCONNECTED',
  qrCode: null,
  device: null,
  connectedSince: null,
  disconnectedAt: Date.now()
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const instanceId = url.searchParams.get('instanceId') || 'default'
    
    if (req.method === 'GET') {
      const endpoint = url.pathname.split('/').pop()
      
      switch (endpoint) {
        case 'status': {
          const state = whatsappState.get(instanceId) || whatsappState.get('default')!
          return new Response(JSON.stringify({
            status: state.status,
            connected: state.status === 'CONNECTED',
            device: state.device,
            since: state.connectedSince,
            disconnectedAt: state.disconnectedAt
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        case 'qrcode': {
          const state = whatsappState.get(instanceId) || whatsappState.get('default')!
          return new Response(JSON.stringify({
            qr: state.qrCode
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        case 'metrics': {
          return new Response(JSON.stringify({
            metrics: {
              uptime: Date.now() - 1000000,
              connectionState: whatsappState.get(instanceId)?.status || 'DISCONNECTED',
              messages: {
                sent: 0,
                received: 0,
                failed: 0
              },
              rateLimits: {
                warnings: [],
                lastWarning: null,
                isThrottled: false
              },
              reconnections: 0
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        case 'errors': {
          return new Response(JSON.stringify({
            errors: {
              connectionErrors: 0,
              qrCodeErrors: 0,
              retryAttempts: 0,
              lastError: null
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }
    
    if (req.method === 'POST') {
      const body = await req.json()
      const endpoint = url.pathname.split('/').pop()
      
      switch (endpoint) {
        case 'connect': {
          const state = whatsappState.get(instanceId) || whatsappState.get('default')!
          
          // Simulate connection process
          state.status = 'PENDING'
          state.qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`
          whatsappState.set(instanceId, state)
          
          // Simulate successful connection after 3 seconds
          setTimeout(() => {
            const currentState = whatsappState.get(instanceId)
            if (currentState && currentState.status === 'PENDING') {
              currentState.status = 'CONNECTED'
              currentState.device = 'Dispositivo de Desenvolvimento'
              currentState.connectedSince = Date.now()
              currentState.qrCode = null
              whatsappState.set(instanceId, currentState)
            }
          }, 3000)
          
          return new Response(JSON.stringify({ status: 'CONNECTING' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        case 'disconnect': {
          const state = whatsappState.get(instanceId) || whatsappState.get('default')!
          state.status = 'DISCONNECTED'
          state.device = null
          state.connectedSince = null
          state.disconnectedAt = Date.now()
          state.qrCode = null
          whatsappState.set(instanceId, state)
          
          return new Response(JSON.stringify({ status: 'DISCONNECTED' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }
    
    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    console.error('Error in whatsapp-status function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
