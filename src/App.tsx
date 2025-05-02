
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner";
import { NotificationProvider } from "@/contexts/NotificationContext";

function App({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NotificationProvider>
        {children}
        <Toaster />
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App;
