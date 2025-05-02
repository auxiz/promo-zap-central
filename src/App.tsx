import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner";

function App({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}

export default App;
