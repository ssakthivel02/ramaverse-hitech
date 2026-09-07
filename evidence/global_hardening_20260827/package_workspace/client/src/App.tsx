import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LibraryProvider } from "./contexts/LibraryContext";
import { MultilingualProvider, stripLocalePrefix, useTranslation } from "./contexts/MultilingualContext";
import { focusMainContent } from "./lib/accessibility";
const Home = lazy(() => import("./pages/Home"));
const Kandas = lazy(() => import("./pages/Kandas"));
const Wisdom = lazy(() => import("./pages/Wisdom"));
const Characters = lazy(() => import("./pages/Characters"));
const Places = lazy(() => import("./pages/Places"));
const Guidance = lazy(() => import("./pages/Guidance"));
const Stories = lazy(() => import("./pages/Stories"));
const Quizzes = lazy(() => import("./pages/Quizzes"));
const Audio = lazy(() => import("./pages/Audio"));
const SearchPage = lazy(() => import("./pages/Search"));
const AskRamaVerse = lazy(() => import("./pages/AskRamaVerse"));
const Intelligence = lazy(() => import("./pages/Intelligence"));
const Library = lazy(() => import("./pages/Library"));
const Journey = lazy(() => import("./pages/Journey"));
const Timeline = lazy(() => import("./pages/Timeline"));
const KnowledgeGraph = lazy(() => import("./pages/KnowledgeGraph"));
const RamaLife = lazy(() => import("./pages/RamaLife"));
const SargaReader = lazy(() => import("./pages/SargaReader"));
const ReconciliationWorkbench = lazy(() => import("./pages/ReconciliationWorkbench"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function Router() {
  const [location] = useLocation();
  const { language, setLanguage } = useTranslation();
  const normalized = stripLocalePrefix(location);

  // A locale in the URL is authoritative for the interface; legacy unprefixed
  // routes remain valid and continue using the persisted interface locale.
  useEffect(() => {
    if (normalized.language && normalized.language !== language) setLanguage(normalized.language);
  }, [language, normalized.language, setLanguage]);

  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0b101b] px-6 py-24 text-center text-sm text-[#d4af37]">Preparing RamaVerse…</main>}>
      <Switch location={normalized.path}>
      <Route path={"/"} component={Home} />
      <Route path={"/kandas"} component={Kandas} />
      <Route path={"/wisdom"} component={Wisdom} />
      <Route path={"/characters"} component={Characters} />
      <Route path={"/places"} component={Places} />
      <Route path={"/guidance"} component={Guidance} />
      <Route path={"/stories"} component={Stories} />
      <Route path={"/quizzes"} component={Quizzes} />
      <Route path={"/audio"} component={Audio} />
      <Route path={"/search"} component={SearchPage} />
      <Route path={"/ask"} component={AskRamaVerse} />
      <Route path={"/intelligence"} component={Intelligence} />
      <Route path={"/library"} component={Library} />
      <Route path={"/journey"} component={Journey} />
      <Route path={"/timeline"} component={Timeline} />
      <Route path={"/knowledge"} component={KnowledgeGraph} />
      <Route path={"/rama-life"} component={RamaLife} />
      <Route path={"/sargas/:recordKey"} component={SargaReader} />
      <Route path={"/reconciliation"} component={ReconciliationWorkbench} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <MultilingualProvider>
          <LibraryProvider>
            <TooltipProvider>
              <a className="skip-link" href="#main-content" onClick={focusMainContent}>Skip to main content</a>
              <Toaster />
              <div id="main-content" tabIndex={-1} className="outline-none"><Router /></div>
            </TooltipProvider>
          </LibraryProvider>
        </MultilingualProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
